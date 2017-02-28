'use strict';

// Require
const conf    = require('config');
const express = require('express');
const helmet  = require('helmet');
const logger  = require('sample-logger');
const compression = require('compression');
const httpAccessLogger  = require('sample-http-access-logger');
const requestLogger  = require('sample-request-logger');
const connectionPoolMiddleware = require('sample-connection-pool-middleware');
const https = require('https');
const bodyParser = require('body-parser');
const multer = require('multer');
const upload = multer();
const swaggerTools = require('swagger-tools');
const jsyaml = require('js-yaml');
const fs = require('fs');
const passport = require('passport');

const serverPort = conf.port;
const app = express();
let secureServer;

// swaggerRouter configuration
const options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  //Conditionally turn on stubs (mock mode)
  useStubs: process.env.NODE_ENV === 'development' ? true : false
};

// The Swagger document
// (require it, build it programmatically, fetch it from a URL, ...)
const spec = fs.readFileSync(conf.appBasePath + '/api/swagger.yaml', 'utf8');
const swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  // gzip圧縮
  app.use(compression());

  // PASSPORTセットアップ
  app.use(passport.initialize());
  require('./passport-auth');

  // アクセスログ
  app.use(httpAccessLogger.accessConfig);

  // リクエストログにbody情報を表示するためにbodyParserをuse
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());

  // リクエストログ
  app.use(upload.array(), requestLogger());

  // セキュリティ対策
  app.use(helmet());

  // Interpret Swagger resources and attach metadata to request
  // - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());

  // SwaggerSecurity
  app.use(middleware.swaggerSecurity({
    ApiSecurity: function(req, def, scopes, callback) {
      return passport.authenticate('bearer', function(err, user, info) {
        if (err) {
          return callback(err);
        }
        if (!user) {
          req.res.setHeader('WWW-Authenticate', info);
          req.res.status(401);
          req.res.end('unauthorized');
          return;
        // scopeチェックをここで実施する
        } else {
          req.dbuser = info.clientId;
          callback();
        }
      })(req, null, callback);
   }
  }));

  // DB接続のセットアップ
  app.use(connectionPoolMiddleware());

  // Validate Swagger requests
  app.use(middleware.swaggerValidator({
    validateResponse : false // TODO: API定義が固まったらtrueにする
  }));
  // Route validated requests to appropriate controller
  app.use(middleware.swaggerRouter(options));
  // Serve the Swagger documents and Swagger UI
  app.use(middleware.swaggerUi());

  // エラーハンドリング
  app.use(errorHandler);

  // 404エラー
  app.use(error404);

  // Start the server
  const sslOptions = {
    key: fs.readFileSync(conf.certKey),
    cert: fs.readFileSync(conf.certCrt),
    ca: fs.readFileSync(conf.certCsr),
    requestCert: false,
    rejectUnauthorized: false
  };

  // mochaでのテスト時にエラーとならないようにする
  if (!module.parent) {
    secureServer = https.createServer(sslOptions, app);
    secureServer.listen(serverPort);
  }
});

//mocha+supertestでテストできるようモジュール化
module.exports = app;

/**
 * 404エラー
 * @param req
 * @param res
 * @param next
 * @returns
 */
function error404(req, res, next) {
  res.status(404);
  res.end('notfound! : ' + req.path);
}

/**
 * エラーハンドリング
 * @param err
 * @param req
 * @param res
 * @param next
 * @returns
 */
function errorHandler(err, req, res, next) {

  res.setHeader('Content-Type', 'application/json');

  // バリデーション
  if (err.failedValidation === true) {
    const errorObj = {};
    errorObj.code = 400;

    // schemaエラーの場合
    if (err.results !== undefined) {
      errorObj.errors = err.results.errors;
    } else {
      errorObj.errors = {
          code: err.code,
          message: err.message,
          path: [err.paramName]
      };
    }
    res.end(JSON.stringify(errorObj));
  } else {
    logger.error(err);
    const errObj = {
        code: 500,
        message: 'unexpected Error'
    };
    res.status(err.status || 500);
    res.end(JSON.stringify(errObj));
  }
}
