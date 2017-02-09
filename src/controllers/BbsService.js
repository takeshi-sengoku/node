'use strict';

/**
 * BBS
 */
var db = require('sample-db');
var logger = require('sample-logger');
var TABLE_NAME = 'bbs';

/**
 * 追加
 */
exports.createBbs = function(args, res, next) {
  var params = args.body.value;
  var query = db.insert(TABLE_NAME, params);

  query.then(function(row) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://api.local-fw.com/v1/bbs/' + row);
    res.end(JSON.stringify({"bbsId": row}));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * 削除
 */
exports.deleteBbs = function(args, res, next) {
  var where = {'bbs_id' : args.bbsId.value };
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
exports.getBbs = function(args, res, next) {
  var sql = 'SELECT * FROM bbs where bbs_id = ?';
  var param = args.bbsId.value;
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
exports.listBbs = function(args, res, next) {
  var param = {};
  var sql   = 'SELECT * FROM bbs';
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
exports.updateBbs = function(args, res, next) {
  var param = args.body.value;
  var where = {bbs_id: args.bbsId.value};
  var query = db.update(TABLE_NAME, param, where);

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.end();
  }).catch(function (error) {
    next(error);
  });
};
