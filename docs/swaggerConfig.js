const swaggerJSDoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'My API',
            version: '1.0.0',
            description: 'API documentation for my project',
        },
    },
    apis: ['../routers/*.ts'],  // Ścieżki do plików z route'ami, możesz dostosować według swoich potrzeb
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = swaggerSpec;
