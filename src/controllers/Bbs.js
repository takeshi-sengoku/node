'use strict';

var url = require('url');

var Bbs = require('./BbsService');
var conf = require('config');
var performance = require('sample-performance-logger');

module.exports.createBbs = function createBbs (req, res, next) {
  performance.start();
  Bbs.createBbs(req.swagger.params, res, next);
  performance.end();
};

module.exports.deleteBbs = function deleteBbs (req, res, next) {
  performance.start();
  Bbs.deleteBbs(req.swagger.params, res, next);
  performance.end();
};

module.exports.getBbs = function getBbs (req, res, next) {
  performance.start();
  Bbs.getBbs(req.swagger.params, res, next);
  performance.end();
};

module.exports.listBbs = function listBbs (req, res, next) {
  performance.start();
  Bbs.listBbs(req.swagger.params, res, next);
  performance.end();
};

module.exports.updateBbs = function updateBbs (req, res, next) {
  performance.start();
  Bbs.updateBbs(req.swagger.params, res, next);
  performance.end();
};
