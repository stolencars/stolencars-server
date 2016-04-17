const yaml = require('js-yaml');

module.exports = function(server) {

  const service = server.plugins.services.vehicles;

  server.route({
    method: 'GET',
    path: '/export',
    config: { auth: false, tags: ['api']},
    handler: function (request, reply) {
      request.server.plugins.services.vehicles.getAll({}).then(res => reply(yaml.safeDump(res.results)));
    }
  });
};
