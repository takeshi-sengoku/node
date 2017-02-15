'use strict';

var url = require('url');

var Admin = require('./AdminService');
var conf = require('config');
var performance = require('sample-performance-logger');

module.exports.createAdmin = function createAdmin (req, res, next) {
  performance.start();
  Admin.createAdmin(req.swagger.params, res, next);
  performance.end();
};

module.exports.deleteAdmin = function deleteAdmin (req, res, next) {
  performance.start();
  Admin.deleteAdmin(req.swagger.params, res, next);
  performance.end();
};

module.exports.getAdmin = function getAdmin (req, res, next) {
  performance.start();
  Admin.getAdmin(req.swagger.params, res, next);
  performance.end();
};

module.exports.listAdmin = function listAdmin (req, res, next) {
  performance.start();
  Admin.listAdmin(req.swagger.params, res, next);
  performance.end();
};

module.exports.updateAdmin = function updateAdmin (req, res, next) {
  performance.start();
  Admin.updateAdmin(req.swagger.params, res, next);
  performance.end();
};

module.exports.searchAdmin = function searchAdmin (req, res, next) {
  performance.start();
  Admin.searchAdmin(req.swagger.params, res, next);
  performance.end();
};
