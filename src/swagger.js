const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Anime Info API',
    description: 'API de informações de anime. Baseado em diversas fontes de informação na internet.',
  },
  basePath: '/api/v1',  
  host: 'anime-info-api.achimid.com.br',
  schemes: ['https'],
};

const outputFile = '../swagger-output.json';
const endpointsFiles = ['./src/config/routes.js'];

swaggerAutogen(outputFile, endpointsFiles, doc);