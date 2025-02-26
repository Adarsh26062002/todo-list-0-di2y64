// Import Jest DOM utilities for extending Jest with custom DOM element matchers
import '@testing-library/jest-dom';
// Import localStorage mock for testing localStorage interactions in Jest environment
import 'jest-localstorage-mock'; // v2.4.26

// Reset all mocks before each test to ensure test isolation
beforeEach(() => {
  jest.resetAllMocks();
});

// Mock the window.matchMedia API which might be used for responsive design features
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

/**
 * Creates a mock implementation of the IntersectionObserver API
 * This is useful for testing components that use IntersectionObserver
 * for features like lazy loading, infinite scroll, or visibility detection
 */
function setupMockIntersectionObserver(): void {
  const mockIntersectionObserver = jest.fn();
  
  mockIntersectionObserver.mockImplementation(callback => {
    return {
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
      takeRecords: jest.fn(() => []),
      root: null,
      rootMargin: '',
      thresholds: []
    };
  });

  // Assign the mock to the global object
  global.IntersectionObserver = mockIntersectionObserver;
}

// Initialize the IntersectionObserver mock
setupMockIntersectionObserver();