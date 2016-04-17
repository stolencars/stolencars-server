'use strict';

var uuid = require('node-uuid');

function Persistence(collection) {
  this.collection = collection;
}

Persistence.prototype.create = function(item, id) {
  item._id = id || uuid.v4();

  return this.collection.insertOne(item)
    .then(function(res){
      return res.ops[0];
    });
};

Persistence.prototype.remove = function(id) {
  return this.getById(id)
    .then(item => this.collection.deleteOne({'_id':id})
      .then(() => item)
    );
};

Persistence.prototype.getById = function(id) {
  return this.collection.find({'_id' : id}).toArray()
  .then(function(res) {
    if(res.length < 1) {
      throw Error('Item with id ' + id + ' not found!');
    } else {
      return res[0];
    }
  });
};

Persistence.prototype.update = function(id, data) {
  return this.collection.updateOne({'_id' : id}, {'$set': data})
    .then(() => this.getById(id));
};

Persistence.prototype.getAll = function(offset, limit, sort, query) {
  query.fulltext = ''; // TODO
  return this.collection.find().sort(sort).skip(offset).limit(limit).toArray();
};

Persistence.prototype.count = function() {
  //query.fulltext = ''; // TODO
  return this.collection.count();
};

module.exports = Persistence;
