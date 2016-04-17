const HapiSwagger = require('hapi-swagger');

const options = {
  info: {
    'title': 'Stolen vehicles API Documentation',
    'version': require('./package').version,
    'contact': {
      name: 'Tomas Dvorak',
      email: 'todvora@gmail.com',
      url: 'http://api.odcizena-vozidla.cz'
    }
  },
  pathPrefixSize:2,
  jsonEditor:true,
  documentationPath: '/'
};


module.exports = {'register': HapiSwagger, 'options': options};
