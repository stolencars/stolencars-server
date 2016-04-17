'use strict';

const Users = require('../services/users');
const Vehicles = require('../services/vehicles');
const Persistence = require('../persistence/mongo');

exports.register = function (plugin, options, next) {
  const db = plugin.plugins.db;
  const users = new Users(new Persistence(db.collection('users')), options);
  const vehicles = new Vehicles(new Persistence(db.collection('vehicles')), options);

  // following expression uses merge and deep clone, which breaks mongodb connection!
  // plugin.expose({users:users, vehicles:vehicles});
  plugin.expose('users', users);
  plugin.expose('vehicles', vehicles);

  next();
};

exports.register.attributes = {
  name: 'services'
};
