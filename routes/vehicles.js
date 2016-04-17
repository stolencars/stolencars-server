const Boom = require('boom');
const Joi = require('joi');

var service = null;

const authValidation =  Joi.object({
  authorization: Joi.string().required()
}).options({ allowUnknown: true }); // allow another headers too

const wrapError = (err) => {console.error(err); return Boom.badRequest(err);};

const getById = function(request, reply) {
  service.getById(request.params.id)
    .catch(() => Boom.notFound('Vehicle with this id not found', {id:request.params.id}))
    .then(reply);

};

const insert = function(request, reply) {
  service.insert(request.payload, request.auth.credentials)
  .then(function(result){
    reply(result)
    .header('location', '/api/vehicles/' + result.data._id)
    .code(201);
  })
  .catch(function(error) {
    reply(Boom.badRequest(error));
  });

};

const remove = function(request, reply) {
  service.remove(request.params.id, request.auth.credentials)
  .catch(wrapError)
  .then(reply);

};

const update = function(request, reply) {
  service.update(request.params.id, request.payload, request.auth.credentials)
  .catch(wrapError)
  .then(reply);

};

const getAll = function(request, reply) {
  service.getAll({
    from: request.query.from,
    count: request.query.count
  })
  .catch(wrapError)
  .then(reply);

};

const getVehiclePicture = (request, reply) => {
  // TODO
  reply({});
};

const setVehiclePicture = (request, reply) => {
  service.attachImage(request.params.id, request.payload.image, request.auth.credentials)
  .catch(wrapError)
  .then(reply);

};

const deleteVehiclePicture = (request, reply) => {
  // TODO
  reply({});
};


module.exports = function(server) {


  service = server.plugins.services.vehicles;

  server.route({
    method: 'GET',
    path: '/api/vehicles',
    config: {
      auth: false,
      tags: ['api'],
      validate: {
        query: {
          offset: Joi.number().integer().default(1).description('Skip first N results. from=0 means start with first (newest) item'),
          limit: Joi.number().integer().min(1).max(100).default(10).description('Number of returned results'),
          q: Joi.string().description('Fulltext query search')
        }
      }
    },
    handler: getAll
  });

  server.route({
    method: 'GET',
    path: '/api/vehicles/{id}',
    config: {
      auth: false,
      tags: ['api'],
      validate: {
        params : {
          id: Joi.string().required()
        }
      }
    },
    handler: getById
  });

  server.route({
    method: 'POST',
    path: '/api/vehicles/{id}/picture',
    config: {
      auth: 'jwt',
      tags: ['api'],
      validate: {
        params : {
          id: Joi.string().required()
        },
        payload:{
          image: Joi.any().meta({ swaggerType: 'file' }).description('Image file')
        },
        headers: authValidation
      },
      payload: {
        maxBytes: 1048576,
        parse: true,
        output: 'file'
      },
      plugins: {
        'hapi-swagger': {
          payloadType: 'form'
        }
      }
    },
    handler: setVehiclePicture
  });

  server.route({
    method: 'GET',
    path: '/api/vehicles/{id}/picture/{picture_id}',
    config: {
      auth: false,
      tags: ['api'],
      validate: {
        params : {
          id: Joi.string().required(),
          picture_id: Joi.string().required()
        }
      }
    },
    handler: getVehiclePicture
  });

  server.route({
    method: 'DELETE',
    path: '/api/vehicles/{id}/picture/{picture_id}',
    config: {
      auth: 'jwt',
      tags: ['api'],
      validate: {
        params : {
          vehicle_id: Joi.string().required(),
          picture_id: Joi.string().required()
        },
        headers: authValidation
      }
    },
    handler: deleteVehiclePicture
  });

  server.route({
    method: 'POST',
    path: '/api/vehicles',
    config: {
      tags: ['api'],
      validate: {
        payload: {
          vehicle_class: Joi.string().default('osobní vozidlo'),
          type: Joi.string().min(1).required(),
          registration_code: Joi.string().min(1),
          color: Joi.string().min(1).required(),
          vin: Joi.string().min(1).required(),
          stolen_date: Joi.date().default(Date.now, 'time of theft'),
          year: Joi.number().integer().required().description('year of productoin or model year'),
        },
        headers: authValidation
      }
    },
    handler: insert
  });

  server.route({
    method: 'PATCH',
    path: '/api/vehicles/{id}',
    config: {
      auth: 'jwt',
      tags: ['api'],
      validate: {
        params : {
          id: Joi.string().required()
        },
        headers: authValidation,
        payload: Joi.object().keys({
            // define, which fields can be patched / updated
          type: Joi.string().min(1),
          reward: Joi.string().allow(null),
          description: Joi.string().allow(null)
        })
      }
    },
    handler: update
  });

  server.route({
    method: 'DELETE',
    path: '/api/vehicles/{id}',
    config: {
      auth: 'jwt',
      tags: ['api'],
      validate: {
        params : {
          id: Joi.string().required()
        },
        headers: authValidation
      }

    },
    handler: remove
  });
};
