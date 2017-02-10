'use strict';

var db = require('sample-db');
var logger = require('sample-logger');
var TABLE_NAME = 'admins';

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
  var sql = 'SELECT * FROM admins where admin_id = ?';
  var param = args.adminId.value;
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
 * 管理者一覧取得
 */
exports.listAdmin = function(args, res, next) {
//  var param = {};
//  var sql   = 'SELECT * FROM admins';
//  var query = db.query(sql, param);
//
//  query.then(function(rows) {
//    res.setHeader('Content-Type', 'application/json');
//    res.end(JSON.stringify({data: rows}));
//  }).catch(function (error) {
//    next(error);
//  });
	res.setHeader('Content-Type', 'application/json');
	res.end(JSON.stringify({data: [{'a' : 1}]}));
};

/**
 * 管理者更新
 */
exports.updateAdmin = function(args, res, next) {
  var param = args.body.value;
  var where = {admin_id: args.adminId.value};
  var query = db.update(TABLE_NAME, param, where);

  query.then(function(row) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://node.local-fw.com/v1/admins/' + args.adminId.value);
    res.status(204);
    res.end();
  }).catch(function (error) {
    next(error);
  });
};

