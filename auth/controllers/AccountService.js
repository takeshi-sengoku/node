'use strict';

var db = require('sample-db');
var logger = require('sample-logger');
var TABLE_NAME = 'account';

/**
 * ユーザ追加
 */
exports.createAccount = function(args, res, next) {
  var params = args.body.value;
  var query = db.insert(TABLE_NAME, params);

  query.then(function(insertId) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://node.local-fw.com/v1/accounts/' + insertId);
    res.status(201);
    res.end(JSON.stringify({"insertId": insertId}));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * ユーザ削除
 */
exports.deleteAccount = function(args, res, next) {
  var where = {'accountId' : args.accountId.value };
  var query = db.delete(TABLE_NAME, where);

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.status(204);
    res.end();
  }).catch(function (error) {
    next(error);
  });
};

/**
 * ユーザ取得
 */
exports.getAccount = function(args, res, next) {
  var sql = 'SELECT * FROM + TABLE_NAME + where account_id = ?';
  var param = args.accountId.value;
  var query = db.getOne(sql, param);

  query.then(function(row) {
    if (row === undefined) {
      next();
    } else {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(row));
    }
  }).catch(function (error) {
    next(error);
  })};

/**
 * ユーザ一覧取得
 */
exports.listAccount = function(args, res, next) {
  var param = {};
  var sql   = "SELECT * FROM "+ TABLE_NAME;
  var query = db.query({
    sql: sql,
    parameter: param,
    typeCast: function (field, next) {
      if (field.type === 'LONGLONG') {
        return field.string();
      }
      return next();
    },
  });

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({data: rows}));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * ユーザ更新
 */
exports.updateAccount = function(args, res, next) {
  var param = args.body.value;
  var where = {account_id: args.accountId.value};
  var query = db.update(TABLE_NAME, param, where);

  query.then(function(row) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://node.local-fw.com/v1/accounts/' + args.accountId.value);
    res.status(204);
    res.end();
  }).catch(function (error) {
    next(error);
  });
};

