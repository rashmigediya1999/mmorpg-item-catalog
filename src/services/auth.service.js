import jwt from 'jsonwebtoken';
import userRepository from '../repositories/user.repository.js';
import { Op } from 'sequelize';

// import { Role } from '../models/index.js';

class AuthService {
  async register(userData) {
    // Default role is Player (id: 2)
    if (!userData.roleid) {
      userData.roleid = 2;
    }

    // Validate password presence
  if (!userData.password) {
    throw new Error('Password is required');
  }

    // Check if username or email already exists
    const existingUser = await userRepository.findOne({
      [Op.or]: [
        { username: userData.username },
        { email: userData.email }
      ]
    });
    if (existingUser) {
      if (existingUser.username === userData.username) {
        throw new Error('Username already taken');
      }
      throw new Error('Email already registered');
    }
    

    // Create user
    const user = await userRepository.create(userData);
  
    // Fetch user with role for token generation
    const userWithRole = await userRepository.findByIdWithRole(user.id);
    // Generate JWT token
    const token = this.generateToken(userWithRole);

    return { user: userWithRole, token };
  }
  
  async login(username, password) {
    // Find user by username
    const user = await userRepository.findByUsername(username);
    console.log('User found service:', user, password);
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    // Special handling for admin user
  if (user.Role.name === 'Admin') {
    const isAdminPasswordValid = password === 'admin123';
    if (!isAdminPasswordValid) {
      throw new Error('Invalid username or password');
    }
  } else {
    // Regular user password validation
    const isPasswordValid = await user.validatePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }
  }
    
    // Generate JWT token
    const token = this.generateToken(user);
    console.log('Token generated:', token, user);
    return { user, token };
  }
  
  generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.Role.name
    };
    
    return jwt.sign(
      payload,
      process.env.JWT_SECRET || 'game-catalog-secret',
      { expiresIn: '24h' }
    );
  }
}

const authService = new AuthService();
export default authService;