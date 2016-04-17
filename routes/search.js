const Boom = require('boom');
const policeapi = require('policecz-vehicles-client');
const Joi = require('joi');

const EasyXml = require('easyxml');

const serializer = new EasyXml({
  singularize: true,
  rootElement: 'response',
  dateFormat: 'ISO',
  manifest: true
});

const wrapError = (err) => Boom.badRequest(err);

const search = (query) => policeapi.search(query);


module.exports = function(server) {
  server.route({
    method: 'GET',
    path: '/api/search',
    config: {
      auth: false,
      tags: ['api', 'search'],
      validate: {
        query: {
          q: Joi.string().min(1).required().description('VIN code or registration number'),
          format: Joi.string().default('json').allow('json', 'xml').description('Deprecated, json is the preferred format')
        }
      }
    },
    handler: function (request, reply) {
      search(request.query.q)
        .catch(wrapError)
        .then(result => {
          if (request.query.format === 'json') {
            reply(result);
          } else {
            reply(serializer.render(result)).type('text/xml');
          }
        })
        .done();
    }
  });
};
