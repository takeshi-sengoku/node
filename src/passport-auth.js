'use strict';

var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var db = require('sample-db');
var request = require('request');
var socketClient = require('socket.io-client');


passport.use(new BearerStrategy(function(accessToken, done) {
  var headers = {
    'Authorization': 'Bearer ' + accessToken
  };

  var options = {
    // TODO OAuthサーバーの正しいパスをセットする
    url: 'http://192.168.56.101:3000/bearar',
    method: 'GET',
    headers: headers
  };

  request(options, function(err, response, body) {
    if (err) {
      console.error(err);
    }
    console.log(JSON.stringify(response));
    if (response.statusCode == 200) {
      return done(null, body.userEntity, body.tokenInfo);
    } else {
      console.error(body);
      return done(null, false);
    }
  });

//  var query = db.getOne('select * from access_token where token_id = ?', accessToken);
//  query.then(function(tokenEntity) {
//    // トークン存在チェック
//    if (!tokenEntity) {
//      throw new Error('Missing access_token');
//    }
//    // TODO 有効期限のチェック
//    tokenInfo = tokenEntity;
//    return db.query('select * from users where user_id = ?', tokenInfo.userId);
//  }).then(function(userEntity) {
//    if(!userEntity) {
//      return done(null, false);
//    }
//    done(null, userEntity, tokenInfo);
//  }).catch(function(err) {
//    console.error(err);
//    done(null, false);
//  });
}));
