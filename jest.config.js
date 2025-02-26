/**
 * Jest configuration file for the Todo List application
 * Configures testing environment, paths, coverage thresholds, and other testing settings
 * @version 1.0.0
 */

module.exports = {
  // Use jsdom environment to simulate browser environment for React component testing
  testEnvironment: "jsdom",
  
  // Define the root directory for tests
  roots: ["<rootDir>/src"],
  
  // Setup files to run before each test
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.js"],
  
  // Pattern matching for test files
  testMatch: [
    "**/__tests__/**/*.+(js|jsx)",
    "**/?(*.)+(spec|test).+(js|jsx)"
  ],
  
  // Transform files before testing (if needed for non-standard JS files)
  transform: {
    "^.+\\.(js|jsx)$": "babel-jest"
  },
  
  // Mock CSS/SCSS imports to avoid errors
  moduleNameMapper: {
    "\\.(css|less|scss|sass)$": "identity-obj-proxy"
  },
  
  // File extensions to consider
  moduleFileExtensions: ["js", "jsx", "json", "node"],
  
  // Enable code coverage collection
  collectCoverage: true,
  
  // Coverage report formats
  coverageReporters: ["text", "lcov", "json-summary"],
  
  // Coverage thresholds as per requirements
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    "./src/features/**/*.js": {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    "./src/components/**/*.jsx": {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },
  
  // Paths to ignore for testing
  testPathIgnorePatterns: [
    "/node_modules/",
    "/build/",
    "/dist/"
  ],
  
  // Patterns to ignore for transformations (nanoid is used for ID generation)
  transformIgnorePatterns: [
    "/node_modules/(?!nanoid)"
  ],
  
  // Clear mocks before each test
  clearMocks: true,
  
  // Reset mock state before each test
  resetMocks: true,
  
  // Restore mocks after each test
  restoreMocks: true,
  
  // Enable verbose test output
  verbose: true
};