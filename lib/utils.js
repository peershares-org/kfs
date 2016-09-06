/**
 * @module kfs/utils
 */

'use strict';

var assert = require('assert');
var constants = require('./constants');
var fs = require('fs');
var crypto = require('crypto');
var path = require('path');

/**
 * A stubbed noop function
 */
module.exports.noop = function() {};

/**
 * Get the key name for a data hash + index
 * @param {String} key - Hash of the data
 * @param {Number} index - The index of the file chunk
 * @returns {String}
 */
module.exports.createItemKeyFromIndex = function(key, index) {
  assert(typeof index === 'number', 'Invalid index supplied');

  var indexLength = Math.floor(constants.S / constants.C).toString().length;
  var indexString = index.toString();
  var itemIndex = '';

  assert(Buffer(key, 'hex').length * 8 === constants.R, 'Invalid key length');
  assert(indexString.length <= indexLength, 'Index is out of bounds');

  for (var i = 0; i < indexLength - indexString.length; i++) {
    itemIndex += '0';
  }

  itemIndex += indexString;

  return [key, ' ', itemIndex].join('');
};

/**
 * Get the file name of an s bucket based on it's index
 * @param {Number} sBucketIndex - The index fo the bucket in the B-table
 * @returns {String}
 */
module.exports.createSbucketNameFromIndex = function(sBucketIndex) {
  assert(typeof sBucketIndex === 'number', 'Invalid index supplied');

  var indexLength = constants.B.toString().length;
  var indexString = sBucketIndex.toString();
  var leadingZeroes = '';

  for (var i = 0; i < indexLength - indexString.length; i++) {
    leadingZeroes += '0';
  }

  return leadingZeroes + indexString + '.s';
};

/**
 * Creates a random reference ID
 * @param {String} [rid] - An existing hex reference ID
 * @returns {String}
 */
module.exports.createReferenceId = function(rid) {
  if (!rid) {
    rid = crypto.randomBytes(constants.R / 8).toString('hex');
  }

  assert(rid.length === 40, 'Invalid reference ID length');

  return Buffer(rid, 'hex');
};

/**
 * Check if the given path exists
 * @param {String} filePath
 * @returns {Boolean}
 */
module.exports.fileDoesExist = function(filePath) {
  try {
    fs.statSync(filePath);
  } catch (err) {
    return false;
  }

  return true;
};

/**
 * Ensures that the given path has a kfs extension
 * @param {String} tablePath - The path name to a kfs instance
 * @returns {String}
 */
module.exports.coerceTablePath = function(tablePath) {
  if (path.extname(tablePath) !== '.kfs') {
    return tablePath + '.kfs';
  }

  return tablePath;
};

/**
 * Determines if the passed error object is a NotFound error
 * @param {Error} error
 * @returns {Boolean}
 */
module.exports.isNotFoundError = function(error) {
  return error && error.message.indexOf('NotFound:') !== -1;
};