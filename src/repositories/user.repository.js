import BaseRepository from './base.repository.js';
import { User, Role } from '../models/index.js';

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByUsername(username) {
    console.log('Finding user by username:', username);
    return this.model.findOne({
      where: { username },
      include: [Role]
    });
  }

  async findByEmail(email) {
    return this.model.findOne({
      where: { email },
      include: [Role]
    });
  }

  async findByIdWithRole(id) {
    return this.model.findByPk(id, {
      include: [Role]
    });
  }
}

const userRepository = new UserRepository();
export default userRepository;