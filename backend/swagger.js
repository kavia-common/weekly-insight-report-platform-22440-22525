const swaggerJSDoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DigitalT3 Weekly Report Platform - Backend API',
      version: '1.0.0',
      description:
        'REST API for authentication, reports, analytics, admin operations, and platform metrics.',
    },
  },
  apis: [
    './src/routes/*.js',
  ], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);
module.exports = swaggerSpec;
