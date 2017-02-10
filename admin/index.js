'use strict';

// Require
var conf    = require('config');
var express = require('express');
var helmet  = require('helmet');
var logger  = require('sample-logger');
var compression = require('compression');
var httpAccessLogger  = require('sample-http-access-logger');
var requestLogger  = require('sample-request-logger');
var connectionPoolMiddleware = require('sample-connection-pool-middleware');
var https = require('https');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');

var serverPort = conf.port;
var app = express();
var secureServer;

// swaggerRouter configuration
var options = {
  swaggerUi: '/swagger.json',
  controllers: './controllers',
  //Conditionally turn on stubs (mock mode)
  useStubs: process.env.NODE_ENV === 'development' ? true : false
};

// The Swagger document
// (require it, build it programmatically, fetch it from a URL, ...)
var spec = fs.readFileSync(conf.appBasePath + '/api/swagger.yaml', 'utf8');
var swaggerDoc = jsyaml.safeLoad(spec);

// Initialize the Swagger middleware
swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {

  // gzip圧縮
  app.use(compression());

  // アクセスログ
  app.use(httpAccessLogger.accessConfig);

  // リクエストログにbody情報を表示するためにbodyParserをuse
  app.use(bodyParser.json());

  // リクエストログ
  app.use(upload.array(), requestLogger());

  // セキュリティ対策
  app.use(helmet());

  // DB接続のセットアップ
  app.use(connectionPoolMiddleware());

  // Interpret Swagger resources and attach metadata to request
  // - must be first in swagger-tools middleware chain
  app.use(middleware.swaggerMetadata());
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
  var sslOptions = {
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
    var errorObj = {};
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
    var errObj = {
        code: 500,
        message: 'unexpected Error'
    };
    res.status(err.status || 500);
    res.end(JSON.stringify(errObj));
  }
}
