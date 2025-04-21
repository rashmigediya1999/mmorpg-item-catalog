import { jest } from '@jest/globals';

// Mock the service
const mockCategoryService = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getItems: jest.fn()
};

// Simple controller implementation to test
const categoryController = {
  findAll: async (req, res, next) => {
    try {
      // Only get top-level categories (no parent)
      const rootOnly = req.query.rootOnly === 'true';
      const categories = await mockCategoryService.findAll(rootOnly);
      
      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  },

  findOne: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const category = await mockCategoryService.findById(id);
      
      if (!category) {
        return res.status(404).json({
          message: `Category with ID ${id} not found`
        });
      }
      
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  },

  create: async (req, res, next) => {
    try {
      const newCategory = await mockCategoryService.create(req.body);
      res.status(201).json(newCategory);
    } catch (error) {
      next(error);
    }
  },

  update: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const updatedCategory = await mockCategoryService.update(id, req.body);
      
      if (!updatedCategory) {
        return res.status(404).json({
          message: `Category with ID ${id} not found`
        });
      }
      
      res.status(200).json(updatedCategory);
    } catch (error) {
      next(error);
    }
  },

  delete: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await mockCategoryService.delete(id);
      
      if (!deleted) {
        return res.status(404).json({
          message: `Category with ID ${id} not found`
        });
      }
      
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  getItems: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id);
      const { page, size } = req.query;
      
      const options = {};
      if (page !== undefined || size !== undefined) {
        const limit = size ? parseInt(size) : 10;
        const offset = page ? parseInt(page) * limit : 0;
        options.limit = limit;
        options.offset = offset;
      }
      
      const category = await mockCategoryService.findById(id);
      if (!category) {
        return res.status(404).json({
          message: `Category with ID ${id} not found`
        });
      }
      
      const data = await mockCategoryService.getItems(id, options);
      
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
  }
};

describe('Category Controller', () => {
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
    it('should return all categories', async () => {
      // Arrange
      req.query = {};
      
      const mockCategories = [
        { id: 1, name: 'Weapons' },
        { id: 2, name: 'Armor' }
      ];
      
      mockCategoryService.findAll.mockResolvedValue(mockCategories);
      
      // Act
      await categoryController.findAll(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCategories);
      expect(mockCategoryService.findAll).toHaveBeenCalledWith(false);
    });
    
    it('should return only root categories when rootOnly is true', async () => {
      // Arrange
      req.query = { rootOnly: 'true' };
      
      const mockCategories = [
        { 
          id: 1, 
          name: 'Weapons',
          subcategories: [
            { id: 3, name: 'Swords' }
          ]
        },
        { 
          id: 2, 
          name: 'Armor',
          subcategories: [
            { id: 4, name: 'Helmets' }
          ]
        }
      ];
      
      mockCategoryService.findAll.mockResolvedValue(mockCategories);
      
      // Act
      await categoryController.findAll(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCategories);
      expect(mockCategoryService.findAll).toHaveBeenCalledWith(true);
    });
    
    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Test error');
      mockCategoryService.findAll.mockRejectedValue(error);
      
      // Act
      await categoryController.findAll(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('findOne', () => {
    it('should return category by id', async () => {
      // Arrange
      req.params = { id: '1' };
      
      const mockCategory = { 
        id: 1, 
        name: 'Weapons',
        subcategories: [
          { id: 3, name: 'Swords' }
        ]
      };
      
      mockCategoryService.findById.mockResolvedValue(mockCategory);
      
      // Act
      await categoryController.findOne(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockCategory);
    });
    
    it('should return 404 if category not found', async () => {
      // Arrange
      req.params = { id: '999' };
      
      mockCategoryService.findById.mockResolvedValue(null);
      
      // Act
      await categoryController.findOne(req, res, next);
      
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
      mockCategoryService.findById.mockRejectedValue(error);
      
      // Act
      await categoryController.findOne(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('create', () => {
    it('should create and return new category', async () => {
      // Arrange
      const categoryData = {
        name: 'New Category',
        description: 'Test description'
      };
      
      req.body = categoryData;
      
      const mockCreatedCategory = {
        id: 10,
        ...categoryData
      };
      
      mockCategoryService.create.mockResolvedValue(mockCreatedCategory);
      
      // Act
      await categoryController.create(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCreatedCategory);
    });
    
    it('should handle errors', async () => {
      // Arrange
      req.body = {};
      
      const error = new Error('Test error');
      mockCategoryService.create.mockRejectedValue(error);
      
      // Act
      await categoryController.create(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('update', () => {
    it('should update and return category', async () => {
      // Arrange
      const categoryData = {
        name: 'Updated Category',
        description: 'Updated description'
      };
      
      req.params = { id: '1' };
      req.body = categoryData;
      
      const mockUpdatedCategory = {
        id: 1,
        ...categoryData
      };
      
      mockCategoryService.update.mockResolvedValue(mockUpdatedCategory);
      
      // Act
      await categoryController.update(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockUpdatedCategory);
    });
    
    it('should return 404 if category not found', async () => {
      // Arrange
      req.params = { id: '999' };
      req.body = { name: 'Updated Category' };
      
      mockCategoryService.update.mockResolvedValue(null);
      
      // Act
      await categoryController.update(req, res, next);
      
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
      mockCategoryService.update.mockRejectedValue(error);
      
      // Act
      await categoryController.update(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('delete', () => {
    it('should delete category and return no content', async () => {
      // Arrange
      req.params = { id: '1' };
      
      mockCategoryService.delete.mockResolvedValue(true);
      
      // Act
      await categoryController.delete(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(204);
      expect(res.send).toHaveBeenCalledTimes(1);
    });
    
    it('should return 404 if category not found', async () => {
      // Arrange
      req.params = { id: '999' };
      
      mockCategoryService.delete.mockResolvedValue(false);
      
      // Act
      await categoryController.delete(req, res, next);
      
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
      mockCategoryService.delete.mockRejectedValue(error);
      
      // Act
      await categoryController.delete(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
  
  describe('getItems', () => {
    it('should return items for a category', async () => {
      // Arrange
      req.params = { id: '1' };
      req.query = { page: '0', size: '10' };
      
      const mockCategory = { id: 1, name: 'Weapons' };
      const mockItems = [
        { id: 1, name: 'Sword', categoryid: 1 },
        { id: 2, name: 'Dagger', categoryid: 1 }
      ];
      
      mockCategoryService.findById.mockResolvedValue(mockCategory);
      mockCategoryService.getItems.mockResolvedValue({ 
        items: mockItems,
        count: 2
      });
      
      // Act
      await categoryController.getItems(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledTimes(1);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData).toHaveProperty('items', mockItems);
      expect(responseData).toHaveProperty('meta');
      expect(responseData.meta).toHaveProperty('totalItems', 2);
    });
    
    it('should return 404 if category not found', async () => {
      // Arrange
      req.params = { id: '999' };
      
      mockCategoryService.findById.mockResolvedValue(null);
      
      // Act
      await categoryController.getItems(req, res, next);
      
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
      mockCategoryService.findById.mockRejectedValue(error);
      
      // Act
      await categoryController.getItems(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});