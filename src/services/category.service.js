import categoryRepository from '../repositories/category.repository.js';
import itemRepository from '../repositories/item.repository.js';

class CategoryService {
  async findAll(rootOnly = false) {
    if (rootOnly) {
      return categoryRepository.findAllWithSubcategories();
    }
    return categoryRepository.findAll();
  }

  async findById(id) {
    return categoryRepository.findByIdWithSubcategories(id);
  }

  async create(categoryData) {
    return categoryRepository.create(categoryData);
  }

  async update(id, categoryData) {
    // Prevent circular references
    if (categoryData.parentid && categoryData.parentid === id) {
      throw new Error('Category cannot be its own parent');
    }
    
    return categoryRepository.update(id, categoryData);
  }

  async delete(id) {
    return categoryRepository.delete(id);
  }

  async getItems(categoryid, options = {}) {
    const items = await itemRepository.findByCategoryId(categoryid, options);
    
    const count = await itemRepository.count({
      where: { categoryid }
    });
    
    return { items, count };
  }
}

const categoryService = new CategoryService();
export default categoryService;