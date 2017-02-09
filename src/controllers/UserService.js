'use strict';

var db = require('sample-db');
var logger = require('sample-logger');
var TABLE_NAME = 'users';

/**
 * ユーザー追加
 */
exports.createUser = function(args, res, next) {
  var params = args.body.value;
  var query = db.insert(TABLE_NAME, params);

  query.then(function(insertId) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://node.local-fw.com/v1/users/' + insertId);
    res.status(201);
    res.end(JSON.stringify({"insertId": insertId}));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * ユーザー削除
 */
exports.deleteUser = function(args, res, next) {
  var where = {'userId' : args.userId.value };
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
 * ユーザー取得
 */
exports.getUser = function(args, res, next) {
  var sql = 'SELECT * FROM users where user_id = ?';
  var param = args.userId.value;
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
 * ユーザー一覧取得
 */
exports.listUser = function(args, res, next) {
  var param = {};
  var sql   = 'SELECT * FROM users';
  var query = db.query(sql, param);

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({data: rows}));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * ユーザー更新
 */
exports.updateUser = function(args, res, next) {
  var param = args.body.value;
  var where = {user_id: args.userId.value};
  var query = db.update(TABLE_NAME, param, where);

  query.then(function(row) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://node.local-fw.com/v1/users/' + args.userId.value);
    res.status(204);
    res.end();
  }).catch(function (error) {
    next(error);
  });
};

