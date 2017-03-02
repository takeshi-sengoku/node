'use strict';

var mysql  = require('mysql2');
var debug  = require('debug')('sample-db');

// TODO 特定のフィールドへのアクセスを禁止するような施策を検討する
var connectOptions = {
  "host": "db.local-fw.com",
  "port": 3306,
  "user" : "vagrant",
  "password": "vagrant",
  "database": "auth",
  "timezone": "jst",
  "supportBigNumbers": true
};
var connection = mysql.createConnection(connectOptions);

function handleDisconnect(_connection) {
  _connection.on('error', function(error) {
    if (error.code !== 'PROTOCOL_CONNECTION_LOST') {
      throw error;
    }
    connection = mysql.createConnection(connectOptions);
    handleDisconnect(connection);
    connection.connect(function(err) {
      if(err) {
        throw err;
      }
    });
  });
}
handleDisconnect(connection);
exports.connection = connection;

/**
 * 検索
 * @param sql SQL
 * @param params クエリパラメーター(列:値の連想配列)
 * @returns 検索結果
 */
function query(sql, params) {
  return new Promise(function(resolve, reject) {
    var rows = [];
    var q = connection.query(sql, convToSnakeCaseKey(params));
    console.log(q.sql);
    q.on('error', function(err) {
      reject(err);
    }).on('result', function(row) {
      connection.pause();
      rows.push(convToCamelCaseKey(row));
      connection.resume();
    }).on('end', function() {
      resolve(rows);
    });
  });
}
exports.query = query;

/**
 * 1件検索
 * @param sql SQL
 * @param params クエリパラメーター(列:値の連想配列)
 * @returns 検索結果(1件)
 */
function getOne(sql, params) {
  return new Promise(function(resolve, reject) {
    var ret;
    var q = connection.query(sql, convToSnakeCaseKey(params));
    console.log(q.sql);
    q.on('error', function(err) {
      reject(err);
    }).on('result', function(row) {
      connection.pause();
      ret = convToCamelCaseKey(row);
      connection.resume();
    }).on('end', function() {
      resolve(ret);
    });
  });
}
exports.getOne = getOne;
/**
 * 登録
 * @param table 対象テーブル
 * @param params 登録値(列:値の連想配列)
 * @returns インサートID
 */
function insert(table, params) {
  return new Promise(function(resolve, reject) {
    var q = connection.query('insert into ?? set ?', [table, convToSnakeCaseKey(params)]);
    console.log(q.sql);
    var insertId;
    q.on('error', function(err) {
      reject(err);
    }).on('result', function(row) {
      connection.pause();
      insertId = row.insertId;
      connection.resume();
    }).on('end', function() {
      resolve(insertId);
    });
  });
}
exports.insert = insert;

/**
 * 更新
 * @param table 対象テーブル
 * @param fields 更新値(列:値の連想配列)
 * @param where 更新条件
 * @returns なし
 */
function update(table, fields, where) {
  return new Promise(function(resolve, reject) {
    var q = connection.query('update ?? set update_date = now(), ? where ?',
        [table, convToSnakeCaseKey(fields), convToSnakeCaseKey(where)]);
    console.log(q.sql);
    q.on('error', function(err) {
      reject(err);
    }).on('result', function(row) {
      connection.pause();
      connection.resume();
    }).on('end', function() {
      resolve();
    });
  });
}
exports.update = update;

/**
 * 削除
 * @param table テーブル名
 * @param where 削除条件
 * @returns
 */
function del(table, where) {
  return new Promise(function(resolve, reject) {
    var q = connection.query('delete from ?? where ?', [table, convToSnakeCaseKey(where)]);
    q.on('error', function(err) {
      reject(err);
    }).on('result', function(result) {
      connection.pause();
      connection.resume();
    }).on('end', function() {
      resolve();
    });
  });
}
exports.delete = del;

/**
 * 連想配列のキーをキャメルケースからスネークケースに変換
 * @param array 配列
 * @returns スネークケース変換後の配列
 */
function convToSnakeCaseKey(obj) {
  if ((obj instanceof Object) === false) {
    return obj;
  }
  if (Object.prototype.toString.call(obj) === '[object Array]') {
    var returnArray = [];
    var retVal;
    obj.forEach(function(val) {
      retVal = (val instanceof Object) ? convToSnakeCaseKey(val) : val;
      returnArray.push(retVal);
    });
    return returnArray;
  }
  var snakeCaseKeyArray = {};
  for (var key in obj) {
    snakeCaseKeyArray[camelToSnake(key)] = obj[key];
  }
  return snakeCaseKeyArray;
}

/**
 * 連想配列のキーをスネークケースからキャメルケースに変換
 * @param array 配列
 * @returns キャメルケース変換後の配列
 */
function convToCamelCaseKey(obj) {
  if ((obj instanceof Object) === false) {
    return obj;
  }
  if (Object.prototype.toString.call(obj) === '[object Array]') {
    var returnArray = [];
    var retVal;
    obj.forEach(function(val) {
      retVal = (val instanceof Object) ? convToCamelCaseKey(val) : val;
      returnArray.push(retVal);
    });
    return returnArray;
  }
  var camelCaseKeyArray = {};
  for (var key in obj) {
    camelCaseKeyArray[snakeToCamel(key)] = obj[key];
  }
  return camelCaseKeyArray;
}

/**
 * スネークケースをキャメルケースにする
 * @param p 文字列(snake_case)
 * @returns 文字列(camelCase)
 */
function snakeToCamel(p){
  // _+小文字を大文字にする(例:_a を A)
  return p.replace(/_./g, function(s) {
    return s.charAt(1).toUpperCase();
  });
}

/**
 * キャメルケースをスネークケースにする
 * @param p 文字列(camelCase)
 * @returns 文字列(snake_case)
 */
function camelToSnake(p){
  // 大文字を_+小文字にする(例:A を _a)
  return p.replace(/([A-Z])/g, function(s) {
    return '_' + s.charAt(0).toLowerCase();
  });
}
