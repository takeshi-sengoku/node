'use strict';

var oauth2orize = require('oauth2orize');
var login = require('connect-ensure-login');
var config = require('./config');
var db = require('sample-db');
var uuid = require('node-uuid');
var passport = require('passport');

var server = oauth2orize.createServer();

// 認可コードグラント
server.grant(oauth2orize.grant.code(function(client, redirectURI, user, args, done) {
  var authCode = uuid.v4();
  // 認可コードを発行して永続化する
  var params = {
    code: authCode,
    client_id: client.id,
    redirecturi: redirectURI,
    user_id: user.userId,
    scope: args.scope
  };
  var query = db.insert('authorizationcode', params);

  query.then(function() {
    done(null, authCode);
  }).catch(function(err) {
    done(err);
  });

}));

server.exchange(oauth2orize.exchange.code(function(client, code, redirectURI, done) {
  var entity;
  var accessToken;
  var refreshToken;
  db.connection.beginTransaction(function(err) {
    if (err) { throw err; }
    var query = db.getOne('select * from authorizationcode where code = ?', code);
    query.then(function(authorizationCodeEntity) {
      if (!authorizationCodeEntity) {
        reject('認可コードが見つかりません');
      }
      // token生成時に使用するため、SELECT結果を退避
      entity = authorizationCodeEntity;

      // 認可コードテーブルの削除
      var params = {code: code};
      return db.delete('authorizationcode', params);

    }).then(function() {

      // アクセストークン登録
      accessToken = uuid.v4();
      var params = {
        token_id: accessToken,
        expire: config.token.expiresIn,
        user_id: entity.userId,
        client_id: client.clientId,
        scope: entity.scope
      };

      return db.insert('oauth_token', params);
    
    }).then(function() {
    
      // リフレッシュトークン登録
      refreshToken = uuid.v4();
      var params = {
        token_id: refreshToken,
        user_id: entity.userId,
        client_id: client.clientId
      };

      return db.insert('refresh_token', params);
    
    }).then(function() {
      db.connection.commit(function(err) {
        if (err) {
          db.connection.rollback(function() {
            throw err;
          });
        }
      });
      done(null, accessToken, refreshToken, 1000000);
    }).catch(function (err) {
      db.connection.rollback(function() {
        done(null, false);
      });
    });
  });
}));
// アプリケーション認証画面の表示
exports.authorization = [
  login.ensureLoggedIn(),
  server.authorization(function(clientId, redirectURI, scope, done) {
    var query = db.getOne('select * from oauth_clients where client_id = ?', clientId);
    query.then(function(client) {
      if (!client) {
        return done(null, false);
      }
      client.scope = scope;
      return done(null, client, redirectURI);
    }).catch(function(err) {
      return done(err);
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
  passport.authenticate(['oauth2-client-password'], { session: false }),
  server.token(),
  server.errorHandler(),
];

// クライアントのシリアライズ
server.serializeClient(function(client, done) {
  done(null, client.clientId);
});

// クライアントのデシリアライズ
server.deserializeClient(function(id, done) {
  var query = db.getOne('select * from oauth_clients where client_id = ?', id);
  query.then(function(row) {
    done(null, row);
  });
});
