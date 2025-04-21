import { jest } from '@jest/globals';

export const Item = {
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
  
  export const Category = {
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
  
  export const Rarity = {
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
  
  export const User = {
    findAll: jest.fn(),
    findByPk: jest.fn().mockImplementation(async (id) => {
      if (id === 1) {
        return { id: 1, username: 'admin', Role: { name: 'Admin' } };
      } else if (id === 2) {
        return { id: 2, username: 'player', Role: { name: 'Player' } };
      }
      return null;
    }),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    count: jest.fn(),
    belongsTo: jest.fn(),
    hasMany: jest.fn(),
    belongsToMany: jest.fn()
  };
  
  export const Role = {
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
  
  export const Inventory = {
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
  
  export default {
    Item,
    Category,
    Rarity,
    User,
    Role,
    Inventory
  };