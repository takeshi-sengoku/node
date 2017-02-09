'use strict';

/**
 * BBS
 */
var db = require('sample-db');
var logger = require('sample-logger');
var TABLE_NAME = 'user';

/**
 * 追加
 */
exports.createUser = function(args, res, next) {
  var params = args.body.value;
  var query = db.insert(TABLE_NAME, params);

  query.then(function(row) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://api.local-fw.com/v1/user/' + row);
    res.end(JSON.stringify({"userId": row}));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * 削除
 */
exports.deleteUser = function(args, res, next) {
  var where = {'user_id' : args.userId.value };
  var query = db.delete(TABLE_NAME, where);

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.end();
  }).catch(function (error) {
    next(error);
  });
};

/**
 * キー検索
 */
exports.getUser = function(args, res, next) {
  var sql = 'SELECT * FROM user where user_id = ?';
  var param = args.userId.value;
  var query = db.getOne(sql, param);

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * 一覧検索
 */
exports.listUser = function(args, res, next) {
  var param = {};
  var sql   = 'SELECT * FROM user';
  var query = db.query(sql, param);

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({data: rows}));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * 更新
 */
exports.updateUser = function(args, res, next) {
  var param = args.body.value;
  var where = {user_id: args.userId.value};
  var query = db.update(TABLE_NAME, param, where);

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.end();
  }).catch(function (error) {
    next(error);
  });
};
