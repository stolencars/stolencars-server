var supertest = require('supertest-as-promised');
var assert = require('assert');

const RestServer = require('../rest-server');

describe('REST API integration test',function() {

  var app;
  var server;
  var jwtToken;

  before(function() {

    return new RestServer()
    .then(function(instance) {
      server = instance;
      app = supertest.agent(instance.info.uri);
    })
    .then(function(){
      return server.plugins.db.collection('users').removeMany();
    })
    .then(function(){
      return server.plugins.db.collection('vehicles').removeMany();
    })
    .then(function(){
      return app
      .post('/api/users/create')
      .send({
        email:'lorem.ipsum@dolor.sit',
        password: 'foobar'
      })
      // .expect('Content-type',/json/)
      .expect(200) // THis is HTTP response
      .then(function (res) {
        jwtToken = res.text;
      });
    })
    .catch(err => console.error(err));

  });

  after(function() {
    server.stop();
  });

  it('should return empty results', function(){
    return app
    .get('/api/vehicles')
    .expect('Content-type',/json/)
    .expect(200) // THis is HTTP response
    .then(function (res) {
      // HTTP status should be 200
      assert.equal(res.body.results.length, 0);
    });
  });

  var corsaID;

  it('should insert one vehicle', function(){
    return app
    .post('/api/vehicles')
    .set('Authorization', jwtToken)
    .expect('Content-type',/json/)
    .expect(201) // THis is HTTP response
    .send({
      'type':'Opel Corsa',
      'color':'red',
      'vin':'123456'
    })
    .then(function(res) {
      assert.ok(res.body.data._id);
      corsaID = res.body.data._id;
      assert.equal(res.headers.location, '/api/vehicles/' + corsaID);
    });
  });

  it('should get one vehicle details', function(){
    return app
    .get('/api/vehicles/' + corsaID)
    .expect('Content-type',/json/)
    .expect(200) // THis is HTTP response
    .then(function(res) {
      assert.equal(res.body.type, 'Opel Corsa');
    });
  });

  it('should respond with 404 for unknown ID', function(){
    return app
    .get('/api/vehicles/' + corsaID + '-nonsense')
    .expect('Content-type',/json/)
    .expect(404); // THis is HTTP response
  });

  it('should update vehicle details', function(){
    return app
    .patch('/api/vehicles/' + corsaID)
    .set('Authorization', jwtToken)
    .send({
      'type': 'Opel Frontera'
    })
    .expect('Content-type',/json/)
    .expect(200) // THis is HTTP response
    .then(function(res) {
      assert.equal(res.body.new_value.type, 'Opel Frontera');
    });
  });

  it('should reflect last update of vehicle', function(){
    return app
    .get('/api/vehicles/' + corsaID)
    .expect('Content-type',/json/)
    .expect(200) // THis is HTTP response
    .then(function(res) {
      assert.equal(res.body.type, 'Opel Frontera');
    });
  });

  it('should block update with invalid password' , function(){
    return app
    .patch('/api/vehicles/' + corsaID)
    .set('Authorization', 'xyz' + jwtToken)
    .send({
      'fields': {
        'type': 'Opel Monterey'
      }
    })
    .expect('Content-type',/json/)
    .expect(401) // THis is HTTP response
    .then(function(res) {
      assert.equal(res.body.message, 'Invalid token');
    });
  });

  it('should remove one vehicle', function(){
    return app
    .del('/api/vehicles/' + corsaID)
    .set('Authorization', jwtToken)
    .expect('Content-type',/json/)
    .expect(200) // THis is HTTP response
    .then(function(res) {
      assert.equal(res.body.removed, true);
      assert.equal(res.body.value.type, 'Opel Frontera');
    });
  });
});
