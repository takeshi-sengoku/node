'use strict';

// require modules
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var BasicStrategy = require('passport-http').BasicStrategy;
var ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy;
var db = require('sample-db');

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
  var query = db.getOne('select * from client where client_id = ? and client_secret = ?', clientId, clientSecret);
  query.then(function(row) {
    if (!row) {
      done(null, false);
    }
    done(null, row);
  }).catch(function(err) {
    done(null, false);
  });
}));

// クライアント・パスワード認証
passport.use(new ClientPasswordStrategy(function(clientId, clientSecret, done)  {
  var query = db.getOne('select * from client where client_id = ? and client_secret = ?', [clientId, clientSecret]);
  query.then(function(row) {
    if (!row) {
      done(null, false);
    }
    done(null, row);
  }).catch(function(err) {
    done(err, false);
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
