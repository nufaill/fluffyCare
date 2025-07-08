// //  swagger.ts
// import swaggerJsdoc from 'swagger-jsdoc';
// import swaggerUi from 'swagger-ui-express';

// const options = {
//   definition: {
//     openapi: '3.0.0',
//     info: {
//       title: 'FluffyCare API Documentation',
//       version: '1.0.0',
//       description: 'Complete API documentation for FluffyCare backend - A pet care service platform',
//       contact: {
//         name: 'FluffyCare Support',
//         email: 'support@fluffycare.com'
//       }
//     },
//     servers: [
//       {
//         url: 'http://localhost:5000',
//         description: 'Development server'
//       },
//       {
//         url: 'https://api.fluffycare.com',
//         description: 'Production server'
//       }
//     ],
//     components: {
//       securitySchemes: {
//         bearerAuth: {
//           type: 'http',
//           scheme: 'bearer',
//           bearerFormat: 'JWT'
//         },
//         cookieAuth: {
//           type: 'apiKey',
//           in: 'cookie',
//           name: 'token'
//         }
//       },
//       schemas: {
//         Error: {
//           type: 'object',
//           properties: {
//             message: {
//               type: 'string',
//               description: 'Error message'
//             },
//             error: {
//               type: 'string',
//               description: 'Error details'
//             }
//           }
//         },
//         Success: {
//           type: 'object',
//           properties: {
//             message: {
//               type: 'string',
//               description: 'Success message'
//             },
//             data: {
//               type: 'object',
//               description: 'Response data'
//             }
//           }
//         },
        
//         // Auth schemas
//         UserSignup: {
//           type: 'object',
//           required: ['email', 'password', 'name'],
//           properties: {
//             email: {
//               type: 'string',
//               format: 'email',
//               description: 'User email address'
//             },
//             password: {
//               type: 'string',
//               minLength: 6,
//               description: 'User password'
//             },
//             name: {
//               type: 'string',
//               description: 'User full name'
//             },
//             phone: {
//               type: 'string',
//               description: 'User phone number'
//             }
//           }
//         },
        
//         ShopSignup: {
//           type: 'object',
//           required: ['email', 'password', 'shopName', 'ownerName'],
//           properties: {
//             email: {
//               type: 'string',
//               format: 'email',
//               description: 'Shop email address'
//             },
//             password: {
//               type: 'string',
//               minLength: 6,
//               description: 'Shop password'
//             },
//             shopName: {
//               type: 'string',
//               description: 'Shop name'
//             },
//             ownerName: {
//               type: 'string',
//               description: 'Shop owner name'
//             },
//             phone: {
//               type: 'string',
//               description: 'Shop phone number'
//             },
//             address: {
//               type: 'string',
//               description: 'Shop address'
//             }
//           }
//         },
        
//         Login: {
//           type: 'object',
//           required: ['email', 'password'],
//           properties: {
//             email: {
//               type: 'string',
//               format: 'email',
//               description: 'Email address'
//             },
//             password: {
//               type: 'string',
//               description: 'Password'
//             }
//           }
//         },
        
//         OTPVerification: {
//           type: 'object',
//           required: ['email', 'otp'],
//           properties: {
//             email: {
//               type: 'string',
//               format: 'email',
//               description: 'Email address'
//             },
//             otp: {
//               type: 'string',
//               description: 'OTP code'
//             }
//           }
//         },
        
//         ResendOTP: {
//           type: 'object',
//           required: ['email'],
//           properties: {
//             email: {
//               type: 'string',
//               format: 'email',
//               description: 'Email address'
//             }
//           }
//         },
        
//         ForgotPassword: {
//           type: 'object',
//           required: ['email'],
//           properties: {
//             email: {
//               type: 'string',
//               format: 'email',
//               description: 'Email address'
//             }
//           }
//         },
        
//         ResetPassword: {
//           type: 'object',
//           required: ['token', 'password'],
//           properties: {
//             token: {
//               type: 'string',
//               description: 'Password reset token'
//             },
//             password: {
//               type: 'string',
//               minLength: 6,
//               description: 'New password'
//             }
//           }
//         },
        
//         GoogleAuth: {
//           type: 'object',
//           required: ['token'],
//           properties: {
//             token: {
//               type: 'string',
//               description: 'Google OAuth token'
//             }
//           }
//         },
        
//         // User schemas
//         UserProfile: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'string',
//               description: 'User ID'
//             },
//             name: {
//               type: 'string',
//               description: 'User name'
//             },
//             email: {
//               type: 'string',
//               format: 'email',
//               description: 'User email'
//             },
//             phone: {
//               type: 'string',
//               description: 'User phone'
//             },
//             address: {
//               type: 'string',
//               description: 'User address'
//             },
//             isActive: {
//               type: 'boolean',
//               description: 'User active status'
//             }
//           }
//         },
        
//         UpdateUserProfile: {
//           type: 'object',
//           properties: {
//             name: {
//               type: 'string',
//               description: 'User name'
//             },
//             phone: {
//               type: 'string',
//               description: 'User phone'
//             },
//             address: {
//               type: 'string',
//               description: 'User address'
//             }
//           }
//         },
        
//         // Pet schemas
//         Pet: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'string',
//               description: 'Pet ID'
//             },
//             name: {
//               type: 'string',
//               description: 'Pet name'
//             },
//             petTypeId: {
//               type: 'string',
//               description: 'Pet type ID'
//             },
//             breed: {
//               type: 'string',
//               description: 'Pet breed'
//             },
//             age: {
//               type: 'number',
//               description: 'Pet age'
//             },
//             weight: {
//               type: 'number',
//               description: 'Pet weight'
//             },
//             specialNotes: {
//               type: 'string',
//               description: 'Special notes about the pet'
//             },
//             userId: {
//               type: 'string',
//               description: 'Owner user ID'
//             }
//           }
//         },
        
//         CreatePet: {
//           type: 'object',
//           required: ['name', 'petTypeId'],
//           properties: {
//             name: {
//               type: 'string',
//               description: 'Pet name'
//             },
//             petTypeId: {
//               type: 'string',
//               description: 'Pet type ID'
//             },
//             breed: {
//               type: 'string',
//               description: 'Pet breed'
//             },
//             age: {
//               type: 'number',
//               description: 'Pet age'
//             },
//             weight: {
//               type: 'number',
//               description: 'Pet weight'
//             },
//             specialNotes: {
//               type: 'string',
//               description: 'Special notes about the pet'
//             }
//           }
//         },
        
//         // Service schemas
//         Service: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'string',
//               description: 'Service ID'
//             },
//             name: {
//               type: 'string',
//               description: 'Service name'
//             },
//             description: {
//               type: 'string',
//               description: 'Service description'
//             },
//             price: {
//               type: 'number',
//               description: 'Service price'
//             },
//             duration: {
//               type: 'number',
//               description: 'Service duration in minutes'
//             },
//             serviceTypeId: {
//               type: 'string',
//               description: 'Service type ID'
//             },
//             shopId: {
//               type: 'string',
//               description: 'Shop ID'
//             },
//             petTypes: {
//               type: 'array',
//               items: {
//                 type: 'string'
//               },
//               description: 'Supported pet type IDs'
//             },
//             isActive: {
//               type: 'boolean',
//               description: 'Service active status'
//             }
//           }
//         },
        
//         CreateService: {
//           type: 'object',
//           required: ['name', 'description', 'price', 'serviceTypeId', 'petTypes'],
//           properties: {
//             name: {
//               type: 'string',
//               description: 'Service name'
//             },
//             description: {
//               type: 'string',
//               description: 'Service description'
//             },
//             price: {
//               type: 'number',
//               description: 'Service price'
//             },
//             duration: {
//               type: 'number',
//               description: 'Service duration in minutes'
//             },
//             serviceTypeId: {
//               type: 'string',
//               description: 'Service type ID'
//             },
//             petTypes: {
//               type: 'array',
//               items: {
//                 type: 'string'
//               },
//               description: 'Supported pet type IDs'
//             }
//           }
//         },
        
//         // Shop schemas
//         ShopProfile: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'string',
//               description: 'Shop ID'
//             },
//             shopName: {
//               type: 'string',
//               description: 'Shop name'
//             },
//             ownerName: {
//               type: 'string',
//               description: 'Owner name'
//             },
//             email: {
//               type: 'string',
//               format: 'email',
//               description: 'Shop email'
//             },
//             phone: {
//               type: 'string',
//               description: 'Shop phone'
//             },
//             address: {
//               type: 'string',
//               description: 'Shop address'
//             },
//             isActive: {
//               type: 'boolean',
//               description: 'Shop active status'
//             },
//             isVerified: {
//               type: 'boolean',
//               description: 'Shop verification status'
//             }
//           }
//         },
        
//         UpdateShopProfile: {
//           type: 'object',
//           properties: {
//             shopName: {
//               type: 'string',
//               description: 'Shop name'
//             },
//             ownerName: {
//               type: 'string',
//               description: 'Owner name'
//             },
//             phone: {
//               type: 'string',
//               description: 'Shop phone'
//             },
//             address: {
//               type: 'string',
//               description: 'Shop address'
//             }
//           }
//         },
        
//         // Type schemas
//         PetType: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'string',
//               description: 'Pet type ID'
//             },
//             name: {
//               type: 'string',
//               description: 'Pet type name'
//             },
//             description: {
//               type: 'string',
//               description: 'Pet type description'
//             },
//             isActive: {
//               type: 'boolean',
//               description: 'Pet type active status'
//             }
//           }
//         },
        
//         ServiceType: {
//           type: 'object',
//           properties: {
//             id: {
//               type: 'string',
//               description: 'Service type ID'
//             },
//             name: {
//               type: 'string',
//               description: 'Service type name'
//             },
//             description: {
//               type: 'string',
//               description: 'Service type description'
//             },
//             isActive: {
//               type: 'boolean',
//               description: 'Service type active status'
//             }
//           }
//         },
        
//         CreatePetType: {
//           type: 'object',
//           required: ['name'],
//           properties: {
//             name: {
//               type: 'string',
//               description: 'Pet type name'
//             },
//             description: {
//               type: 'string',
//               description: 'Pet type description'
//             }
//           }
//         },
        
//         CreateServiceType: {
//           type: 'object',
//           required: ['name'],
//           properties: {
//             name: {
//               type: 'string',
//               description: 'Service type name'
//             },
//             description: {
//               type: 'string',
//               description: 'Service type description'
//             }
//           }
//         },
        
//         UpdateStatus: {
//           type: 'object',
//           required: ['isActive'],
//           properties: {
//             isActive: {
//               type: 'boolean',
//               description: 'Active status'
//             }
//           }
//         }
//       }
//     },
    
//     // Global tags
//     tags: [
//       {
//         name: 'Authentication',
//         description: 'User authentication endpoints'
//       },
//       {
//         name: 'User Management',
//         description: 'User profile and management endpoints'
//       },
//       {
//         name: 'Pet Management',
//         description: 'Pet-related endpoints'
//       },
//       {
//         name: 'Shop Authentication',
//         description: 'Shop authentication endpoints'
//       },
//       {
//         name: 'Shop Management',
//         description: 'Shop profile and management endpoints'
//       },
//       {
//         name: 'Service Management',
//         description: 'Service-related endpoints'
//       },
//       {
//         name: 'Admin Authentication',
//         description: 'Admin authentication endpoints'
//       },
//       {
//         name: 'Admin Management',
//         description: 'Admin management endpoints'
//       },
//       {
//         name: 'Public',
//         description: 'Public endpoints'
//       }
//     ],
    
//     // Define paths
//     paths: {
//       // Authentication routes
//       '/auth/signup': {
//         post: {
//           tags: ['Authentication'],
//           summary: 'User registration',
//           description: 'Register a new user account',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/UserSignup'
//                 }
//               }
//             }
//           },
//           responses: {
//             '201': {
//               description: 'User registered successfully. OTP sent to email.',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '400': {
//               description: 'Bad request - Invalid input data',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             },
//             '409': {
//               description: 'User already exists',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/auth/verify-otp': {
//         post: {
//           tags: ['Authentication'],
//           summary: 'Verify OTP',
//           description: 'Verify OTP for user registration',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/OTPVerification'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'OTP verified successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '400': {
//               description: 'Invalid OTP',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/auth/resend-otp': {
//         post: {
//           tags: ['Authentication'],
//           summary: 'Resend OTP',
//           description: 'Resend OTP to user email',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/ResendOTP'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'OTP sent successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '400': {
//               description: 'Bad request',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/auth/login': {
//         post: {
//           tags: ['Authentication'],
//           summary: 'User login',
//           description: 'Login user with email and password',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/Login'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Login successful',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '401': {
//               description: 'Invalid credentials',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/auth/google-login': {
//         post: {
//           tags: ['Authentication'],
//           summary: 'Google authentication',
//           description: 'Login/Register with Google OAuth',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/GoogleAuth'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Google authentication successful',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '401': {
//               description: 'Invalid Google token',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/auth/refresh-token': {
//         post: {
//           tags: ['Authentication'],
//           summary: 'Refresh access token',
//           description: 'Refresh JWT access token',
//           responses: {
//             '200': {
//               description: 'Token refreshed successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '401': {
//               description: 'Invalid refresh token',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/auth/forgot-password': {
//         post: {
//           tags: ['Authentication'],
//           summary: 'Send password reset link',
//           description: 'Send password reset link to user email',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/ForgotPassword'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Password reset link sent',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'User not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/auth/reset-password': {
//         post: {
//           tags: ['Authentication'],
//           summary: 'Reset password',
//           description: 'Reset user password with token',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/ResetPassword'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Password reset successful',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '400': {
//               description: 'Invalid or expired token',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/auth/logout': {
//         post: {
//           tags: ['Authentication'],
//           summary: 'User logout',
//           description: 'Logout user and invalidate tokens',
//           security: [{ bearerAuth: [] }],
//           responses: {
//             '200': {
//               description: 'Logout successful',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       // User routes
//       '/user/service-types': {
//         get: {
//           tags: ['Public'],
//           summary: 'Get all service types',
//           description: 'Get list of all active service types',
//           responses: {
//             '200': {
//               description: 'Service types retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         type: 'array',
//                         items: {
//                           $ref: '#/components/schemas/ServiceType'
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/user/pet-types': {
//         get: {
//           tags: ['Public'],
//           summary: 'Get all pet types',
//           description: 'Get list of all active pet types',
//           responses: {
//             '200': {
//               description: 'Pet types retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         type: 'array',
//                         items: {
//                           $ref: '#/components/schemas/PetType'
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/user/services': {
//         get: {
//           tags: ['Public'],
//           summary: 'Get all services',
//           description: 'Get list of all active services',
//           parameters: [
//             {
//               name: 'page',
//               in: 'query',
//               description: 'Page number',
//               schema: {
//                 type: 'integer',
//                 default: 1
//               }
//             },
//             {
//               name: 'limit',
//               in: 'query',
//               description: 'Number of items per page',
//               schema: {
//                 type: 'integer',
//                 default: 10
//               }
//             },
//             {
//               name: 'search',
//               in: 'query',
//               description: 'Search term',
//               schema: {
//                 type: 'string'
//               }
//             },
//             {
//               name: 'serviceTypeId',
//               in: 'query',
//               description: 'Filter by service type',
//               schema: {
//                 type: 'string'
//               }
//             },
//             {
//               name: 'petTypeId',
//               in: 'query',
//               description: 'Filter by pet type',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'Services retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         type: 'array',
//                         items: {
//                           $ref: '#/components/schemas/Service'
//                         }
//                       },
//                       pagination: {
//                         type: 'object',
//                         properties: {
//                           page: { type: 'integer' },
//                           limit: { type: 'integer' },
//                           total: { type: 'integer' },
//                           totalPages: { type: 'integer' }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/user/services/{serviceId}': {
//         get: {
//           tags: ['Public'],
//           summary: 'Get service by ID',
//           description: 'Get detailed information about a specific service',
//           parameters: [
//             {
//               name: 'serviceId',
//               in: 'path',
//               required: true,
//               description: 'Service ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'Service retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         $ref: '#/components/schemas/Service'
//                       }
//                     }
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Service not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/user/profile/{userId}': {
//         get: {
//           tags: ['User Management'],
//           summary: 'Get user profile',
//           description: 'Get user profile information',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'userId',
//               in: 'path',
//               required: true,
//               description: 'User ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'User profile retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         $ref: '#/components/schemas/UserProfile'
//                       }
//                     }
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'User not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/user/profile/update/{userId}': {
//         patch: {
//           tags: ['User Management'],
//           summary: 'Update user profile',
//           description: 'Update user profile information',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'userId',
//               in: 'path',
//               required: true,
//               description: 'User ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/UpdateUserProfile'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'User profile updated successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'User not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/user/add-pets': {
//         post: {
//           tags: ['Pet Management'],
//           summary: 'Add new pet',
//           description: 'Add a new pet to user account',
//           security: [{ bearerAuth: [] }],
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/CreatePet'
//                 }
//               }
//             }
//           },
//           responses: {
//             '201': {
//               description: 'Pet added successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         $ref: '#/components/schemas/Pet'
//                       }
//                     }
//                   }
//                 }
//               }
//             },
//             '400': {
//               description: 'Invalid input data',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
//       '/user/pets/{userId}': {
//         get: {
//           tags: ['Pet Management'],
//           summary: 'Get user pets',
//           description: 'Get all pets belonging to a user',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'userId',
//               in: 'path',
//               required: true,
//               description: 'User ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'Pets retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         type: 'array',
//                         items: {
//                           $ref: '#/components/schemas/Pet'
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/user/pets/{petId}': {
//         get: {
//           tags: ['Pet Management'],
//           summary: 'Get pet by ID',
//           description: 'Get detailed information about a specific pet',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'petId',
//               in: 'path',
//               required: true,
//               description: 'Pet ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'Pet retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         $ref: '#/components/schemas/Pet'
//                       }
//                     }
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Pet not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         },
//         put: {
//           tags: ['Pet Management'],
//           summary: 'Update pet',
//           description: 'Update pet information',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'petId',
//               in: 'path',
//               required: true,
//               description: 'Pet ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/CreatePet'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Pet updated successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Pet not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       // Shop routes
//       '/shop/signup': {
//         post: {
//           tags: ['Shop Authentication'],
//           summary: 'Shop registration',
//           description: 'Register a new shop account',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/ShopSignup'
//                 }
//               }
//             }
//           },
//           responses: {
//             '201': {
//               description: 'Shop registered successfully. OTP sent to email.',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '400': {
//               description: 'Bad request - Invalid input data',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             },
//             '409': {
//               description: 'Shop already exists',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/verify-otp': {
//         post: {
//           tags: ['Shop Authentication'],
//           summary: 'Verify shop OTP',
//           description: 'Verify OTP for shop registration',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/OTPVerification'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'OTP verified successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '400': {
//               description: 'Invalid OTP',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/resend-otp': {
//         post: {
//           tags: ['Shop Authentication'],
//           summary: 'Resend shop OTP',
//           description: 'Resend OTP to shop email',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/ResendOTP'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'OTP sent successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '400': {
//               description: 'Bad request',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/login': {
//         post: {
//           tags: ['Shop Authentication'],
//           summary: 'Shop login',
//           description: 'Login shop with email and password',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/Login'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Login successful',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '401': {
//               description: 'Invalid credentials',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/logout': {
//         post: {
//           tags: ['Shop Authentication'],
//           summary: 'Shop logout',
//           description: 'Logout shop and invalidate tokens',
//           security: [{ bearerAuth: [] }],
//           responses: {
//             '200': {
//               description: 'Logout successful',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/refresh-token': {
//         post: {
//           tags: ['Shop Authentication'],
//           summary: 'Refresh shop access token',
//           description: 'Refresh JWT access token for shop',
//           responses: {
//             '200': {
//               description: 'Token refreshed successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '401': {
//               description: 'Invalid refresh token',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/forgot-password': {
//         post: {
//           tags: ['Shop Authentication'],
//           summary: 'Send shop password reset link',
//           description: 'Send password reset link to shop email',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/ForgotPassword'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Password reset link sent',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Shop not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/reset-password': {
//         post: {
//           tags: ['Shop Authentication'],
//           summary: 'Reset shop password',
//           description: 'Reset shop password with token',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/ResetPassword'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Password reset successful',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '400': {
//               description: 'Invalid or expired token',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/service-types': {
//         get: {
//           tags: ['Public'],
//           summary: 'Get all service types (Shop)',
//           description: 'Get list of all active service types for shop',
//           responses: {
//             '200': {
//               description: 'Service types retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         type: 'array',
//                         items: {
//                           $ref: '#/components/schemas/ServiceType'
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/pet-types': {
//         get: {
//           tags: ['Public'],
//           summary: 'Get all pet types (Shop)',
//           description: 'Get list of all active pet types for shop',
//           responses: {
//             '200': {
//               description: 'Pet types retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         type: 'array',
//                         items: {
//                           $ref: '#/components/schemas/PetType'
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/profile/{shopId}': {
//         get: {
//           tags: ['Shop Management'],
//           summary: 'Get shop profile',
//           description: 'Get shop profile information',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'shopId',
//               in: 'path',
//               required: true,
//               description: 'Shop ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'Shop profile retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         $ref: '#/components/schemas/ShopProfile'
//                       }
//                     }
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Shop not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/profile/update': {
//         patch: {
//           tags: ['Shop Management'],
//           summary: 'Update shop profile',
//           description: 'Update shop profile information',
//           security: [{ bearerAuth: [] }],
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/UpdateShopProfile'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Shop profile updated successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Shop not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/service-create': {
//         post: {
//           tags: ['Service Management'],
//           summary: 'Create new service',
//           description: 'Create a new service for the shop',
//           security: [{ bearerAuth: [] }],
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/CreateService'
//                 }
//               }
//             }
//           },
//           responses: {
//             '201': {
//               description: 'Service created successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         $ref: '#/components/schemas/Service'
//                       }
//                     }
//                   }
//                 }
//               }
//             },
//             '400': {
//               description: 'Invalid input data',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/service-list': {
//         get: {
//           tags: ['Service Management'],
//           summary: 'Get shop services',
//           description: 'Get all services for the authenticated shop',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'page',
//               in: 'query',
//               description: 'Page number',
//               schema: {
//                 type: 'integer',
//                 default: 1
//               }
//             },
//             {
//               name: 'limit',
//               in: 'query',
//               description: 'Number of items per page',
//               schema: {
//                 type: 'integer',
//                 default: 10
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'Services retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         type: 'array',
//                         items: {
//                           $ref: '#/components/schemas/Service'
//                         }
//                       },
//                       pagination: {
//                         type: 'object',
//                         properties: {
//                           page: { type: 'integer' },
//                           limit: { type: 'integer' },
//                           total: { type: 'integer' },
//                           totalPages: { type: 'integer' }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/{serviceId}': {
//         get: {
//           tags: ['Service Management'],
//           summary: 'Get service by ID (Shop)',
//           description: 'Get detailed information about a specific service',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'serviceId',
//               in: 'path',
//               required: true,
//               description: 'Service ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'Service retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         $ref: '#/components/schemas/Service'
//                       }
//                     }
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Service not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         },
//         patch: {
//           tags: ['Service Management'],
//           summary: 'Update service',
//           description: 'Update service information',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'serviceId',
//               in: 'path',
//               required: true,
//               description: 'Service ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/CreateService'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Service updated successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Service not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/shop/{serviceId}/toggle-status': {
//         patch: {
//           tags: ['Service Management'],
//           summary: 'Toggle service status',
//           description: 'Toggle service active/inactive status',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'serviceId',
//               in: 'path',
//               required: true,
//               description: 'Service ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/UpdateStatus'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Service status updated successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Service not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       // Admin routes
//       '/admin/login': {
//         post: {
//           tags: ['Admin Authentication'],
//           summary: 'Admin login',
//           description: 'Login admin with email and password',
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/Login'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Login successful',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '401': {
//               description: 'Invalid credentials',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/admin/logout': {
//         post: {
//           tags: ['Admin Authentication'],
//           summary: 'Admin logout',
//           description: 'Logout admin and invalidate tokens',
//           security: [{ bearerAuth: [] }],
//           responses: {
//             '200': {
//               description: 'Logout successful',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/admin/shops': {
//         get: {
//           tags: ['Admin Management'],
//           summary: 'Get all shops',
//           description: 'Get list of all shops',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'page',
//               in: 'query',
//               description: 'Page number',
//               schema: {
//                 type: 'integer',
//                 default: 1
//               }
//             },
//             {
//               name: 'limit',
//               in: 'query',
//               description: 'Number of items per page',
//               schema: {
//                 type: 'integer',
//                 default: 10
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'Shops retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         type: 'array',
//                         items: {
//                           $ref: '#/components/schemas/ShopProfile'
//                         }
//                       },
//                       pagination: {
//                         type: 'object',
//                         properties: {
//                           page: { type: 'integer' },
//                           limit: { type: 'integer' },
//                           total: { type: 'integer' },
//                           totalPages: { type: 'integer' }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/admin/shops/{shopId}/status': {
//         patch: {
//           tags: ['Admin Management'],
//           summary: 'Update shop status',
//           description: 'Update shop active/inactive status',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'shopId',
//               in: 'path',
//               required: true,
//               description: 'Shop ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/UpdateStatus'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'Shop status updated successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Shop not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/admin/unverified': {
//         get: {
//           tags: ['Admin Management'],
//           summary: 'Get unverified shops',
//           description: 'Get list of unverified shops awaiting approval',
//           security: [{ bearerAuth: [] }],
//           responses: {
//             '200': {
//               description: 'Unverified shops retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         type: 'array',
//                         items: {
//                           $ref: '#/components/schemas/ShopProfile'
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/admin/unverified/{shopId}/approve': {
//         patch: {
//           tags: ['Admin Management'],
//           summary: 'Approve shop',
//           description: 'Approve unverified shop',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'shopId',
//               in: 'path',
//               required: true,
//               description: 'Shop ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'Shop approved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Shop not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/admin/unverified/{shopId}/reject': {
//         patch: {
//           tags: ['Admin Management'],
//           summary: 'Reject shop',
//           description: 'Reject unverified shop',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'shopId',
//               in: 'path',
//               required: true,
//               description: 'Shop ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'Shop rejected successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'Shop not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/admin/users': {
//         get: {
//           tags: ['Admin Management'],
//           summary: 'Get all users',
//           description: 'Get list of all users',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'page',
//               in: 'query',
//               description: 'Page number',
//               schema: {
//                 type: 'integer',
//                 default: 1
//               }
//             },
//             {
//               name: 'limit',
//               in: 'query',
//               description: 'Number of items per page',
//               schema: {
//                 type: 'integer',
//                 default: 10
//               }
//             }
//           ],
//           responses: {
//             '200': {
//               description: 'Users retrieved successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     type: 'object',
//                     properties: {
//                       data: {
//                         type: 'array',
//                         items: {
//                           $ref: '#/components/schemas/UserProfile'
//                         }
//                       },
//                       pagination: {
//                         type: 'object',
//                         properties: {
//                           page: { type: 'integer' },
//                           limit: { type: 'integer' },
//                           total: { type: 'integer' },
//                           totalPages: { type: 'integer' }
//                         }
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },
      
//       '/admin/users/{userId}/status': {
//         patch: {
//           tags: ['Admin Management'],
//           summary: 'Update user status',
//           description: 'Update user active/inactive status',
//           security: [{ bearerAuth: [] }],
//           parameters: [
//             {
//               name: 'userId',
//               in: 'path',
//               required: true,
//               description: 'User ID',
//               schema: {
//                 type: 'string'
//               }
//             }
//           ],
//           requestBody: {
//             required: true,
//             content: {
//               'application/json': {
//                 schema: {
//                   $ref: '#/components/schemas/UpdateStatus'
//                 }
//               }
//             }
//           },
//           responses: {
//             '200': {
//               description: 'User status updated successfully',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Success'
//                   }
//                 }
//               }
//             },
//             '404': {
//               description: 'User not found',
//               content: {
//                 'application/json': {
//                   schema: {
//                     $ref: '#/components/schemas/Error'
//                   }
//                 }
//               }
//             }
//           }
//         }
//       },