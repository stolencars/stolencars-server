'use strict';

const _ = require('lodash');
const uuid = require('node-uuid');
const Q = require('q');
const mongo = require('mongodb');
var images = require('../utils/images');

function Vehicles(persistence, config) {
  this.persistence = persistence;
  this.config = config;
}

Vehicles.prototype.getById = function(id) {
  return this.persistence
    .getById(id)
    .then(function(item){
      return _.omit(item, ['_hash']);
    });
};

Vehicles.prototype.getAll = function(query) {
  var from = query.from || 0;
  var count = query.count || 10;
  var sort = {'_id': -1};
  let getAllPromise = this.persistence.getAll(from, count, sort, {});
  let countPromise = this.persistence.count({});
  return Q.all([getAllPromise, countPromise])
    .spread((results, totalCount) => {return {results:results, totalCount:totalCount, offset:from, limit:count};});
};

Vehicles.prototype.remove = function(id, credentials) {
  return this.validate(id, credentials)
    .then(() => this.persistence.remove(id))
    .then((originalValue) => {return {removed:true, value: originalValue};});
};


Vehicles.prototype.insert = function(data, credentials) {
  data.owner = credentials.email;
  return this.persistence.create(data)
    .then(function(persistedEntry){
      return {data: persistedEntry};
    });
};

Vehicles.prototype.update = function(id, data, credentials) {
  return this.validate(id, credentials)
    .then(() => {
      return this.persistence.update(id, data)
        .then(function(newValue) {
          return {'updated_fields':Object.keys(data), 'new_value':_.assign(newValue, data)};
        });
    });
};

Vehicles.prototype.attachImage = function(id, image, credentials) {
  console.log(images.transform(image));
  return this.validate(id, credentials)
    .then(() => this.getById(id))
    .then(vehicle => {
      var images = vehicle.images || [];
      var item = {
        filename: image.hapi.filename,
        _id: uuid.v4(),
        binary: new mongo.Binary(image._data)
      };
      images.push(item);
      return this.persistence.update(id, {images:images})
        .then(() => item);
    });
};

Vehicles.prototype.validate = function(id, credentials) {
  return this.persistence.getById(id)
    .then(function(result) {
      if(result.owner === credentials.email) {
        return id;
      } else {
        throw Error('Invalid password!');
      }
    });
};


module.exports = Vehicles;
