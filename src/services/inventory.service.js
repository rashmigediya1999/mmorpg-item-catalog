import inventoryRepository from '../repositories/inventory.repository.js';
import itemRepository from '../repositories/item.repository.js';
import { Op } from 'sequelize';

class InventoryService {
  async getUserInventory(userid, options = {}) {
    const result = await inventoryRepository.getUserInventory(userid, options);
  
    return {
        items: result.rows,
        count: result.count
    };
  }
  
  async addItemToUserInventory(userid, itemid, quantity = 1) {
    // Check if item exists
    const item = await itemRepository.findById(itemid);
    
    if (!item) {
      throw new Error(`Item with ID ${itemid} not found`);
    }
    
    return inventoryRepository.addItem(userid, itemid, quantity);
  }
  
  async updateItemQuantity(userid, itemid, quantity) {
    // Check if item exists
    const item = await itemRepository.findById(itemid);
    
    if (!item) {
      throw new Error(`Item with ID ${itemid} not found`);
    }
    
    return inventoryRepository.updateQuantity(userid, itemid, quantity);
  }
  
  async removeItemFromInventory(userid, itemid) {
    return inventoryRepository.removeItem(userid, itemid);
  }
}

const inventoryService = new InventoryService();
export default inventoryService;