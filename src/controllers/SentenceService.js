'use strict';

var db = require('sample-db');
var logger = require('sample-logger');
var TABLE_NAME = 'sentence';

/**
 * 短文追加
 */
exports.createSentence = function(args, res, next) {
  var params = args.body.value;
  var query = db.insert(TABLE_NAME, params);

  query.then(function(insertId) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://node.local-fw.com/v1/sentences/' + insertId);
    res.status(201);
    res.end(JSON.stringify({"insertId": insertId}));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * 短文削除
 */
exports.deleteSentence = function(args, res, next) {
  var where = {'sentenceId' : args.sentenceId.value };
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
 * 短文取得
 */
exports.getSentence = function(args, res, next) {
  var param = {};
  var query = db.query({
    sql: 'SELECT * FROM '+ TABLE_NAME +' WHERE sentence_id = ?',
    typeCast: function (field, next) {
      if (field.type === 'LONGLONG') {
        return field.string();
      }
      return next();
    }
  }, args.sentenceId.originalValue);

  query.then(function(rows) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(rows[0]));
  }).catch(function (error) {
    next(error);
  });
};

/**
 * 短文一覧取得
 */
exports.listSentence = function(args, res, next) {
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
 * 短文更新
 */
exports.updateSentence = function(args, res, next) {
  var param = args.body.value;
  var where = {sentence_id: args.sentenceId.value};
  var query = db.update(TABLE_NAME, param, where);

  query.then(function(row) {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Location', 'https://node.local-fw.com/v1/sentences/' + args.sentenceId.value);
    res.status(204);
    res.end();
  }).catch(function (error) {
    next(error);
  });
};

