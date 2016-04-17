var assert = require('assert');
var token = require('../lib/utils/bcrypt');

describe('Bcrypt util', function() {
  it('should generate hash and validate it', function() {
    return token.generate('my_secret')
    .then(function(hash) {
      return token.isValid('my_secret', hash).then(function(isValid){
        assert(isValid);
      });
    });
  });

  it('should reject invalid password', function() {
    return token.generate('my_secret')
    .then(function(hash) {
      return token.isValid('my_secret2', hash).then(function(isValid){
        assert(!isValid);
      });
    });
  });
});
