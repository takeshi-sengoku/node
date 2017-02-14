'use strict';

var url = require('url');

var Account = require('./AccountService');
var conf = require('config');
var performance = require('sample-performance-logger');

module.exports.createAccount = function createAccount (req, res, next) {
  performance.start();
  Account.createAccount(req.swagger.params, res, next);
  performance.end();
};

module.exports.deleteAccount = function deleteAccount (req, res, next) {
  performance.start();
  Account.deleteAccount(req.swagger.params, res, next);
  performance.end();
};

module.exports.getAccount = function getAccount (req, res, next) {
  performance.start();
  Account.getAccount(req.swagger.params, res, next);
  performance.end();
};

module.exports.listAccount = function listAccount (req, res, next) {
  performance.start();
  Account.listAccount(req.swagger.params, res, next);
  performance.end();
};

module.exports.updateAccount = function updateAccount (req, res, next) {
  performance.start();
  Account.updateAccount(req.swagger.params, res, next);
  performance.end();
};

module.exports.searchAccount = function searchAccount (req, res, next) {
  performance.start();
  Account.searchAccount(req.swagger.params, res, next);
  performance.end();
};
