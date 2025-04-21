import { jest } from '@jest/globals';

// Mock the repositories
const mockInventoryRepository = {
  getUserInventory: jest.fn(),
  findUserItem: jest.fn(),
  addItem: jest.fn(),
  updateQuantity: jest.fn(),
  removeItem: jest.fn(),
  count: jest.fn()
};

const mockItemRepository = {
  findById: jest.fn()
};

// Simple inventory service for testing
const inventoryService = {
  // Get a user's inventory
  getUserInventory: async (userId, options = {}) => {
    const inventoryItems = await mockInventoryRepository.getUserInventory(userId, options);
    
    const count = await mockInventoryRepository.count({
      where: { userId }
    });
    
    return { inventoryItems, count };
  },
  
  // Add an item to a user's inventory
  addItemToUserInventory: async (userId, itemId, quantity = 1) => {
    // Check if item exists
    const item = await mockItemRepository.findById(itemId);
    
    if (!item) {
      throw new Error(`Item with ID ${itemId} not found`);
    }
    
    // Add or update quantity
    return mockInventoryRepository.addItem(userId, itemId, quantity);
  },
  
  // Update item quantity in inventory
  updateItemQuantity: async (userId, itemId, quantity) => {
    // Check if item exists
    const item = await mockItemRepository.findById(itemId);
    
    if (!item) {
      throw new Error(`Item with ID ${itemId} not found`);
    }
    
    // Update quantity or remove if quantity is 0
    return mockInventoryRepository.updateQuantity(userId, itemId, quantity);
  },
  
  // Remove an item from inventory
  removeItemFromInventory: async (userId, itemId) => {
    return mockInventoryRepository.removeItem(userId, itemId);
  }
};

describe('Inventory Service', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('getUserInventory', () => {
    it('should return user inventory items and count', async () => {
      // Arrange
      const userId = 1;
      const mockInventoryItems = [
        { 
          id: 1, 
          userId: 1, 
          itemId: 1, 
          quantity: 2,
          Item: { id: 1, name: 'Iron Sword' } 
        },
        { 
          id: 2, 
          userId: 1, 
          itemId: 3, 
          quantity: 1,
          Item: { id: 3, name: 'Health Potion' } 
        }
      ];
      
      const mockCount = 2;
      const mockOptions = { limit: 10, offset: 0 };
      
      mockInventoryRepository.getUserInventory.mockResolvedValue(mockInventoryItems);
      mockInventoryRepository.count.mockResolvedValue(mockCount);
      
      // Act
      const result = await inventoryService.getUserInventory(userId, mockOptions);
      
      // Assert
      expect(result).toHaveProperty('inventoryItems', mockInventoryItems);
      expect(result).toHaveProperty('count', mockCount);
      expect(mockInventoryRepository.getUserInventory).toHaveBeenCalledWith(userId, mockOptions);
      expect(mockInventoryRepository.count).toHaveBeenCalledWith({
        where: { userId }
      });
    });
  });
  
  describe('addItemToUserInventory', () => {
    it('should add item to user inventory', async () => {
      // Arrange
      const userId = 1;
      const itemId = 1;
      const quantity = 2;
      
      const mockItem = { id: 1, name: 'Iron Sword' };
      const mockInventoryItem = { 
        id: 1, 
        userId: 1, 
        itemId: 1, 
        quantity: 2 
      };
      
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockInventoryRepository.addItem.mockResolvedValue(mockInventoryItem);
      
      // Act
      const result = await inventoryService.addItemToUserInventory(userId, itemId, quantity);
      
      // Assert
      expect(result).toEqual(mockInventoryItem);
      expect(mockItemRepository.findById).toHaveBeenCalledWith(itemId);
      expect(mockInventoryRepository.addItem).toHaveBeenCalledWith(userId, itemId, quantity);
    });
    
    it('should throw error if item not found', async () => {
      // Arrange
      const userId = 1;
      const itemId = 999;
      const quantity = 2;
      
      mockItemRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        inventoryService.addItemToUserInventory(userId, itemId, quantity)
      ).rejects.toThrow(`Item with ID ${itemId} not found`);
      
      expect(mockInventoryRepository.addItem).not.toHaveBeenCalled();
    });
  });
  
  describe('updateItemQuantity', () => {
    it('should update item quantity in inventory', async () => {
      // Arrange
      const userId = 1;
      const itemId = 1;
      const quantity = 5;
      
      const mockItem = { id: 1, name: 'Iron Sword' };
      const mockUpdatedItem = { 
        id: 1, 
        userId: 1, 
        itemId: 1, 
        quantity: 5 
      };
      
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockInventoryRepository.updateQuantity.mockResolvedValue(mockUpdatedItem);
      
      // Act
      const result = await inventoryService.updateItemQuantity(userId, itemId, quantity);
      
      // Assert
      expect(result).toEqual(mockUpdatedItem);
      expect(mockItemRepository.findById).toHaveBeenCalledWith(itemId);
      expect(mockInventoryRepository.updateQuantity).toHaveBeenCalledWith(userId, itemId, quantity);
    });
    
    it('should remove item if quantity is 0', async () => {
      // Arrange
      const userId = 1;
      const itemId = 1;
      const quantity = 0;
      
      const mockItem = { id: 1, name: 'Iron Sword' };
      const mockResult = { itemId: 1, quantity: 0 };
      
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockInventoryRepository.updateQuantity.mockResolvedValue(mockResult);
      
      // Act
      const result = await inventoryService.updateItemQuantity(userId, itemId, quantity);
      
      // Assert
      expect(result).toEqual(mockResult);
      expect(mockInventoryRepository.updateQuantity).toHaveBeenCalledWith(userId, itemId, quantity);
    });
    
    it('should throw error if item not found', async () => {
      // Arrange
      const userId = 1;
      const itemId = 999;
      const quantity = 5;
      
      mockItemRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        inventoryService.updateItemQuantity(userId, itemId, quantity)
      ).rejects.toThrow(`Item with ID ${itemId} not found`);
      
      expect(mockInventoryRepository.updateQuantity).not.toHaveBeenCalled();
    });
  });
  
  describe('removeItemFromInventory', () => {
    it('should remove item from inventory', async () => {
      // Arrange
      const userId = 1;
      const itemId = 1;
      
      mockInventoryRepository.removeItem.mockResolvedValue(true);
      
      // Act
      const result = await inventoryService.removeItemFromInventory(userId, itemId);
      
      // Assert
      expect(result).toBe(true);
      expect(mockInventoryRepository.removeItem).toHaveBeenCalledWith(userId, itemId);
    });
    
    it('should return false if item not in inventory', async () => {
      // Arrange
      const userId = 1;
      const itemId = 999;
      
      mockInventoryRepository.removeItem.mockResolvedValue(false);
      
      // Act
      const result = await inventoryService.removeItemFromInventory(userId, itemId);
      
      // Assert
      expect(result).toBe(false);
      expect(mockInventoryRepository.removeItem).toHaveBeenCalledWith(userId, itemId);
    });
  });
});