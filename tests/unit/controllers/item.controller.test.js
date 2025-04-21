import { jest } from '@jest/globals';

// Mock the service
const mockItemService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  search: jest.fn()
};

// Simple controller implementation to test
const itemController = {
  findAll: async (req, res, next) => {
    try {
      const { page, size, category, rarity, minLevel, name } = req.query;
      
      const filter = {};
      if (category) filter.categoryid = parseInt(category);
      if (rarity) filter.rarityid = parseInt(rarity);
      if (minLevel) filter.levelReq = { $gte: parseInt(minLevel) };
      if (name) filter.name = { $iLike: `%${name}%` };
      
      const options = {};
      if (page !== undefined || size !== undefined) {
        const limit = size ? parseInt(size) : 10;
        const offset = page ? parseInt(page) * limit : 0;
        options.limit = limit;
        options.offset = offset;
      }
      
      const data = await mockItemService.findAll(filter, options);
      
      const response = {
        items: data.items,
        meta: {
          totalItems: data.count,
          itemsPerPage: options.limit || 10,
          totalPages: Math.ceil(data.count / (options.limit || 10)),
          currentPage: page ? parseInt(page) : 0
        }
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  },
  
  findOne: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const item = await mockItemService.findById(id);
      
      if (!item) {
        return res.status(404).json({
          message: `Item with ID ${id} not found`
        });
      }
      
      res.status(200).json(item);
    } catch (error) {
      next(error);
    }
  },
  
  create: async (req, res, next) => {
    try {
      const newItem = await mockItemService.create(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      next(error);
    }
  },
  
  update: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updatedItem = await mockItemService.update(id, req.body);
      
      if (!updatedItem) {
        return res.status(404).json({
          message: `Item with ID ${id} not found`
        });
      }
      
      res.status(200).json(updatedItem);
    } catch (error) {
      next(error);
    }
  },
  
  delete: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await mockItemService.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          message: `Item with ID ${id} not found`
        });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
  
  search: async (req, res, next) => {
    try {
      const { query, page, size } = req.query;
      
      if (!query || query.trim() === '') {
        return res.status(400).json({
          message: 'Search query is required'
        });
      }
      
      const options = {};
      if (page !== undefined || size !== undefined) {
        const limit = size ? parseInt(size) : 10;
        const offset = page ? parseInt(page) * limit : 0;
        options.limit = limit;
        options.offset = offset;
      }
      
      const items = await mockItemService.search(query, options);
      const count = items.length;
      
      const response = {
        items,
        meta: {
          totalItems: count,
          itemsPerPage: options.limit || 10,
          totalPages: Math.ceil(count / (options.limit || 10)),
          currentPage: page ? parseInt(page) : 0
        }
      };
      
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
};

describe('Item Controller', () => {
  let req;
  let res;
  let next;
  
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Setup request, response, and next function
    req = {
      params: {},
      query: {},
      body: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });
  
  describe('findAll', () => {
    it('should return items with pagination', async () => {
      // Arrange
      req.query = {
        page: '0',
        size: '10'
      };
      
      const mockItems = [
        { id: 1, name: 'Sword' },
        { id: 2, name: 'Shield' }
      ];
      
      const mockResponse = {
        items: mockItems,
        count: 2
      };
      
      mockItemService.findAll.mockResolvedValue(mockResponse);
      
      // Act
      await itemController.findAll(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData).toHaveProperty('items', mockItems);
      expect(responseData).toHaveProperty('meta');
      expect(responseData.meta).toHaveProperty('totalItems', 2);
    });
    
    it('should apply filters from query parameters', async () => {
      // Arrange
      req.query = {
        page: '0',
        size: '10',
        category: '1',
        rarity: '2',
        minLevel: '5',
        name: 'sword'
      };
      
      mockItemService.findAll.mockResolvedValue({ items: [], count: 0 });
      
      // Act
      await itemController.findAll(req, res, next);
      
      // Assert
      const expectedFilter = {
        categoryid: 1,
        rarityid: 2,
        levelReq: { $gte: 5 },
        name: { $iLike: '%sword%' }
      };
      
      // Check that filter was properly constructed
      expect(mockItemService.findAll).toHaveBeenCalledTimes(1);
      
      const callArgs = mockItemService.findAll.mock.calls[0][0];
      expect(callArgs).toHaveProperty('categoryid', 1);
      expect(callArgs).toHaveProperty('rarityid', 2);
      expect(callArgs).toHaveProperty('levelReq');
      expect(callArgs).toHaveProperty('name');
    });
    
    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Test error');
      mockItemService.findAll.mockRejectedValue(error);
      
      // Act
      await itemController.findAll(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('findOne', () => {
    it('should return item by id', async () => {
      // Arrange
      req.params = { id: '1' };
      
      const mockItem = { id: 1, name: 'Sword' };
      mockItemService.findById.mockResolvedValue(mockItem);
      
      // Act
      await itemController.findOne(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });
    
    it('should return 404 if item not found', async () => {
      // Arrange
      req.params = { id: '999' };
      
      mockItemService.findById.mockResolvedValue(null);
      
      // Act
      await itemController.findOne(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledTimes(1);
      
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('message');
      expect(response.message).toContain('not found');
    });
    
    it('should handle errors', async () => {
      // Arrange
      req.params = { id: '1' };
      
      const error = new Error('Test error');
      mockItemService.findById.mockRejectedValue(error);
      
      // Act
      await itemController.findOne(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('create', () => {
    it('should create and return new item', async () => {
      // Arrange
      const itemData = {
        name: 'New Item',
        price: 100
      };
      
      req.body = itemData;
      
      const mockCreatedItem = {
        id: 1,
        ...itemData
      };
      
      mockItemService.create.mockResolvedValue(mockCreatedItem);
      
      // Act
      await itemController.create(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedItem);
    });
    
    it('should handle errors', async () => {
      // Arrange
      req.body = {};
      
      const error = new Error('Test error');
      mockItemService.create.mockRejectedValue(error);
      
      // Act
      await itemController.create(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('update', () => {
    it('should update and return item', async () => {
      // Arrange
      const itemData = {
        name: 'Updated Item',
        price: 200
      };
      
      req.params = { id: '1' };
      req.body = itemData;
      
      const mockUpdatedItem = {
        id: 1,
        ...itemData
      };
      
      mockItemService.update.mockResolvedValue(mockUpdatedItem);
      
      // Act
      await itemController.update(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedItem);
    });
    
    it('should return 404 if item not found', async () => {
      // Arrange
      req.params = { id: '999' };
      req.body = { name: 'Updated Item' };
      
      mockItemService.update.mockResolvedValue(null);
      
      // Act
      await itemController.update(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledTimes(1);
      
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('message');
      expect(response.message).toContain('not found');
    });
    
    it('should handle errors', async () => {
      // Arrange
      req.params = { id: '1' };
      req.body = {};
      
      const error = new Error('Test error');
      mockItemService.update.mockRejectedValue(error);
      
      // Act
      await itemController.update(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('delete', () => {
    it('should delete item and return no content', async () => {
      // Arrange
      req.params = { id: '1' };
      
      mockItemService.delete.mockResolvedValue(true);
      
      // Act
      await itemController.delete(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 if item not found', async () => {
      // Arrange
      req.params = { id: '999' };
      
      mockItemService.delete.mockResolvedValue(false);
      
      // Act
      await itemController.delete(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledTimes(1);
      
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('message');
      expect(response.message).toContain('not found');
    });
    
    it('should handle errors', async () => {
      // Arrange
      req.params = { id: '1' };
      
      const error = new Error('Test error');
      mockItemService.delete.mockRejectedValue(error);
      
      // Act
      await itemController.delete(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('search', () => {
    it('should search items and return results with pagination', async () => {
      // Arrange
      req.query = {
        query: 'sword',
        page: '0',
        size: '10'
      };
      
      const mockItems = [
        { id: 1, name: 'Iron Sword', description: 'A basic sword' },
        { id: 2, name: 'Steel Sword', description: 'A better sword' }
      ];
      
      mockItemService.search.mockResolvedValue(mockItems);
      
      // Act
      await itemController.search(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData).toHaveProperty('items', mockItems);
      expect(responseData).toHaveProperty('meta');
      expect(responseData.meta).toHaveProperty('totalItems', 2);
    });
    
    it('should return 400 if query is missing', async () => {
      // Arrange
      req.query = { page: '0', size: '10' };
      
      // Act
      await itemController.search(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledTimes(1);
      
      const response = res.json.mock.calls[0][0];
      expect(response).toHaveProperty('message', 'Search query is required');
    });
    
    it('should handle errors', async () => {
      // Arrange
      req.query = { query: 'sword' };
      
      const error = new Error('Test error');
      mockItemService.search.mockRejectedValue(error);
      
      // Act
      await itemController.search(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});