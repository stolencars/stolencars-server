'use strict';

var MongoClient = require('mongodb').MongoClient;

var default_options = {
  db:{
    numberOfRetries : 5
  },
  server: {
    auto_reconnect: true,
    poolSize : 40,
    socketOptions: {
      connectTimeoutMS: 500
    }
  }
};

function initPool(options) {
  return MongoClient.connect(options.url, default_options);
}

exports.register = function (plugin, options, next) {
  initPool(options).then((db) => {
    plugin.expose({connection : db, collection: (name) => db.collection(name)});
    plugin.on('stop', () => db.close());
    next();
  }).catch(next);
};

exports.register.attributes = {
  name: 'db'
};
