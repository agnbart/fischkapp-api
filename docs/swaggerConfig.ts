import * as swaggerJSDoc from 'swagger-jsdoc';

interface SwaggerOptions {
    definition: {
        openapi: string;
        info: {
            title: string;
            version: string;
            description: string;
        };
        components?: {
            securitySchemes?: {
                APIKeyAuth?: {
                    type: string;
                    in: string;
                    name: string;
                    description: string;
                };
            };
        };
    };
    apis: string[];
    security?: {
        APIKeyAuth?: any[];
    }[];
}

const options: SwaggerOptions = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'API of Fischkapp',
            version: '1.0.0',
            description: 'API documentation for my project',
        },
        components: {
            securitySchemes: {
                APIKeyAuth: {
                    type: 'apiKey',
                    in: 'header',
                    name: 'Authorization',
                    description: 'Insert your API key (pss-this-is-my-secret) as the value.',
                },
            },
        },
    },
    apis: ['./routers/*.ts'],
    security: [
        {
            APIKeyAuth: [],
        },
    ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
