import BaseRepository from './base.repository.js';
import { Item, Category, Rarity } from '../models/index.js';

class ItemRepository extends BaseRepository {
  constructor() {
    super(Item);
  }

  async findAllWithRelations(options = {}) {
    return this.model.findAll({
      ...options,
      include: [
        { model: Category },
        { model: Rarity }
      ]
    });
  }

  async findByIdWithRelations(id) {
    return this.model.findByPk(id, {
      include: [
        { model: Category },
        { model: Rarity }
      ]
    });
  }

  async findByCategoryId(categoryid, options = {}) {
    return this.model.findAll({
      ...options,
      where: {
        categoryid
      },
      include: [
        { model: Category },
        { model: Rarity }
      ]
    });
  }

  async findByRarityId(rarityid, options = {}) {
    return this.model.findAll({
      ...options,
      where: {
        rarityid
      },
      include: [
        { model: Category },
        { model: Rarity }
      ]
    });
  }
}

export default new ItemRepository();