import { jest } from '@jest/globals';

// Mock the repository
const mockItemRepository = {
  findAllWithRelations: jest.fn(),
  findByIdWithRelations: jest.fn(),
  findByCategoryId: jest.fn(),
  findByRarityId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  count: jest.fn()
};

// Create a simple itemService for testing
const itemService = {
  // Find all items with optional filtering
  findAll: async (filter = {}, options = {}) => {
    const items = await mockItemRepository.findAllWithRelations({
      where: filter,
      ...options
    });
    
    const count = await mockItemRepository.count({
      where: filter
    });
    
    return { items, count };
  },

  // Find item by ID
  findById: async (id) => {
    return mockItemRepository.findByIdWithRelations(id);
  },

  // Create a new item
  create: async (itemData) => {
    return mockItemRepository.create(itemData);
  },

  // Update an existing item
  update: async (id, itemData) => {
    return mockItemRepository.update(id, itemData);
  },

  // Delete an item
  delete: async (id) => {
    return mockItemRepository.delete(id);
  },

  // Find items by category
  findByCategory: async (categoryId, options = {}) => {
    return mockItemRepository.findByCategoryId(categoryId, options);
  },

  // Find items by rarity
  findByRarity: async (rarityId, options = {}) => {
    return mockItemRepository.findByRarityId(rarityId, options);
  },
  
  // Search items by query
  search: async (query, options = {}) => {
    return mockItemRepository.findAllWithRelations({
      where: {
        $or: [
          { name: { $iLike: `%${query}%` } },
          { description: { $iLike: `%${query}%` } }
        ]
      },
      ...options
    });
  }
};

describe('Item Service', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('findAll', () => {
    it('should return items and count', async () => {
      // Arrange
      const mockItems = [
        { id: 1, name: 'Sword of Testing' },
        { id: 2, name: 'Shield of Mocking' }
      ];
      
      const mockCount = 2;
      
      mockItemRepository.findAllWithRelations.mockResolvedValue(mockItems);
      mockItemRepository.count.mockResolvedValue(mockCount);
      
      // Act
      const result = await itemService.findAll();
      
      // Assert
      expect(result).toHaveProperty('items', mockItems);
      expect(result).toHaveProperty('count', mockCount);
      expect(mockItemRepository.findAllWithRelations).toHaveBeenCalledTimes(1);
      expect(mockItemRepository.count).toHaveBeenCalledTimes(1);
    });
    
    it('should apply filters correctly', async () => {
      // Arrange
      const mockFilter = { categoryId: 1 };
      const mockOptions = { limit: 10, offset: 0 };
      
      mockItemRepository.findAllWithRelations.mockResolvedValue([]);
      mockItemRepository.count.mockResolvedValue(0);
      
      // Act
      await itemService.findAll(mockFilter, mockOptions);
      
      // Assert
      expect(mockItemRepository.findAllWithRelations).toHaveBeenCalledWith({
        where: mockFilter,
        ...mockOptions
      });
      
      expect(mockItemRepository.count).toHaveBeenCalledWith({
        where: mockFilter
      });
    });
  });
  
  describe('findById', () => {
    it('should return item by id', async () => {
      // Arrange
      const mockItem = { id: 1, name: 'Sword of Testing' };
      mockItemRepository.findByIdWithRelations.mockResolvedValue(mockItem);
      
      // Act
      const result = await itemService.findById(1);
      
      // Assert
      expect(result).toEqual(mockItem);
      expect(mockItemRepository.findByIdWithRelations).toHaveBeenCalledWith(1);
    });
    
    it('should return null if item not found', async () => {
      // Arrange
      mockItemRepository.findByIdWithRelations.mockResolvedValue(null);
      
      // Act
      const result = await itemService.findById(999);
      
      // Assert
      expect(result).toBeNull();
      expect(mockItemRepository.findByIdWithRelations).toHaveBeenCalledWith(999);
    });
  });
  
  describe('create', () => {
    it('should create and return new item', async () => {
      // Arrange
      const mockItemData = {
        name: 'New Item',
        price: 100
      };
      
      const mockCreatedItem = {
        id: 1,
        ...mockItemData
      };
      
      mockItemRepository.create.mockResolvedValue(mockCreatedItem);
      
      // Act
      const result = await itemService.create(mockItemData);
      
      // Assert
      expect(result).toEqual(mockCreatedItem);
      expect(mockItemRepository.create).toHaveBeenCalledWith(mockItemData);
    });
  });
  
  describe('update', () => {
    it('should update and return item', async () => {
      // Arrange
      const mockItemData = {
        name: 'Updated Item',
        price: 200
      };
      
      const mockUpdatedItem = {
        id: 1,
        ...mockItemData
      };
      
      mockItemRepository.update.mockResolvedValue(mockUpdatedItem);
      
      // Act
      const result = await itemService.update(1, mockItemData);
      
      // Assert
      expect(result).toEqual(mockUpdatedItem);
      expect(mockItemRepository.update).toHaveBeenCalledWith(1, mockItemData);
    });
    
    it('should return null if item not found', async () => {
      // Arrange
      mockItemRepository.update.mockResolvedValue(null);
      
      // Act
      const result = await itemService.update(999, { name: 'Not Found' });
      
      // Assert
      expect(result).toBeNull();
      expect(mockItemRepository.update).toHaveBeenCalledWith(999, { name: 'Not Found' });
    });
  });
  
  describe('delete', () => {
    it('should delete item and return true', async () => {
      // Arrange
      mockItemRepository.delete.mockResolvedValue(true);
      
      // Act
      const result = await itemService.delete(1);
      
      // Assert
      expect(result).toBe(true);
      expect(mockItemRepository.delete).toHaveBeenCalledWith(1);
    });
    
    it('should return false if item not found', async () => {
      // Arrange
      mockItemRepository.delete.mockResolvedValue(false);
      
      // Act
      const result = await itemService.delete(999);
      
      // Assert
      expect(result).toBe(false);
      expect(mockItemRepository.delete).toHaveBeenCalledWith(999);
    });
  });
  
  describe('findByCategory', () => {
    it('should return items by category ID', async () => {
      // Arrange
      const mockItems = [
        { id: 1, name: 'Sword', categoryId: 1 },
        { id: 2, name: 'Dagger', categoryId: 1 }
      ];
      
      mockItemRepository.findByCategoryId.mockResolvedValue(mockItems);
      
      // Act
      const result = await itemService.findByCategory(1);
      
      // Assert
      expect(result).toEqual(mockItems);
      expect(mockItemRepository.findByCategoryId).toHaveBeenCalledWith(1, {});
    });
  });
  
  describe('findByRarity', () => {
    it('should return items by rarity ID', async () => {
      // Arrange
      const mockItems = [
        { id: 1, name: 'Legendary Sword', rarityId: 5 },
        { id: 3, name: 'Legendary Shield', rarityId: 5 }
      ];
      
      mockItemRepository.findByRarityId.mockResolvedValue(mockItems);
      
      // Act
      const result = await itemService.findByRarity(5);
      
      // Assert
      expect(result).toEqual(mockItems);
      expect(mockItemRepository.findByRarityId).toHaveBeenCalledWith(5, {});
    });
  });
  
  describe('search', () => {
    it('should search items by query', async () => {
      // Arrange
      const mockItems = [
        { id: 1, name: 'Iron Sword', description: 'A basic sword' },
        { id: 2, name: 'Steel Sword', description: 'A better sword' }
      ];
      
      mockItemRepository.findAllWithRelations.mockResolvedValue(mockItems);
      
      // Act
      const result = await itemService.search('sword');
      
      // Assert
      expect(result).toEqual(mockItems);
      expect(mockItemRepository.findAllWithRelations).toHaveBeenCalledTimes(1);
      
      // Verify the search query structure
      const callArg = mockItemRepository.findAllWithRelations.mock.calls[0][0];
      expect(callArg).toHaveProperty('where');
      expect(callArg.where).toHaveProperty('$or');
    });
    
    it('should apply pagination options when searching', async () => {
      // Arrange
      const searchQuery = 'sword';
      const options = { limit: 5, offset: 10 };
      
      mockItemRepository.findAllWithRelations.mockResolvedValue([]);
      
      // Act
      await itemService.search(searchQuery, options);
      
      // Assert
      expect(mockItemRepository.findAllWithRelations).toHaveBeenCalledTimes(1);
      
      const callArg = mockItemRepository.findAllWithRelations.mock.calls[0][0];
      expect(callArg).toHaveProperty('limit', 5);
      expect(callArg).toHaveProperty('offset', 10);
    });
  });
});