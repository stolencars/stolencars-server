module.exports = function(server) {
  server.route({
    method: 'GET',
    path: '/health',
    config: { auth: false, tags: ['api']},
    handler: function (request, reply) {
      reply();
    }
  });
};
