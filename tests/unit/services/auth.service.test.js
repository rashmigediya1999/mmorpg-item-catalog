import { jest } from '@jest/globals';

// Mock the dependencies
const mockUserRepository = {
  findOne: jest.fn(),
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  findByIdWithRole: jest.fn(),
  create: jest.fn()
};

const mockJwt = {
  sign: jest.fn().mockReturnValue('test-token')
};

// Simple auth service for testing
const authService = {
  // Register a new user
  register: async (userData) => {
    // Default role is Player (id: 2)
    if (!userData.roleId) {
      userData.roleId = 2;
    }
    
    // Check if username or email already exists
    const existingUser = await mockUserRepository.findOne({
      $or: [
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
    const user = await mockUserRepository.create(userData);
    
    // Fetch user with role for token generation
    const userWithRole = await mockUserRepository.findByIdWithRole(user.id);
    
    // Generate JWT token
    const token = mockJwt.sign(
      {
        id: userWithRole.id,
        username: userWithRole.username,
        role: userWithRole.Role.name
      },
      'test-secret',
      { expiresIn: '24h' }
    );
    
    return { user: userWithRole, token };
  },
  
  // Login a user
  login: async (username, password) => {
    // Find user by username
    const user = await mockUserRepository.findByUsername(username);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }
    
    // Validate password (mocked for testing)
    const isPasswordValid = password === 'valid-password';
    
    if (!isPasswordValid) {
      throw new Error('Invalid username or password');
    }
    
    // Generate JWT token
    const token = mockJwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.Role.name
      },
      'test-secret',
      { expiresIn: '24h' }
    );
    
    return { user, token };
  }
};

describe('Auth Service', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  describe('register', () => {
    it('should register a new user and return user with token', async () => {
      // Arrange
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const createdUser = {
        id: 1,
        ...userData,
        roleId: 2
      };
      
      const userWithRole = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        Role: { id: 2, name: 'Player' }
      };
      
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);
      mockUserRepository.findByIdWithRole.mockResolvedValue(userWithRole);
      
      // Act
      const result = await authService.register(userData);
      
      // Assert
      expect(result).toHaveProperty('user', userWithRole);
      expect(result).toHaveProperty('token', 'test-token');
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        ...userData,
        roleId: 2
      });
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          id: 1,
          username: 'testuser',
          role: 'Player'
        },
        'test-secret',
        { expiresIn: '24h' }
      );
    });
    
    it('should throw error if username already exists', async () => {
      // Arrange
      const userData = {
        username: 'existinguser',
        email: 'new@example.com',
        password: 'password123'
      };
      
      const existingUser = {
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com'
      };
      
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      
      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Username already taken');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
    
    it('should throw error if email already exists', async () => {
      // Arrange
      const userData = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      const existingUser = {
        id: 1,
        username: 'existinguser',
        email: 'existing@example.com'
      };
      
      mockUserRepository.findOne.mockResolvedValue(existingUser);
      
      // Act & Assert
      await expect(authService.register(userData)).rejects.toThrow('Email already registered');
      expect(mockUserRepository.create).not.toHaveBeenCalled();
    });
  });
  
  describe('login', () => {
    it('should login user and return user with token', async () => {
      // Arrange
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        Role: { id: 2, name: 'Player' }
      };
      
      mockUserRepository.findByUsername.mockResolvedValue(user);
      
      // Act
      const result = await authService.login('testuser', 'valid-password');
      
      // Assert
      expect(result).toHaveProperty('user', user);
      expect(result).toHaveProperty('token', 'test-token');
      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          id: 1,
          username: 'testuser',
          role: 'Player'
        },
        'test-secret',
        { expiresIn: '24h' }
      );
    });
    
    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.findByUsername.mockResolvedValue(null);
      
      // Act & Assert
      await expect(authService.login('nonexistent', 'password')).rejects.toThrow('Invalid username or password');
    });
    
    it('should throw error if password is invalid', async () => {
      // Arrange
      const user = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        Role: { id: 2, name: 'Player' }
      };
      
      mockUserRepository.findByUsername.mockResolvedValue(user);
      
      // Act & Assert
      await expect(authService.login('testuser', 'invalid-password')).rejects.toThrow('Invalid username or password');
    });
  });
});