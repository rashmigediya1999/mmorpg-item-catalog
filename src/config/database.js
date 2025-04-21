// src/config/database.js
import { Sequelize } from 'sequelize';
import logger from '../utils/logger.js';

// Create sequelize instance
const createSequelize = () => {
  return new Sequelize(
    process.env.DB_NAME || 'game_catalog',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: msg => logger.debug(msg),
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      }
    }
  );
};

// Determine if we're running in test mode with Jest
const isTestWithJest = process.env.NODE_ENV === 'test' && process.env.JEST_WORKER_ID !== undefined;

// Create real or mock sequelize based on environment
let sequelizeInstance;

if (isTestWithJest) {
  // Mock implementation for testing with Jest
  sequelizeInstance = {
    authenticate: async () => Promise.resolve(),
    sync: async () => Promise.resolve(),
    queryInterface: {
      createTable: async () => Promise.resolve(),
      dropTable: async () => Promise.resolve()
    },
    close: async () => Promise.resolve(),
    transaction: async (fn) => {
      const mockTransaction = {
        commit: async () => Promise.resolve(),
        rollback: async () => Promise.resolve()
      };
      
      if (typeof fn === 'function') {
        return fn(mockTransaction);
      }
      
      return mockTransaction;
    }
  };
  
  logger.info('Using mock database for testing with Jest');
} else {
  // Real implementation for development, production, or integration tests
  sequelizeInstance = createSequelize();
}

// Export the appropriate sequelize instance
export const sequelize = sequelizeInstance;

// Database initialization function
export const initializeDb = async () => {
  try {
    if (isTestWithJest) {
      // No need to initialize mock database
      return Promise.resolve();
    }
    
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    
    // Only sync in development or test
    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      logger.info('Database models synchronized');
    }
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

export default { sequelize, initializeDb };