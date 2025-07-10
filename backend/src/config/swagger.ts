// config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'FluffyCare API Docs',
      version: '1.0.0',
      description: 'API documentation for FluffyCare backend, providing endpoints for user, shop, admin, and authentication functionalities.',
    },
    servers: [
      {
        url: process.env.CLIENT_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            profileImage: { type: 'string' },
            phone: { type: 'string' },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['Point'] },
                coordinates: { type: 'array', items: { type: 'number' } },
              },
            },
            isActive: { type: 'boolean' },
            googleId: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['fullName', 'email', 'location'],
        },
        Pet: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            petTypeId: { type: 'string' },
            profileImage: { type: 'string' },
            name: { type: 'string' },
            breed: { type: 'string' },
            age: { type: 'number' },
            gender: { type: 'string', enum: ['Male', 'Female'] },
            weight: { type: 'number' },
            additionalNotes: { type: 'string' },
            friendlyWithPets: { type: 'boolean' },
            friendlyWithOthers: { type: 'boolean' },
            trainedBefore: { type: 'boolean' },
            vaccinationStatus: { type: 'boolean' },
            medication: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['userId', 'petTypeId', 'profileImage', 'name', 'breed', 'age', 'gender', 'weight'],
        },
        Shop: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            logo: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            city: { type: 'string' },
            streetAddress: { type: 'string' },
            description: { type: 'string' },
            certificateUrl: { type: 'string' },
            isActive: { type: 'boolean' },
            isVerified: { type: 'boolean' },
            location: {
              type: 'object',
              properties: {
                type: { type: 'string', enum: ['Point'] },
                coordinates: { type: 'array', items: { type: 'number' } },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['name', 'email', 'phone', 'password', 'city', 'streetAddress', 'certificateUrl', 'location'],
        },
        Service: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            shopId: { type: 'string' },
            serviceTypeId: { type: 'string' },
            petTypeIds: { type: 'array', items: { type: 'string' } },
            name: { type: 'string' },
            description: { type: 'string' },
            price: { type: 'number' },
            image: { type: 'string' },
            durationHoure: { type: 'number' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['shopId', 'serviceTypeId', 'petTypeIds', 'name', 'description', 'price', 'durationHoure'],
        },
        PetType: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['name'],
        },
        ServiceType: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['name'],
        },
        Admin: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            fullName: { type: 'string' },
            email: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['fullName', 'email'],
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'User', description: 'User-related endpoints' },
      { name: 'Shop', description: 'Shop-related endpoints' },
      { name: 'Admin', description: 'Admin-related endpoints' },
    ],
  },
  apis: ['../routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };