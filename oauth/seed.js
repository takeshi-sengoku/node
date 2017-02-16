'use strict';

var mysql = require('mysql2');

var connectOptions = {
  host : '192.168.56.103',
  port : 3306,
  user : 'vagrant',
  password: 'vagrant',
  database: 'sample',
  timezone: 'jst'

};
// コネクションのセットアップ
var connection = mysql.createConnection(connectOptions);
connection.connect(function (err) {
  if (err) {
    console.error('error connection: %s', err.stack);
    return;
  }
});

// ユーザーの作成
var sql = 'insert into oauth_clients set ?';
var params = {
  name: 'サンプルアプリ',
  client_id: 'abc123',
  client_secret: 'secret',
  redirect_uri: 'http://192.168.56.101:3000'
};
var q = connection.query(sql, params);
q.on('error', function (err) {
  console.error('error query %s', err.stack);
}).on('result', function (result) {
  console.log('insert_id:%s', result.insertId);
}).on('end', function () {
  console.log('dataset end.');
  process.exit();
});
