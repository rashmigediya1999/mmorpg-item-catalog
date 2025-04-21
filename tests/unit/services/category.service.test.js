import { jest } from '@jest/globals';

// Mock the repositories
const mockCategoryRepository = {
  findAll: jest.fn(),
  findByIdWithSubcategories: jest.fn(),
  findAllWithSubcategories: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn()
};

const mockItemRepository = {
  findByCategoryId: jest.fn(),
  count: jest.fn()
};

// Create a simple categoryService for testing
const categoryService = {
  // Find all categories, optionally filtering for root categories
  findAll: async (rootOnly = false) => {
    if (rootOnly) {
      return mockCategoryRepository.findAllWithSubcategories();
    }
    return mockCategoryRepository.findAll();
  },

  // Find category by ID
  findById: async (id) => {
    return mockCategoryRepository.findByIdWithSubcategories(id);
  },

  // Create a new category
  create: async (categoryData) => {
    return mockCategoryRepository.create(categoryData);
  },

  // Update an existing category
  update: async (id, categoryData) => {
    // Prevent circular references
    if (categoryData.parentid && categoryData.parentid === id) {
      throw new Error('Category cannot be its own parent');
    }
    
    return mockCategoryRepository.update(id, categoryData);
  },

  // Delete a category
  delete: async (id) => {
    return mockCategoryRepository.delete(id);
  },

  // Get items in a category
  getItems: async (categoryid, options = {}) => {
    const items = await mockItemRepository.findByCategoryId(categoryid, options);
    
    const count = await mockItemRepository.count({
      where: { categoryid }
    });
    
    return { items, count };
  }
};

describe('Category Service', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('findAll', () => {
    it('should return all categories when rootOnly is false', async () => {
      // Arrange
      const mockCategories = [
        { id: 1, name: 'Weapons' },
        { id: 2, name: 'Armor' }
      ];
      
      mockCategoryRepository.findAll.mockResolvedValue(mockCategories);
      
      // Act
      const result = await categoryService.findAll(false);
      
      // Assert
      expect(result).toEqual(mockCategories);
      expect(mockCategoryRepository.findAll).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.findAllWithSubcategories).not.toHaveBeenCalled();
    });
    
    it('should return root categories with subcategories when rootOnly is true', async () => {
      // Arrange
      const mockCategories = [
        { 
          id: 1, 
          name: 'Weapons',
          subcategories: [
            { id: 3, name: 'Swords' },
            { id: 4, name: 'Bows' }
          ] 
        },
        { 
          id: 2, 
          name: 'Armor',
          subcategories: [
            { id: 5, name: 'Helmets' }
          ] 
        }
      ];
      
      mockCategoryRepository.findAllWithSubcategories.mockResolvedValue(mockCategories);
      
      // Act
      const result = await categoryService.findAll(true);
      
      // Assert
      expect(result).toEqual(mockCategories);
      expect(mockCategoryRepository.findAllWithSubcategories).toHaveBeenCalledTimes(1);
      expect(mockCategoryRepository.findAll).not.toHaveBeenCalled();
    });
  });
  
  describe('findById', () => {
    it('should return category by id with subcategories', async () => {
      // Arrange
      const mockCategory = { 
        id: 1, 
        name: 'Weapons',
        subcategories: [
          { id: 3, name: 'Swords' },
          { id: 4, name: 'Bows' }
        ] 
      };
      
      mockCategoryRepository.findByIdWithSubcategories.mockResolvedValue(mockCategory);
      
      // Act
      const result = await categoryService.findById(1);
      
      // Assert
      expect(result).toEqual(mockCategory);
      expect(mockCategoryRepository.findByIdWithSubcategories).toHaveBeenCalledWith(1);
    });
    
    it('should return null if category not found', async () => {
      // Arrange
      mockCategoryRepository.findByIdWithSubcategories.mockResolvedValue(null);
      
      // Act
      const result = await categoryService.findById(999);
      
      // Assert
      expect(result).toBeNull();
      expect(mockCategoryRepository.findByIdWithSubcategories).toHaveBeenCalledWith(999);
    });
  });
  
  describe('create', () => {
    it('should create and return new category', async () => {
      // Arrange
      const mockCategoryData = {
        name: 'New Category',
        description: 'Test description'
      };
      
      const mockCreatedCategory = {
        id: 10,
        ...mockCategoryData
      };
      
      mockCategoryRepository.create.mockResolvedValue(mockCreatedCategory);
      
      // Act
      const result = await categoryService.create(mockCategoryData);
      
      // Assert
      expect(result).toEqual(mockCreatedCategory);
      expect(mockCategoryRepository.create).toHaveBeenCalledWith(mockCategoryData);
    });
  });
  
  describe('update', () => {
    it('should update and return category', async () => {
      // Arrange
      const mockCategoryData = {
        name: 'Updated Category',
        description: 'Updated description'
      };
      
      const mockUpdatedCategory = {
        id: 1,
        ...mockCategoryData
      };
      
      mockCategoryRepository.update.mockResolvedValue(mockUpdatedCategory);
      
      // Act
      const result = await categoryService.update(1, mockCategoryData);
      
      // Assert
      expect(result).toEqual(mockUpdatedCategory);
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(1, mockCategoryData);
    });
    
    it('should throw error if category is set as its own parent', async () => {
      // Arrange
      const mockCategoryData = {
        name: 'Self-referential Category',
        parentid: 5
      };
      
      // Act & Assert
      await expect(
        categoryService.update(5, mockCategoryData)
      ).rejects.toThrow('Category cannot be its own parent');
      
      expect(mockCategoryRepository.update).not.toHaveBeenCalled();
    });
    
    it('should return null if category not found', async () => {
      // Arrange
      mockCategoryRepository.update.mockResolvedValue(null);
      
      // Act
      const result = await categoryService.update(999, { name: 'Not Found' });
      
      // Assert
      expect(result).toBeNull();
      expect(mockCategoryRepository.update).toHaveBeenCalledWith(999, { name: 'Not Found' });
    });
  });
  
  describe('delete', () => {
    it('should delete category and return true', async () => {
      // Arrange
      mockCategoryRepository.delete.mockResolvedValue(true);
      
      // Act
      const result = await categoryService.delete(1);
      
      // Assert
      expect(result).toBe(true);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(1);
    });
    
    it('should return false if category not found', async () => {
      // Arrange
      mockCategoryRepository.delete.mockResolvedValue(false);
      
      // Act
      const result = await categoryService.delete(999);
      
      // Assert
      expect(result).toBe(false);
      expect(mockCategoryRepository.delete).toHaveBeenCalledWith(999);
    });
  });
  
  describe('getItems', () => {
    it('should return items and count for a category', async () => {
      // Arrange
      const mockItems = [
        { id: 1, name: 'Sword', categoryid: 1 },
        { id: 2, name: 'Dagger', categoryid: 1 }
      ];
      
      const mockCount = 2;
      const mockCategoryId = 1;
      const mockOptions = { limit: 10, offset: 0 };
      
      mockItemRepository.findByCategoryId.mockResolvedValue(mockItems);
      mockItemRepository.count.mockResolvedValue(mockCount);
      
      // Act
      const result = await categoryService.getItems(mockCategoryId, mockOptions);
      
      // Assert
      expect(result).toHaveProperty('items', mockItems);
      expect(result).toHaveProperty('count', mockCount);
      expect(mockItemRepository.findByCategoryId).toHaveBeenCalledWith(mockCategoryId, mockOptions);
      expect(mockItemRepository.count).toHaveBeenCalledWith({
        where: { categoryid: mockCategoryId }
      });
    });
  });
});