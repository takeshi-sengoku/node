'use strict';

var url = require('url');

var Sentence = require('./SentenceService');
var conf = require('config');
var performance = require('sample-performance-logger');

module.exports.createSentence = function createSentence (req, res, next) {
  performance.start();
  Sentence.createSentence(req.swagger.params, res, next);
  performance.end();
};

module.exports.deleteSentence = function deleteSentence (req, res, next) {
  performance.start();
  Sentence.deleteSentence(req.swagger.params, res, next);
  performance.end();
};

module.exports.getSentence = function getSentence (req, res, next) {
  performance.start();
  Sentence.getSentence(req.swagger.params, res, next);
  performance.end();
};

module.exports.listSentence = function listSentence (req, res, next) {
  performance.start();
  Sentence.listSentence(req.swagger.params, res, next);
  performance.end();
};

module.exports.updateSentence = function updateSentence (req, res, next) {
  performance.start();
  Sentence.updateSentence(req.swagger.params, res, next);
  performance.end();
};

module.exports.searchSentence = function searchSentence (req, res, next) {
  performance.start();
  Sentence.searchSentence(req.swagger.params, res, next);
  performance.end();
};
