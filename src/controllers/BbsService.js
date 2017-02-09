'use strict';

var db = require('sample-db');
var logger = require('sample-logger');
var TABLE_NAME = 'bbs';

/**
 * BBS追加
 */
exports.createBbs = function(args, res, next) {
  var params = args.body.value;
  var query = db.insert(TABLE_NAME, params);

  query.then(function(insertId) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://node.local-fw.com/v1/bbs/' + insertId);
    res.status(201);
    res.end(JSON.stringify({"insertId": insertId}));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * BBS削除
 */
exports.deleteBbs = function(args, res, next) {
  var where = {'bbs_id' : args.bbsId.value };
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
 * BBS取得
 */
exports.getBbs = function(args, res, next) {
  var sql = 'SELECT * FROM bbs where bbs_id = ?';
  var param = args.bbsId.value;
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
  })
};

/**
 * BBS一覧取得
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
 * BBS更新
 */
exports.updateBbs = function(args, res, next) {
  var param = args.body.value;
  var where = {bbs_id: args.bbsId.value};
  var query = db.update(TABLE_NAME, param, where);

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://node.local-fw.com/v1/bbs/' + args.bbsId.value);
    res.status(204);
    res.end();
  }).catch(function (error) {
    next(error);
  });
};

