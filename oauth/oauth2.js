'use strict';

var oauth2orize = require('oauth2orize');
var login = require('connect-ensure-login');
var config = require('./config');
var db = require('sample-db');
var uuid = require('node-uuid');
var passport = require('passport');
var snowflake = require('node-snowflake').Snowflake;
var server = oauth2orize.createServer();
var moment = require('moment');

// 認可コードグラント
server.grant(oauth2orize.grant.code(function(client, redirectURI, user, ares, done) {
  var authCode = uuid.v4();
  // 認可コードを発行して永続化する
  var params = {
    authCode: authCode,
    clientId: client.clientId,
    userId: user.userId,
    redirectUri: redirectURI,
    expires: config.authorizationCode.expires,
    scope: ares.scope
  };
  var query = db.insert('authorization_code', params);

  query.then(function() {
    done(null, authCode);
  }).catch(function(err) {
    done(err);
  });

}));

// 認可コードからアクセストークンを発行
server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  console.log('start accesstoken create ');
  var entity;
  var accessTokenId;
  var accessToken;
  var refreshToken;
  db.connection.beginTransaction(function(err) {
    if (err) { throw err; }
    var query = db.getOne('select * from authorization_code where auth_code = ?', code);
    query.then(function(authorizationCodeEntity) {
      if (!authorizationCodeEntity) {
        return Promise.reject('access_denied');
      }
      // token生成時に使用するため、SELECT結果を退避
      entity = authorizationCodeEntity;

      // 認可コードテーブルの削除
      var params = {authCode: code};
      return db.delete('authorization_code', params);

    }).then(function() {

      // アクセストークン登録
      accessTokenId = snowflake.nextId();
      accessToken  = uuid.v4();
      refreshToken = uuid.v4();
      var params = {
        accessTokenId: accessTokenId,
        accessToken: accessToken,
        accessTokenExpires: moment().add(config.token.expiresIn, 'seconds').format('YYYY-MM-DD HH:mm:ss.SSS'),
        refreshToken: refreshToken,
        refreshTokenExpires: moment().add(config.token.expiresIn, 'seconds').format('YYYY-MM-DD HH:mm:ss.SSS'),
        userId: entity.userId,
        clientId: client.clientId,
      };

      return db.insert('access_token', params);

    }).then(function() {
      var scopes = entity.scope.split(',');
      var scopeMst = require('./scope.json');
      var bitScope = {read:0, write:0 };
      for(var i = 0; i < scopes.length; i++ ) {
        // scopeを[read/write]:[対象スコープ]に分割
        var [vector, scope] = scopes[i].split(':');
        bitScope[vector] |= parseInt(scopeMst[vector][scope], 2);
      }
      // read権限のInsert
      if (bitScope['read'] !== 0) {
        var params = {
          accessTokenId: accessTokenId,
          vector: scopeMst['vectorMap']['read'],
          scope: bitScope['read']
        };
        db.insert('scope', params).then(function() {
          // 何もしない
        }).catch(function(err) {
          throw err;
        });
      }
      // write権限のInsert
      if (bitScope['write'] !== 0) {
        var params = {
          accessTokenId: accessTokenId,
          vector: scopeMst['vectorMap']['write'],
          scope: bitScope['write']
        };
        db.insert('scope', params).then(function() {
          // 何もしない
        }).catch(function(err) {
          throw err;
        });
      }
    }).then(function() {
      db.connection.commit(function(err) {
        if (err) {
          db.connection.rollback(function() {
            throw err;
          });
        }
      });
      done(null, accessToken, refreshToken, config.token.expiresIn);
    }).catch(function (err) {
      db.connection.rollback(function() {
        console.error(err);
        done(null, false, err);
      });
    });
  });
}));

// リフレッシュトークンを元にアクセストークンを発行
server.exchange(oauth2orize.exchange.refreshToken(function(client, refreshToken, scope, done) {
  var newAccessToken;
  var newRefreshToken;
  // リフレッシュトークンの正当性チェック
  db.connection.beginTransaction(function(err) {
    if (err) { throw err; }
    var query = db.getOne('select * from access_token where refresh_token = ?', refreshToken);
    query.then(function(findRefreshToken) {
      if (!findRefreshToken) {
        return Promise.reject('Invalid refresh Token');
      }
      // アクセストークンの更新
      newAccessToken  = uuid.v4();
      newRefreshToken = uuid.v4();
      var fields = {
        accessToken: newAccessToken,
        accessTokenExpires: moment().add(config.token.expiresIn, 'seconds').format('YYYY-MM-DD HH:mm:ss.SSS'),
        refreshToken: newRefreshToken,
        refreshTokenExpires: moment().add(config.token.expiresIn, 'seconds').format('YYYY-MM-DD HH:mm:ss.SSS'),
      };
      console.log(JSON.stringify(findRefreshToken));
      var where = {accessTokenId: findRefreshToken.accessTokenId};
      return db.update('access_token', fields, where);
    }).then(function() {
      db.connection.commit(function(err) {
        if (err) {
          db.connection.rollback(function() {
            throw err;
          });
        }
      });
      done(null, newAccessToken, newRefreshToken, config.token.expiresIn);
    }).catch(function(err) {
      console.error(err);
      done(null, false);
    });
  });
}));

// アプリケーション認証画面の表示
exports.authorization = [
  login.ensureLoggedIn(),
  server.authorization(function(clientId, redirectURI, scope, done) {
    var query = db.getOne('select * from client where client_id = ?', clientId);
    query.then(function(client) {
      if (!client) {
        return Promise.reject('Missing clients.');
      }
      client.scope = scope;
      return done(null, client, redirectURI);
    }).catch(function(err) {
      console.error(err);
      return done(null, false);
    });
  }),
  function (req, res, next) {
    res.render('dialog',{
      transactionID: req.oauth2.transactionID,
      user: req.user,
      client: req.oauth2.client
    });
  }
];

// リソースアクセス許可時の処理
exports.decision = [
  login.ensureLoggedIn(),
  server.decision(function(req, done) {
    return done(null, { scope: req.body.scope });
  })
];

// トークン発行
exports.token = [
  passport.authenticate(['basic', 'oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler(),
];

// クライアントのシリアライズ
server.serializeClient(function(client, done) {
  done(null, client.clientId);
});

// クライアントのデシリアライズ
server.deserializeClient(function(id, done) {
  var query = db.getOne('select * from client where client_id = ?', id);
  query.then(function(row) {
    done(null, row);
  });
});
