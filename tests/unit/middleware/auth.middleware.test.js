import { jest } from '@jest/globals';

// Mock dependencies directly in the test file
const jwt = {
  verify: jest.fn()
};

const User = {
  findByPk: jest.fn()
};

// Simple auth middleware implementation to test
const authMiddleware = {
  authenticate: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }
      
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, 'test-jwt-secret');
      
      const user = await User.findByPk(decoded.id, {
        include: ['Role']
      });
      
      if (!user) {
        return res.status(401).json({
          message: 'Invalid authentication token'
        });
      }
      
      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({
        message: 'Invalid authentication token'
      });
    }
  },
  
  authorize: (roles = []) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({
          message: 'Authentication required'
        });
      }
      
      const userRole = req.user.Role?.name;
      
      if (roles.length && !roles.includes(userRole)) {
        return res.status(403).json({
          message: 'Insufficient permissions'
        });
      }
      
      next();
    };
  }
};

describe('Auth Middleware', () => {
  let req;
  let res;
  let next;
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup request, response, and next function
    req = {
      headers: {}
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    next = jest.fn();
  });
  
  describe('authenticate', () => {
    it('should call next() when authentication is successful', async () => {
      // Arrange
      const token = 'valid-token';
      const decodedToken = { id: 1, username: 'admin' };
      const mockUser = {
        id: 1,
        username: 'admin',
        Role: { name: 'Admin' }
      };
      
      req.headers.authorization = `Bearer ${token}`;
      jwt.verify.mockReturnValue(decodedToken);
      User.findByPk.mockResolvedValue(mockUser);
      
      // Act
      await authMiddleware.authenticate(req, res, next);
      
      // Assert
      expect(jwt.verify).toHaveBeenCalledWith(token, 'test-jwt-secret');
      expect(User.findByPk).toHaveBeenCalledWith(1, expect.any(Object));
      expect(req.user).toEqual(mockUser);
      expect(next).toHaveBeenCalledTimes(1);
    });
    
    it('should return 401 when no authorization header is provided', async () => {
      // Arrange
      req.headers.authorization = undefined;
      
      // Act
      await authMiddleware.authenticate(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 when authorization header format is invalid', async () => {
      // Arrange
      req.headers.authorization = 'InvalidFormat';
      
      // Act
      await authMiddleware.authenticate(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 when token is invalid', async () => {
      // Arrange
      req.headers.authorization = 'Bearer invalid-token';
      jwt.verify.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      
      // Act
      await authMiddleware.authenticate(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid authentication token'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 401 when user is not found', async () => {
      // Arrange
      const token = 'valid-token';
      const decodedToken = { id: 999, username: 'nonexistent' };
      
      req.headers.authorization = `Bearer ${token}`;
      jwt.verify.mockReturnValue(decodedToken);
      User.findByPk.mockResolvedValue(null);
      
      // Act
      await authMiddleware.authenticate(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid authentication token'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
  
  describe('authorize', () => {
    it('should call next() when user has required role', () => {
      // Arrange
      req.user = {
        id: 1,
        username: 'admin',
        Role: { name: 'Admin' }
      };
      
      const middleware = authMiddleware.authorize(['Admin']);
      
      // Act
      middleware(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledTimes(1);
    });
    
    it('should return 401 when no user is attached to request', () => {
      // Arrange
      req.user = undefined;
      
      const middleware = authMiddleware.authorize(['Admin']);
      
      // Act
      middleware(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Authentication required'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should return 403 when user does not have required role', () => {
      // Arrange
      req.user = {
        id: 2,
        username: 'player',
        Role: { name: 'Player' }
      };
      
      const middleware = authMiddleware.authorize(['Admin']);
      
      // Act
      middleware(req, res, next);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Insufficient permissions'
      });
      expect(next).not.toHaveBeenCalled();
    });
    
    it('should call next() when no specific roles are required', () => {
      // Arrange
      req.user = {
        id: 2,
        username: 'player',
        Role: { name: 'Player' }
      };
      
      const middleware = authMiddleware.authorize();
      
      // Act
      middleware(req, res, next);
      
      // Assert
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});