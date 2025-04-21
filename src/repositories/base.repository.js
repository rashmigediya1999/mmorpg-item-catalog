class BaseRepository {
    constructor(model) {
      this.model = model;
    }
  
    async findAll(options = {}) {
      return this.model.findAll(options);
    }
  
    async findById(id, options = {}) {
      return this.model.findByPk(id, options);
    }
  
    async findOne(where, options = {}) {
      return this.model.findOne({ ...options, where });
    }
  
    async create(data) {
      return this.model.create(data);
    }
  
    async update(id, data) {
      const [updated] = await this.model.update(data, {
        where: { id },
        returning: true
      });
      
      if (updated === 0) {
        return null;
      }
      
      return this.findById(id);
    }
  
    async delete(id) {
      const entity = await this.findById(id);
      if (!entity) {
        return false;
      }
      
      await entity.destroy();
      return true;
    }
  
    async count(options = {}) {
      return this.model.count(options);
    }
}

export default BaseRepository;