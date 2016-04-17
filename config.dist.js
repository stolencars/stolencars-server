module.exports = {
  server: { // directly passed to hapi
    port: process.env.NODE_PORT || 3000,
    host: process.env.NODE_IP || 'localhost'
  },
  jwt: {
    secret:'changeit',
    expiresIn: '30 days'
  },
  db: {
    url: 'mongodb://localhost:27017/test?autoReconnect=true'
  }
};
