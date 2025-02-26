import { renderHook, act } from '@testing-library/react-hooks'; // @testing-library/react-hooks ^8.0.1
import useLocalStorage from '../hooks/useLocalStorage';
import { STORAGE_KEYS } from '../configs/constants';

/**
 * Creates a mock implementation of localStorage for testing
 * @returns Mock localStorage object with getItem, setItem, and removeItem methods
 */
function mockLocalStorage() {
  const store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => {
      return store[key] || null;
    }),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => {
        delete store[key];
      });
    })
  };
}

// Mock the isStorageAvailable function from localStorage utility
jest.mock('../utils/localStorage', () => ({
  isStorageAvailable: jest.fn().mockReturnValue(true)
}));

describe('useLocalStorage hook', () => {
  // Save original localStorage
  const originalLocalStorage = global.localStorage;
  let mockStorage: ReturnType<typeof mockLocalStorage>;

  beforeEach(() => {
    // Setup mock localStorage before each test
    mockStorage = mockLocalStorage();
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      writable: true
    });
    
    // Mock console methods to prevent actual console output during tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore original localStorage after each test
    Object.defineProperty(global, 'localStorage', {
      value: originalLocalStorage,
      writable: true
    });
    jest.clearAllMocks();
  });

  it('should return stored value from localStorage on initialization', () => {
    // Arrange
    const testKey = 'testKey';
    const testValue = { test: 'value' };
    const fullKey = `${STORAGE_KEYS.APP_NAMESPACE}.${testKey}`;
    mockStorage.getItem.mockReturnValueOnce(JSON.stringify(testValue));
    
    // Act
    const { result } = renderHook(() => useLocalStorage(testKey, 'defaultValue'));
    
    // Assert
    expect(result.current[0]).toEqual(testValue);
    expect(mockStorage.getItem).toHaveBeenCalledWith(fullKey);
  });

  it('should return initial value when localStorage is empty', () => {
    // Arrange
    const testKey = 'testKey';
    const initialValue = 'defaultValue';
    mockStorage.getItem.mockReturnValueOnce(null);
    
    // Act
    const { result } = renderHook(() => useLocalStorage(testKey, initialValue));
    
    // Assert
    expect(result.current[0]).toBe(initialValue);
  });

  it('should update localStorage when setValue is called', () => {
    // Arrange
    const testKey = 'testKey';
    const initialValue = 'initialValue';
    const newValue = 'newValue';
    const fullKey = `${STORAGE_KEYS.APP_NAMESPACE}.${testKey}`;
    
    // Act
    const { result } = renderHook(() => useLocalStorage(testKey, initialValue));
    
    act(() => {
      result.current[1](newValue);
    });
    
    // Assert
    expect(mockStorage.setItem).toHaveBeenCalledWith(fullKey, JSON.stringify(newValue));
    expect(result.current[0]).toBe(newValue);
  });

  it('should handle localStorage.getItem throwing an error', () => {
    // Arrange
    const testKey = 'testKey';
    const initialValue = 'defaultValue';
    mockStorage.getItem.mockImplementationOnce(() => { 
      throw new Error('Storage error'); 
    });
    
    const consoleSpy = jest.spyOn(console, 'error');
    
    // Act
    const { result } = renderHook(() => useLocalStorage(testKey, initialValue));
    
    // Assert
    expect(result.current[0]).toBe(initialValue);
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle localStorage.setItem throwing an error', () => {
    // Arrange
    const testKey = 'testKey';
    const initialValue = 'initialValue';
    const newValue = 'newValue';
    mockStorage.setItem.mockImplementationOnce(() => { 
      throw new Error('Storage error'); 
    });
    
    const consoleSpy = jest.spyOn(console, 'error');
    
    // Act
    const { result } = renderHook(() => useLocalStorage(testKey, initialValue));
    
    act(() => {
      result.current[1](newValue);
    });
    
    // Assert
    expect(result.current[0]).toBe(newValue); // Value should still update in memory
    expect(consoleSpy).toHaveBeenCalled();
  });

  it('should handle JSON.parse errors when localStorage contains invalid JSON', () => {
    // Arrange
    const testKey = 'testKey';
    const initialValue = 'defaultValue';
    const fullKey = `${STORAGE_KEYS.APP_NAMESPACE}.${testKey}`;
    const invalidJson = '{invalid json}';
    mockStorage.getItem.mockReturnValueOnce(invalidJson);
    
    const consoleSpy = jest.spyOn(console, 'error');
    
    // Act
    const { result } = renderHook(() => useLocalStorage(testKey, initialValue));
    
    // Assert
    expect(result.current[0]).toBe(initialValue); // Should fall back to initial value
    expect(mockStorage.getItem).toHaveBeenCalledWith(fullKey);
    expect(consoleSpy).toHaveBeenCalled();
  });
});