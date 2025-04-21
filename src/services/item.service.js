import itemRepository from '../repositories/item.repository.js';
import { Op } from 'sequelize';

class ItemService {
  async findAll(filter = {}, options = {}) {
    const items = await itemRepository.findAllWithRelations({
      where: filter,
      ...options
    });
    
    const count = await itemRepository.count({
      where: filter
    });
    
    return { items, count };
  }

  async findById(id) {
    return itemRepository.findByIdWithRelations(id);
  }

  async create(itemData) {
    return itemRepository.create(itemData);
  }

  async update(id, itemData) {
    return itemRepository.update(id, itemData);
  }

  async delete(id) {
    return itemRepository.delete(id);
  }

  async findByCategory(categoryid, options = {}) {
    return itemRepository.findByCategoryId(categoryid, options);
  }

  async findByRarity(rarityid, options = {}) {
    return itemRepository.findByRarityId(rarityid, options);
  }
  
  async search(query, options = {}) {
    return itemRepository.findAllWithRelations({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${query}%` } },
          { description: { [Op.iLike]: `%${query}%` } }
        ]
      },
      ...options
    });
  }
}

export default new ItemService();