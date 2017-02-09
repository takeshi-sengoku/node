'use strict';

var url = require('url');

var User = require('./UserService');
var conf = require('config');
var performance = require('sample-performance-logger');

module.exports.createUser = function createUser (req, res, next) {
  performance.start();
  User.createUser(req.swagger.params, res, next);
  performance.end();
};

module.exports.deleteUser = function deleteUser (req, res, next) {
  performance.start();
  User.deleteUser(req.swagger.params, res, next);
  performance.end();
};

module.exports.getUser = function getUser (req, res, next) {
  performance.start();
  User.getUser(req.swagger.params, res, next);
  performance.end();
};

module.exports.listUser = function listUser (req, res, next) {
  performance.start();
  User.listUser(req.swagger.params, res, next);
  performance.end();
};

module.exports.updateUser = function updateUser (req, res, next) {
  performance.start();
  User.updateUser(req.swagger.params, res, next);
  performance.end();
};
