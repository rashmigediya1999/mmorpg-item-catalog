import authService from '../services/auth.service.js';
import logger from '../utils/logger.js';

export const register = async (req, res, next) => {
  try {
    const userData = req.body;
    console.log('User data:', userData);
    const { user, token } = await authService.register(userData);
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.Role.name
      },
      token
    });
  } catch (error) {
    logger.error('Error in register:', error);
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log('Login data:', req.body);
    if (!username || !password) {
      return res.status(400).json({
        message: 'Username and password are required'
      });
    }
    
    const { user, token } = await authService.login(username, password);
    console.log('User found:', user, token);
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.Role.name
      },
      token
    });
  } catch (error) {
    logger.error('Error in login:', error);
    
    // If user not found or password is incorrect
    res.status(401).json({
      message: 'Invalid username or password'
    });
  }
};

export const getProfile = async (req, res, next) => {
  try {
    // User is already attached to request by auth middleware
    const user = req.user;
    
    res.status(200).json({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.Role.name,
      createdAt: user.createdAt
    });
  } catch (error) {
    logger.error('Error in getProfile:', error);
    next(error);
  }
};