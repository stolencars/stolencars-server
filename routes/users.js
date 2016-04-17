const Boom = require('boom');
const Joi = require('joi');


var service = null;

const wrapError = (err) => {console.log(err); return Boom.badRequest(err);};

const create = function(request, reply) {
  service.create(request.payload.email, request.payload.password, ['user'])
  .catch(wrapError)
  .then(reply);
};

const login = function(request, reply) {
  service.login(request.payload.email, request.payload.password)
  .catch(wrapError)
  .then(reply);
};

const validate = {
  payload: {
    email: Joi.string().email().default('your.email@domain.com').required(),
    password: Joi.string().min(5).required()
  }
};


module.exports = function(server) {
  service = server.plugins.services.users;
  server.route({
    method: 'POST',
    path: '/api/users/create',
    config: { auth: false, validate:validate, tags: ['api']},
    handler: create
  });

  server.route({
    method: 'POST',
    path: '/api/users/login',
    config: { auth: false, validate:validate, tags: ['api'] },
    handler: login
  });

  // TODO: change password, forgotten password
  // TODO: getAll for admin purposes?
};
