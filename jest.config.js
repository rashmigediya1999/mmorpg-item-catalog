export default {
  // The test environment that will be used for testing
  testEnvironment: 'node',
  
  // Indicates whether each individual test should be reported during the run
  verbose: true,
  
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  
  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',
  
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/tests/'],
  
  // A list of file extensions to include in tests
  moduleFileExtensions: ['js'],
  
  // The glob patterns Jest uses to detect test files
  testMatch: ['**/?(*.)+(spec|test).js'],
  
  // A transformer is needed for ES modules
  transform: {},
  
  // Required when using ES modules
  transformIgnorePatterns: [],
  
  // Use extended timeout for more complex tests
  testTimeout: 30000,
  
  // Setup files to run before tests
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js',  
  ],
  
  // Mock function implementation
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  },

  testPathIgnorePatterns: ['/node_modules/'],
  
  // Provide a custom resolver
  resolver: undefined,
  
  // Coverage configuration
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js"
  ],
  
  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};