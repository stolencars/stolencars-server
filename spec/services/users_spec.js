var assert = require('assert');
var Users = require('../../lib/services/users');
var jwt = require('jsonwebtoken');
var InMemoryPersistence = require('../../lib/persistence/inmemory');

var service = new Users(new InMemoryPersistence(), {jwt: {secret: 'my_secret'}});

describe('Users service', function() {
  it('should create new user and return JWT token', function() {
    return service.create('lorem.ipsum@dolor.sit', 'mypass', ['user'])
    .then(function(token) {
      var decoded = jwt.decode(token);
      assert.equal(decoded.email,'lorem.ipsum@dolor.sit');
      assert.equal(decoded.roles[0], 'user');
    });
  });

  var loginToken = null;

  it('should return token on login action', function() {
    return service.login('lorem.ipsum@dolor.sit', 'mypass')
    .then(function(token) {
      loginToken = token;
      var decoded = jwt.decode(token);
      assert.equal(decoded.email,'lorem.ipsum@dolor.sit');
      assert.equal(decoded.roles[0], 'user');
    });
  });

  it('should verify token', function() {
    return service.verifyToken(loginToken)
    .then(function(token) {
      assert.equal(token.email,'lorem.ipsum@dolor.sit');
      assert.equal(token.roles[0], 'user');
    });
  });
});
