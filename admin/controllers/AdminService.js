'use strict';

var db = require('sample-db');
var logger = require('sample-logger');
var TABLE_NAME = 'admin';

/**
 * 管理者追加
 */
exports.createAdmin = function(args, res, next) {
  var params = args.body.value;
  var query = db.insert(TABLE_NAME, params);

  query.then(function(insertId) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://node.local-fw.com/v1/admins/' + insertId);
    res.status(201);
    res.end(JSON.stringify({"insertId": insertId}));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * 管理者削除
 */
exports.deleteAdmin = function(args, res, next) {
  var where = {'adminId' : args.adminId.value };
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
 * 管理者取得
 */
exports.getAdmin = function(args, res, next) {
  var param = {};
  var query = db.query({
    sql: 'SELECT * FROM '+ TABLE_NAME +' WHERE admin_id = ?',
    typeCast: function (field, next) {
      if (field.type === 'LONGLONG') {
        return field.string();
      }
      return next();
    }
  }, args.userId.originalValue);

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows[0]));
  }).catch(function (error) {
    next(error);
  });
}

/**
 * 管理者一覧取得
 */
exports.listAdmin = function(args, res, next) {
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
 * 管理者検索
 */
exports.searchAdmin = function(args, res, next) {
  var param = {};
  var query = db.query({
    sql: 'SELECT * FROM '+ TABLE_NAME +' WHERE ?',
    typeCast: function (field, next) {
      if (field.type === 'LONGLONG') {
        return field.string();
      }
      return next();
    }
  }, args.body.value);

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({data: rows}));
  }).catch(function (error) {
    next(error);
  });
};
