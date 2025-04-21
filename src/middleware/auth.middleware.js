import jwt from 'jsonwebtoken';
import { User, Role } from '../models/index.js';
import logger from '../utils/logger.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }
    
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'game-catalog-secret');
    
    const user = await User.findByPk(decoded.id, {
      include: [Role]
    });
    
    if (!user) {
      return res.status(401).json({
        message: 'Invalid authentication token'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(401).json({
      message: 'Invalid authentication token'
    });
  }
};

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Authentication required'
      });
    }
    
    const userRole = req.user.Role.name;
    
    if (roles.length && !roles.includes(userRole)) {
      logger.warn(`Access denied: User ${req.user.username} with role ${userRole} attempted to access restricted resource`);
      return res.status(403).json({
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};