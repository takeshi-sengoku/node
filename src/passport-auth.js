'use strict';

var passport = require('passport');
var BearerStrategy = require('passport-http-bearer').Strategy;
var db = require('sample-db');
var request = require('request');


passport.use(new BearerStrategy(function(accessToken, done) {
  var headers = {
    'Authorization': 'Bearer ' + accessToken
  };

  var options = {
    url: 'http://192.168.56.101:3000/oauth/bearer',
    method: 'GET',
    headers: headers
  };

  request(options, function(err, response, body) {
    if (err) {
      return done(null, false);
    }
    if (response.statusCode == 200 && body) {
      var bodyObj = JSON.parse(body);
      return done(null, bodyObj.userEntity, bodyObj.tokenInfo);
    } else {
      return done(null, false, 'invalid token');
    }
  });
}));
