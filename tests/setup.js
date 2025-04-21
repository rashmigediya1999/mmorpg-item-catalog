
import dotenv from 'dotenv';
import { jest } from '@jest/globals';
import { Item, Category, Rarity, User, Role, Inventory } from './mocks/models.js';

// Setup environment variables for testing
dotenv.config({ path: '.env.test' });

// Set NODE_ENV to test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';

// Mock Sequelize with a more complete implementation
const mockSequelize = {
  define: jest.fn().mockImplementation((modelName, attributes, options) => {
    // Return a mock model with all the common model methods
    return {
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
      count: jest.fn(),
      belongsTo: jest.fn(),
      hasMany: jest.fn(),
      belongsToMany: jest.fn()
    };
  }),
  authenticate: jest.fn().mockResolvedValue(),
  sync: jest.fn().mockResolvedValue(),
  transaction: jest.fn().mockImplementation(async (fn) => {
    const mockTransaction = {
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue()
    };
    
    if (typeof fn === 'function') {
      return fn(mockTransaction);
    }
    
    return mockTransaction;
  }),
  close: jest.fn().mockResolvedValue(),
  literal: jest.fn(val => val),
  Op: {
    eq: Symbol('eq'),
    ne: Symbol('ne'),
    gte: Symbol('gte'),
    gt: Symbol('gt'),
    lte: Symbol('lte'),
    lt: Symbol('lt'),
    not: Symbol('not'),
    is: Symbol('is'),
    in: Symbol('in'),
    notIn: Symbol('notIn'),
    like: Symbol('like'),
    notLike: Symbol('notLike'),
    iLike: Symbol('iLike'),
    notILike: Symbol('notILike'),
    or: Symbol('or'),
    and: Symbol('and')
  }
};

// Mock jsonwebtoken module
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('test-token'),
  verify: jest.fn().mockImplementation((token, secret) => {
    if (token === 'valid-token' || token === 'test-token') {
      return { id: 1, username: 'admin', role: 'Admin' };
    } else if (token === 'player-token') {
      return { id: 2, username: 'player', role: 'Player' };
    }
    throw new Error('Invalid token');
  })
}));

// Mock the models module to avoid circular dependencies
jest.mock('../src/models/index.js', () => {
  return {
    Item,
    Category,
    Rarity,
    User,
    Role,
    Inventory
  };
});

// Mock bcryptjs
jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn().mockResolvedValue(true)
}));

// Mock the logger to avoid console output during tests
jest.mock('../src/utils/logger.js', () => ({
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
}));

// IMPORTANT: Mock Sequelize before any imports can use it
// Mock the database config to avoid actual database calls
jest.mock('../src/config/database.js', () => {
  const mockSequelize = {
    define: jest.fn((modelName, attributes, options) => {
      // Return a mock model with all the common model methods
      return {
        findAll: jest.fn(),
        findByPk: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        destroy: jest.fn(),
        count: jest.fn(),
        belongsTo: jest.fn(),
        hasMany: jest.fn(),
        belongsToMany: jest.fn()
      };
    }),
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
    transaction: jest.fn().mockImplementation(async (fn) => {
      const mockTransaction = {
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue()
      };
      
      if (typeof fn === 'function') {
        return fn(mockTransaction);
      }
      
      return mockTransaction;
    }),
    close: jest.fn().mockResolvedValue(),
    literal: jest.fn(val => val),
    Op: {
      eq: Symbol('eq'),
      ne: Symbol('ne'),
      gte: Symbol('gte'),
      gt: Symbol('gt'),
      lte: Symbol('lte'),
      lt: Symbol('lt'),
      not: Symbol('not'),
      is: Symbol('is'),
      in: Symbol('in'),
      notIn: Symbol('notIn'),
      like: Symbol('like'),
      notLike: Symbol('notLike'),
      iLike: Symbol('iLike'),
      notILike: Symbol('notILike'),
      or: Symbol('or'),
      and: Symbol('and')
    }
  };
  
  return {
    sequelize: mockSequelize,
    initializeDb: jest.fn().mockResolvedValue()
  };
});

// Also mock the Sequelize module
jest.mock('sequelize', () => {
  const DataTypes = {
    INTEGER: 'INTEGER',
    STRING: jest.fn().mockImplementation((size) => `STRING(${size})`),
    TEXT: 'TEXT',
    BOOLEAN: 'BOOLEAN',
    DATE: 'DATE',
    DECIMAL: jest.fn().mockImplementation((precision, scale) => `DECIMAL(${precision},${scale})`),
    JSONB: 'JSONB',
    VIRTUAL: 'VIRTUAL'
  };
  
  return {
    DataTypes,
    Op: mockSequelize.Op
  };
});

// Set up global test helpers
global.testUtils = {
  createMockResponse: () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    res.send = jest.fn().mockReturnValue(res);
    return res;
  }
};

// Cleanup after all tests
afterAll(async () => {
  // Any cleanup needed after tests
});