'use strict';

// require modules
var bodyParser = require('body-parser');
var flash = require('connect-flash');
var ect = require('ect');
var express = require('express');
var login = require('connect-ensure-login');
var util = require('util');
var oauth2 = require('./oauth2');
var passport = require('passport');
var session = require('express-session');

// Create an Express application.
var app = express();

// Template Engine setup
var ectRenderer = ect({ watch: true, root: __dirname + '/views', ext : '.ect' });
app.set('view engine', 'ect');
app.engine('ect', ectRenderer.render);

// ---------------------------------------------------------
// Middleware settings
// ---------------------------------------------------------
app.use(flash());
// Session configuration
app.use(session({
  secret: 's3Cur3',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId'
}));

// Add body parser.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());
require('./passport-auth');

// ---------------------------------------------------------
// ルーティング処理
// ---------------------------------------------------------
// ログインページ
app.get('/login', function(req, res, next) {
  res.render('login', {error: req.flash('error')});
});

// ログインページ(ログインボタン押下)
app.post('/login', 
  passport.authenticate('local',{ 
    successReturnToOrRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
  })
);

// 動作検証用(OAuthの仕組としては不要なURL)
app.get('/', 
  login.ensureLoggedIn(),
  function(req, res, next) {
    if(req.query.code) {
      res.render('top-with-code', {code: req.query.code});
    } else {
      res.render('top');
    }
});
// アプリケーション認証画面の表示
app.get('/oauth/authorize', oauth2.authorization);

// 認可コード
app.post('/oauth/authorize', oauth2.decision);

// トークンの生成
app.post('/oauth/token', oauth2.token);

// リダイレクトテスト用URL
app.get('/redirect', function(req, res, next) {
  res.render('redirect');
});
// Error Handling
app.use(function(err, req, res, next) {
  console.error(err);
  res.status(500);
  res.send(err);
});


app.listen(3000);


