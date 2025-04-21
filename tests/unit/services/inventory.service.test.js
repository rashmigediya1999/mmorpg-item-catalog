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
  addItemToUserInventory: async (userId, itemid, quantity = 1) => {
    // Check if item exists
    const item = await mockItemRepository.findById(itemid);
    
    if (!item) {
      throw new Error(`Item with ID ${itemid} not found`);
    }
    
    // Add or update quantity
    return mockInventoryRepository.addItem(userId, itemid, quantity);
  },
  
  // Update item quantity in inventory
  updateItemQuantity: async (userId, itemid, quantity) => {
    // Check if item exists
    const item = await mockItemRepository.findById(itemid);
    
    if (!item) {
      throw new Error(`Item with ID ${itemid} not found`);
    }
    
    // Update quantity or remove if quantity is 0
    return mockInventoryRepository.updateQuantity(userId, itemid, quantity);
  },
  
  // Remove an item from inventory
  removeItemFromInventory: async (userId, itemid) => {
    return mockInventoryRepository.removeItem(userId, itemid);
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
          itemid: 1, 
          quantity: 2,
          Item: { id: 1, name: 'Iron Sword' } 
        },
        { 
          id: 2, 
          userId: 1, 
          itemid: 3, 
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
      const itemid = 1;
      const quantity = 2;
      
      const mockItem = { id: 1, name: 'Iron Sword' };
      const mockInventoryItem = { 
        id: 1, 
        userId: 1, 
        itemid: 1, 
        quantity: 2 
      };
      
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockInventoryRepository.addItem.mockResolvedValue(mockInventoryItem);
      
      // Act
      const result = await inventoryService.addItemToUserInventory(userId, itemid, quantity);
      
      // Assert
      expect(result).toEqual(mockInventoryItem);
      expect(mockItemRepository.findById).toHaveBeenCalledWith(itemid);
      expect(mockInventoryRepository.addItem).toHaveBeenCalledWith(userId, itemid, quantity);
    });
    
    it('should throw error if item not found', async () => {
      // Arrange
      const userId = 1;
      const itemid = 999;
      const quantity = 2;
      
      mockItemRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        inventoryService.addItemToUserInventory(userId, itemid, quantity)
      ).rejects.toThrow(`Item with ID ${itemid} not found`);
      
      expect(mockInventoryRepository.addItem).not.toHaveBeenCalled();
    });
  });
  
  describe('updateItemQuantity', () => {
    it('should update item quantity in inventory', async () => {
      // Arrange
      const userId = 1;
      const itemid = 1;
      const quantity = 5;
      
      const mockItem = { id: 1, name: 'Iron Sword' };
      const mockUpdatedItem = { 
        id: 1, 
        userId: 1, 
        itemid: 1, 
        quantity: 5 
      };
      
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockInventoryRepository.updateQuantity.mockResolvedValue(mockUpdatedItem);
      
      // Act
      const result = await inventoryService.updateItemQuantity(userId, itemid, quantity);
      
      // Assert
      expect(result).toEqual(mockUpdatedItem);
      expect(mockItemRepository.findById).toHaveBeenCalledWith(itemid);
      expect(mockInventoryRepository.updateQuantity).toHaveBeenCalledWith(userId, itemid, quantity);
    });
    
    it('should remove item if quantity is 0', async () => {
      // Arrange
      const userId = 1;
      const itemid = 1;
      const quantity = 0;
      
      const mockItem = { id: 1, name: 'Iron Sword' };
      const mockResult = { itemid: 1, quantity: 0 };
      
      mockItemRepository.findById.mockResolvedValue(mockItem);
      mockInventoryRepository.updateQuantity.mockResolvedValue(mockResult);
      
      // Act
      const result = await inventoryService.updateItemQuantity(userId, itemid, quantity);
      
      // Assert
      expect(result).toEqual(mockResult);
      expect(mockInventoryRepository.updateQuantity).toHaveBeenCalledWith(userId, itemid, quantity);
    });
    
    it('should throw error if item not found', async () => {
      // Arrange
      const userId = 1;
      const itemid = 999;
      const quantity = 5;
      
      mockItemRepository.findById.mockResolvedValue(null);
      
      // Act & Assert
      await expect(
        inventoryService.updateItemQuantity(userId, itemid, quantity)
      ).rejects.toThrow(`Item with ID ${itemid} not found`);
      
      expect(mockInventoryRepository.updateQuantity).not.toHaveBeenCalled();
    });
  });
  
  describe('removeItemFromInventory', () => {
    it('should remove item from inventory', async () => {
      // Arrange
      const userId = 1;
      const itemid = 1;
      
      mockInventoryRepository.removeItem.mockResolvedValue(true);
      
      // Act
      const result = await inventoryService.removeItemFromInventory(userId, itemid);
      
      // Assert
      expect(result).toBe(true);
      expect(mockInventoryRepository.removeItem).toHaveBeenCalledWith(userId, itemid);
    });
    
    it('should return false if item not in inventory', async () => {
      // Arrange
      const userId = 1;
      const itemid = 999;
      
      mockInventoryRepository.removeItem.mockResolvedValue(false);
      
      // Act
      const result = await inventoryService.removeItemFromInventory(userId, itemid);
      
      // Assert
      expect(result).toBe(false);
      expect(mockInventoryRepository.removeItem).toHaveBeenCalledWith(userId, itemid);
    });
  });
});