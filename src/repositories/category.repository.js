import BaseRepository from './base.repository.js';
import { Category } from '../models/index.js';

class CategoryRepository extends BaseRepository {
  constructor() {
    super(Category);
  }

  async findByIdWithSubcategories(id) {
    return this.model.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'subcategories',
          include: [
            {
              model: Category,
              as: 'subcategories'
            }
          ]
        }
      ]
    });
  }

  async findAllWithSubcategories() {
    return this.model.findAll({
      include: [
        {
          model: Category,
          as: 'subcategories'
        }
      ],
      where: {
        parentid: null
      }
    });
  }
}

const categoryRepository = new CategoryRepository();
export default categoryRepository;