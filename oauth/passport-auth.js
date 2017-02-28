'use strict';

// require modules
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var BearerStrategy = require('passport-http-bearer').Strategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var db = require('sample-db');
var moment = require('moment');

// ログイン時のローカル認証設定
passport.use(new LocalStrategy({passReqToCallback:true }, function(req, username, password, done) {
  // ユーザー検索
  var query = db.getOne('select * from account where screen_name = ?', username);

  query.then(function(row) {
    if (!row) {
      // ユーザーが見つからない場合
      req.flash('error', 'invalid username or password');
      done(null, false);
    } else {
      // パスワード不一致
      if(row.password !== password ) {
        req.flash('error', 'invalid username or password');
        done(null, false);
      } else {
        // 処理成功
        done(null, row);
      }
    }
  }).catch(function (error) {
    done(error);
  });
}));

// BASIC認証設定
passport.use(new BasicStrategy(function(clientId, clientSecret, done) {
  var query = db.getOne('select * from client where client_id = ? and client_secret = ?', [clientId, clientSecret]);
  query.then(function(row) {
    if (!row) {
      done(null, false);
    }
    done(null, row);
  }).catch(function(err) {
    done(null, false, err);
  });
}));

// クライアント・パスワード認証
passport.use(new ClientPasswordStrategy(function(clientId, clientSecret, done)  {
  var query = db.getOne('select * from client where client_id = ? and client_secret = ?', [clientId, clientSecret]);
  query.then(function(row) {
    if (!row) {
      return done(null, false);
    }
    return done(null, row);
  }).catch(function(err) {
    return done(err, false);
  });
}));

// Bearerトークンのチェック
passport.use(new BearerStrategy(function(accessToken, done) {
  var token;
  var user;
  var scope;
  var query = db.getOne('select * from access_token where access_token = ?', accessToken);
  query.then(function(tokenEntity) {
    // トークンが見つからない場合
    if (!tokenEntity) {
      return Promise.reject();
    }
    // トークンの期限切れ
    if (moment(tokenEntity.accessTokenExpires).isBefore(moment()) ) {
      console.log(moment(tokenEntity.accessTokenExpires));
      return Promise.reject('The access token expired');
    }
    token = tokenEntity;
    return db.getOne('select * from account where user_id = ?', tokenEntity.userId);
  }).then(function(userEntity) {
    if (!userEntity) {
      return done(null, false);
    }
    user = userEntity;
    return db.query('select * from scope where access_token_id = ?', token.accessTokenId);
  }).then(function(scopes) {
    return done(null, user, {token: token, scopes: scopes});
  }).catch(function(err) {
    return done(null, false, err);
  });
}));
// ユーザーのシリアライズ
// (セッションへの格納)
passport.serializeUser(function(user, done) {
  done(null, user.userId);
});

// ユーザーのデシリアライズ
// セッションに格納しているIDからユーザー情報の復元
passport.deserializeUser(function(id, done) {
  // TODO 後で実装
  var query = db.getOne('select * from account where user_id = ?', id);
  query.then(function(row) {
    done(null, row);
  });
});
