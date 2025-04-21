import request from 'supertest';
import app from '../../mocks/server.js'; 
import { jest } from '@jest/globals';
import { Category, Item } from '../../mocks/models.js'; // Adjust the import path as necessary

describe('Categories API Integration Tests', () => {
  // Test tokens
  const adminToken = 'valid-token';
  const playerToken = 'player-token';
  
  // Mock data
  let testCategories;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Define test categories with hierarchical structure
    testCategories = [
      { 
        id: 1, 
        name: 'Weapons', 
        description: 'Items used for combat',
        parentid: null,
        subcategories: [
          { id: 4, name: 'Swords', description: 'Melee weapons', parentid: 1 },
          { id: 5, name: 'Bows', description: 'Ranged weapons', parentid: 1 }
        ]
      },
      {
        id: 2,
        name: 'Armor',
        description: 'Protective gear',
        parentid: null,
        subcategories: [
          { id: 6, name: 'Helmets', description: 'Head protection', parentid: 2 }
        ]
      },
      {
        id: 3,
        name: 'Consumables',
        description: 'One-time use items',
        parentid: null,
        subcategories: []
      }
    ];
    
    // Setup Category mocks
    Category.findAll.mockResolvedValue(testCategories);
    
    Category.findByPk.mockImplementation((id, options) => {
      const category = testCategories.find(c => c.id === parseInt(id));
      return Promise.resolve(category || null);
    });
    
    Category.create.mockImplementation((data) => {
      return Promise.resolve({ id: 7, ...data });
    });
    
    Category.update.mockImplementation((data, options) => {
      const id = options?.where?.id;
      const categoryIndex = testCategories.findIndex(c => c.id === id);
      
      if (categoryIndex === -1) {
        return Promise.resolve([0]);
      }
      
      return Promise.resolve([1]);
    });
    
    Category.destroy.mockImplementation((options) => {
      const id = options?.where?.id;
      const categoryIndex = testCategories.findIndex(c => c.id === id);
      
      if (categoryIndex === -1) {
        return Promise.resolve(0);
      }
      
      return Promise.resolve(1);
    });
    
    // Mock items for category
    Item.findAll.mockResolvedValue([
      { id: 1, name: 'Iron Sword', categoryid: 1 },
      { id: 2, name: 'Steel Sword', categoryid: 1 }
    ]);
    Item.count.mockResolvedValue(2);
  });

  // GET /api/categories - List all categories
  describe('GET /api/categories', () => {
    it('should return all categories', async () => {
      const response = await request(app)
        .get('/api/categories')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('name', 'Weapons');      
    });
  });  
});