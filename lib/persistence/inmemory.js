'use strict';

var uuid = require('node-uuid');
var Q = require('q');
//var data = require('./stolencars.json');

function Persistence() {
  this._data = [];
}

Persistence.prototype.create = function(item, id) {
  item._id = id || uuid.v4();
  this._data.push(item);
  return Q(item).then(this.flush.bind(this));
};

Persistence.prototype.getIndex = function(id) {
  var result = this._data.findIndex(function(item){return item._id === id;});
  if(result > -1) {
    return Q.resolve(result);
  } else {
    return Q.reject(new Error('Item with id ' + id + ' not found!'));
  }
};

Persistence.prototype.remove = function(id) {
  return this.getIndex(id)
    .then(function(index){
      var item = this._data[index];
      this._data.splice(index, 1);
      return item;
    }.bind(this))
    .then(this.flush.bind(this));
};

Persistence.prototype.getById = function(id) {
  return this.getIndex(id)
    .then(function(index){
      return this._data[index];
    }.bind(this));
};

Persistence.prototype.update = function(id, data) {
  return this.getIndex(id)
    .then(function(index){
      var item = this._data[index];
      for (var key in data) {
        item[key] = data[key];
      }
      return item;
    }.bind(this))
    .then(this.flush.bind(this));
};

Persistence.prototype.getAll = function(from, count, query) {
  query.fulltext = '';
  var start = from - 1;
  var end = start + count;
  return Q(this._data.slice(start, end));
};

Persistence.prototype.count = function(query) {
  query.fulltext = '';
  return Q(this._data.length);
};

Persistence.prototype.flush = function(input) {
  return input;
};

module.exports = Persistence;
