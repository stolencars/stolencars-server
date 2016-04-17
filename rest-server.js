'use strict';

const Hapi = require('hapi');
const Auth = require('hapi-auth-jwt2');
const Inert = require('inert');
const Vision = require('vision');
const Q = require('q');
const Swagger = require('./swagger');
const Mongo = require('./lib/plugins/MongoPool');
const Services = require('./lib/plugins/Services');

var env = process.env.NODE_ENV || 'production';
var config = require('./config.' + env);

var validate = function (decoded, request, callback) {
      // the user is already decoded and validated here!
  return callback(null, true);
};

function RestServer() {
  var deferred = Q.defer();

  const server = new Hapi.Server();
  server.connection(config.server);

  server.register([
    Auth,
    Inert,
    Vision,
    Swagger,
    { register: Mongo, options: config.db },
    { register: Services, options: config }
  ], function (err) {
    if (err) {
      deferred.reject(err);
      return;
    }

    server.auth.strategy('jwt', 'jwt',
    { key: config.jwt.secret,          // Never Share your secret key
      validateFunc: validate,            // validate function defined above
      verifyOptions: { algorithms: [ 'HS256' ] } // pick a strong algorithm
    });

    server.auth.default('jwt');

    // routes
    require('./routes/vehicles')(server, config);
    require('./routes/users')(server, config);
    require('./routes/health')(server, config);
    require('./routes/search')(server, config);
    require('./routes/export')(server, config);


    server.start(function(err) {
      if (err) {
        deferred.reject(err);
      } else {
        deferred.resolve(server);
      }
    });
  });
  return deferred.promise;
}

module.exports = RestServer;
