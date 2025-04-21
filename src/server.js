import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { initializeDb } from './config/database.js';
import routes from './routes/index.js';
import errorMiddleware from './middleware/error.middleware.js';
import logger from './utils/logger.js';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Setup Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Game Catalog API',
      version: '1.0.0',
      description: 'API for managing MMORPG game items'
    },
    servers: [
      {
        url: `http://localhost:${PORT}/api`,
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js']
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Apply middlewares
app.use(helmet()); // Security headers
app.use(cors());   // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // HTTP request logging

// API documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// API routes
app.use('/api', routes);

// Error handling middleware
app.use(errorMiddleware);

// Start server
async function startServer() {
    try {
      // Initialize database connection
      await initializeDb();
      
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
        logger.info(`API Documentation available at http://localhost:${PORT}/api-docs`);
      });
    } catch (error) {
      logger.error('Failed to start server:', error);
      process.exit(1);
    }
  }
  
  startServer();
  
  export default app;