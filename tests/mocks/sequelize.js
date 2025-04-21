import { jest } from '@jest/globals';

// Mock sequelize object with all needed functions
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

export const sequelize = mockSequelize;
export const DataTypes = {
  INTEGER: 'INTEGER',
  STRING: jest.fn().mockImplementation((size) => `STRING(${size})`),
  TEXT: 'TEXT',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  DECIMAL: jest.fn().mockImplementation((precision, scale) => `DECIMAL(${precision},${scale})`),
  JSONB: 'JSONB',
  VIRTUAL: 'VIRTUAL'
};

export default { sequelize, DataTypes };