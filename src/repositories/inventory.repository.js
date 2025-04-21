import BaseRepository from './base.repository.js';
import { Inventory, Item, User } from '../models/index.js';
import { Op } from 'sequelize';

class InventoryRepository extends BaseRepository {
  constructor() {
    super(Inventory);
  }

  async getUserInventory(userid, options = {}) {
    return this.model.findAndCountAll({
        where: { userid },
        include: [{
          model: Item,
          include: ['Category', 'Rarity']
        }],
        ...options
      });
  }

  async getItemUsers(itemid, options = {}) {
    return this.model.findAll({
      ...options,
      where: { itemid },
      include: [User]
    });
  }

  async findUserItem(userid, itemid) {
    return this.model.findOne({
      where: {
        userid,
        itemid
      }
    });
  }

  async addItem(userid, itemid, quantity = 1) {
    const existing = await this.findUserItem(userid, itemid);
    
    if (existing) {
      existing.quantity += quantity;
      await existing.save();
      return existing;
    }
    
    return this.create({
      userid,
      itemid,
      quantity
    });
  }

  async updateQuantity(userid, itemid, quantity) {
    const inventoryItem = await this.findUserItem(userid, itemid);
    
    if (!inventoryItem) {
      return null;
    }
    
    if (quantity <= 0) {
      await inventoryItem.destroy();
      return { itemid, quantity: 0 };
    }
    
    inventoryItem.quantity = quantity;
    await inventoryItem.save();
    return inventoryItem;
  }

  async removeItem(userid, itemid) {
    const inventoryItem = await this.findUserItem(userid, itemid);
    
    if (!inventoryItem) {
      return false;
    }
    
    await inventoryItem.destroy();
    return true;
  }
}

const inventoryRepository = new InventoryRepository();
export default inventoryRepository;