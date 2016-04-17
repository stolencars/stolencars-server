'use strict';

var Q = require('q');
var bcrypt = require('bcryptjs');

var generateHash = function(password) {
  return Q.nfcall(bcrypt.genSalt, 12)
    .then(function(salt) {
      return Q.nfcall(bcrypt.hash, password, salt);
    });
};

var validateHash = function(password, hash) {
  return Q.nfcall(bcrypt.compare, password, hash);
};

module.exports = {
  generate:generateHash,
  isValid:validateHash
};
