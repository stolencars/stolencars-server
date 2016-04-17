'use strict';

const RestServer = require('./rest-server');
new RestServer()
  .then(server => console.log(`Application worker ${process.pid} running at: ${server.info.uri}`))
  .catch(err => console.error(err));
