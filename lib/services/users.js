'use strict';

const bcrypt = require('../utils/bcrypt');
const jwt = require('jsonwebtoken');
const Q = require('q');

Users.prototype.exist = function(email) {
  return this.persistence
    .getById(email)
    .then(() => true)
    .catch(() => {return false;});
};

// valid roles are "admin", "user"
Users.prototype.create = function(email, password, roles) {
  return this.exist(email)
    .then(function(isExistingUser){
      if(isExistingUser) {
        throw Error('User ' + email + ' already registred');
      }
    })
    .then(() => bcrypt.generate(password))
    .then(hash => this.persistence.create({email:email, password:hash, roles:roles}, email))
    .then(user => this.createToken(user));
};

Users.prototype.createToken = function(user) {
  let payload = {email: user.email, roles:user.roles};
  let options = {expiresIn: this.config.jwt.expiresIn};
  let token = jwt.sign(payload, this.config.jwt.secret, options);
  return token;
};

Users.prototype.changePassword = function(email, newPassword) {
  return email + newPassword; //TODO
};

Users.prototype.verify = function(email, password) {
  return this.persistence.getById(email).then(function(user) {
    return bcrypt
      .isValid(password, user.password)
      .then(function(isValid){
        if(isValid) {
          return user;
        } else {
          throw Error('');
        }
      });
  });
};

Users.prototype.verifyToken = function(tokenString) {
  return Q.nfcall(jwt.verify, tokenString, this.config.jwt.secret); // or throws exception
};

Users.prototype.login = function(email, password) {
  return this.verify(email, password)
    .then((user) => this.createToken(user));
};

function Users(persistence, config) {
  this.persistence = persistence;
  this.config = config;
}

module.exports = Users;
