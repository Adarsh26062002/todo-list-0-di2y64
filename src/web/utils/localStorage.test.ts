/**
 * Test suite for the localStorage utility functions
 * 
 * Tests the functionality of the localStorage service, ensuring proper saving,
 * loading, and error handling for application state persistence.
 */

import 'jest-localstorage-mock'; // v2.4.22
import { 
  isStorageAvailable,
  saveState,
  loadState,
  saveTodos,
  loadTodos,
  saveFilter,
  loadFilter,
  clearStorage
} from './localStorage';
import { STORAGE_KEYS } from '../configs/constants';
import { TodosState, FiltersState, LocalStorageState, FilterStatus } from '../types';

/**
 * Creates a mock todos state for testing
 * 
 * @returns {TodosState} A mock todos state with test data
 */
const mockTodosState = (): TodosState => ({
  entities: [
    { id: '1', text: 'Test todo 1', completed: false },
    { id: '2', text: 'Test todo 2', completed: true }
  ]
});

/**
 * Creates a mock filters state for testing
 * 
 * @returns {FiltersState} A mock filters state with test data
 */
const mockFiltersState = (): FiltersState => ({
  status: FilterStatus.All
});

/**
 * Creates a mock complete application state for testing
 * 
 * @returns {LocalStorageState} A mock application state combining todos and filters
 */
const mockLocalStorageState = (): LocalStorageState => ({
  todos: mockTodosState(),
  filters: mockFiltersState()
});

describe('localStorage utilities', () => {
  // Mock console.error to prevent noise in test output
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorage.clear();
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });
  
  afterEach(() => {
    // Restore mocks after each test
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('isStorageAvailable', () => {
    it('should return true when localStorage is available', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('should return false when localStorage is not available', () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      expect(isStorageAvailable()).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      // Restore original implementation
      setItemSpy.mockRestore();
    });

    it('should return false when localStorage throws an exception', () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('localStorage not available');
      });
      
      expect(isStorageAvailable()).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      // Restore original implementation
      setItemSpy.mockRestore();
    });

    it('should return false when localStorage setItem throws an exception', () => {
      // Mock localStorage.setItem to throw a DOMException for quota exceeded
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('QuotaExceededError', 'QuotaExceededError');
      });
      
      expect(isStorageAvailable()).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalled();
      
      // Restore original implementation
      setItemSpy.mockRestore();
    });
  });

  describe('saveState', () => {
    it('should save complete state to localStorage', () => {
      const state = mockLocalStorageState();
      const result = saveState(state);
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.APP_NAMESPACE,
        JSON.stringify(state)
      );
    });

    it('should return true on successful save', () => {
      const state = mockLocalStorageState();
      const result = saveState(state);
      
      expect(result).toBe(true);
    });

    it('should return false when localStorage is unavailable', () => {
      // Mock isStorageAvailable to return false
      const storageAvailableSpy = jest.spyOn({ isStorageAvailable }, 'isStorageAvailable').mockReturnValue(false);
      Object.defineProperty(localStorage, 'isStorageAvailable', { value: storageAvailableSpy });
      
      const state = mockLocalStorageState();
      const result = saveState(state);
      
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
      
      storageAvailableSpy.mockRestore();
    });

    it('should handle JSON serialization errors', () => {
      // Create a circular reference that can't be JSON stringified
      const state = mockLocalStorageState() as any;
      const circularObj: any = {};
      circularObj.self = circularObj;
      state.circular = circularObj;
      
      const stringifySpy = jest.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw new Error('Circular reference');
      });
      
      const result = saveState(state);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      stringifySpy.mockRestore();
    });

    it('should log error message when saving fails', () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('setItem error');
      });
      
      const state = mockLocalStorageState();
      const result = saveState(state);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      setItemSpy.mockRestore();
    });
  });

  describe('loadState', () => {
    it('should load complete state from localStorage', () => {
      const state = mockLocalStorageState();
      localStorage.setItem(STORAGE_KEYS.APP_NAMESPACE, JSON.stringify(state));
      
      const result = loadState();
      
      expect(result).toEqual(state);
    });

    it('should return undefined when no state exists', () => {
      const result = loadState();
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when localStorage is unavailable', () => {
      // Mock isStorageAvailable to return false
      const storageAvailableSpy = jest.spyOn({ isStorageAvailable }, 'isStorageAvailable').mockReturnValue(false);
      Object.defineProperty(localStorage, 'isStorageAvailable', { value: storageAvailableSpy });
      
      const result = loadState();
      
      expect(result).toBeUndefined();
      
      storageAvailableSpy.mockRestore();
    });

    it('should handle JSON parsing errors', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem(STORAGE_KEYS.APP_NAMESPACE, 'invalid JSON');
      
      const result = loadState();
      
      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error message when loading fails', () => {
      // Mock localStorage.getItem to throw an error
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('getItem error');
      });
      
      const result = loadState();
      
      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      getItemSpy.mockRestore();
    });
  });

  describe('saveTodos', () => {
    it('should save todos state to localStorage with correct key', () => {
      const todosState = mockTodosState();
      const result = saveTodos(todosState);
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.TODOS,
        JSON.stringify(todosState)
      );
    });

    it('should return true on successful save', () => {
      const todosState = mockTodosState();
      const result = saveTodos(todosState);
      
      expect(result).toBe(true);
    });

    it('should return false when localStorage is unavailable', () => {
      // Mock isStorageAvailable to return false
      const storageAvailableSpy = jest.spyOn({ isStorageAvailable }, 'isStorageAvailable').mockReturnValue(false);
      Object.defineProperty(localStorage, 'isStorageAvailable', { value: storageAvailableSpy });
      
      const todosState = mockTodosState();
      const result = saveTodos(todosState);
      
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
      
      storageAvailableSpy.mockRestore();
    });

    it('should handle JSON serialization errors', () => {
      // Create a circular reference that can't be JSON stringified
      const todosState = mockTodosState() as any;
      const circularObj: any = {};
      circularObj.self = circularObj;
      todosState.circular = circularObj;
      
      const stringifySpy = jest.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw new Error('Circular reference');
      });
      
      const result = saveTodos(todosState);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      stringifySpy.mockRestore();
    });

    it('should log error message when saving fails', () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('setItem error');
      });
      
      const todosState = mockTodosState();
      const result = saveTodos(todosState);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      setItemSpy.mockRestore();
    });
  });

  describe('loadTodos', () => {
    it('should load todos state from localStorage with correct key', () => {
      const todosState = mockTodosState();
      localStorage.setItem(STORAGE_KEYS.TODOS, JSON.stringify(todosState));
      
      const result = loadTodos();
      
      expect(result).toEqual(todosState);
    });

    it('should return undefined when no todos exist', () => {
      const result = loadTodos();
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when localStorage is unavailable', () => {
      // Mock isStorageAvailable to return false
      const storageAvailableSpy = jest.spyOn({ isStorageAvailable }, 'isStorageAvailable').mockReturnValue(false);
      Object.defineProperty(localStorage, 'isStorageAvailable', { value: storageAvailableSpy });
      
      const result = loadTodos();
      
      expect(result).toBeUndefined();
      
      storageAvailableSpy.mockRestore();
    });

    it('should handle JSON parsing errors', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem(STORAGE_KEYS.TODOS, 'invalid JSON');
      
      const result = loadTodos();
      
      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error message when loading fails', () => {
      // Mock localStorage.getItem to throw an error
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('getItem error');
      });
      
      const result = loadTodos();
      
      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      getItemSpy.mockRestore();
    });
  });

  describe('saveFilter', () => {
    it('should save filter state to localStorage with correct key', () => {
      const filterState = mockFiltersState();
      const result = saveFilter(filterState);
      
      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEYS.FILTER,
        JSON.stringify(filterState)
      );
    });

    it('should return true on successful save', () => {
      const filterState = mockFiltersState();
      const result = saveFilter(filterState);
      
      expect(result).toBe(true);
    });

    it('should return false when localStorage is unavailable', () => {
      // Mock isStorageAvailable to return false
      const storageAvailableSpy = jest.spyOn({ isStorageAvailable }, 'isStorageAvailable').mockReturnValue(false);
      Object.defineProperty(localStorage, 'isStorageAvailable', { value: storageAvailableSpy });
      
      const filterState = mockFiltersState();
      const result = saveFilter(filterState);
      
      expect(result).toBe(false);
      expect(localStorage.setItem).not.toHaveBeenCalled();
      
      storageAvailableSpy.mockRestore();
    });

    it('should handle JSON serialization errors', () => {
      // Create a circular reference that can't be JSON stringified
      const filterState = mockFiltersState() as any;
      const circularObj: any = {};
      circularObj.self = circularObj;
      filterState.circular = circularObj;
      
      const stringifySpy = jest.spyOn(JSON, 'stringify').mockImplementation(() => {
        throw new Error('Circular reference');
      });
      
      const result = saveFilter(filterState);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      stringifySpy.mockRestore();
    });

    it('should log error message when saving fails', () => {
      // Mock localStorage.setItem to throw an error
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('setItem error');
      });
      
      const filterState = mockFiltersState();
      const result = saveFilter(filterState);
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      setItemSpy.mockRestore();
    });
  });

  describe('loadFilter', () => {
    it('should load filter state from localStorage with correct key', () => {
      const filterState = mockFiltersState();
      localStorage.setItem(STORAGE_KEYS.FILTER, JSON.stringify(filterState));
      
      const result = loadFilter();
      
      expect(result).toEqual(filterState);
    });

    it('should return undefined when no filter exists', () => {
      const result = loadFilter();
      
      expect(result).toBeUndefined();
    });

    it('should return undefined when localStorage is unavailable', () => {
      // Mock isStorageAvailable to return false
      const storageAvailableSpy = jest.spyOn({ isStorageAvailable }, 'isStorageAvailable').mockReturnValue(false);
      Object.defineProperty(localStorage, 'isStorageAvailable', { value: storageAvailableSpy });
      
      const result = loadFilter();
      
      expect(result).toBeUndefined();
      
      storageAvailableSpy.mockRestore();
    });

    it('should handle JSON parsing errors', () => {
      // Set invalid JSON in localStorage
      localStorage.setItem(STORAGE_KEYS.FILTER, 'invalid JSON');
      
      const result = loadFilter();
      
      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should log error message when loading fails', () => {
      // Mock localStorage.getItem to throw an error
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('getItem error');
      });
      
      const result = loadFilter();
      
      expect(result).toBeUndefined();
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      getItemSpy.mockRestore();
    });
  });

  describe('clearStorage', () => {
    it('should remove all application data from localStorage', () => {
      // Set up some data in localStorage
      localStorage.setItem(STORAGE_KEYS.APP_NAMESPACE, 'test data');
      localStorage.setItem(STORAGE_KEYS.TODOS, 'test todos');
      localStorage.setItem(STORAGE_KEYS.FILTER, 'test filter');
      
      const result = clearStorage();
      
      expect(result).toBe(true);
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.APP_NAMESPACE);
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.TODOS);
      expect(localStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.FILTER);
    });

    it('should return true on successful clear', () => {
      const result = clearStorage();
      
      expect(result).toBe(true);
    });

    it('should return false when localStorage is unavailable', () => {
      // Mock isStorageAvailable to return false
      const storageAvailableSpy = jest.spyOn({ isStorageAvailable }, 'isStorageAvailable').mockReturnValue(false);
      Object.defineProperty(localStorage, 'isStorageAvailable', { value: storageAvailableSpy });
      
      const result = clearStorage();
      
      expect(result).toBe(false);
      expect(localStorage.removeItem).not.toHaveBeenCalled();
      
      storageAvailableSpy.mockRestore();
    });

    it('should log error message when clearing fails', () => {
      // Mock localStorage.removeItem to throw an error
      const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('removeItem error');
      });
      
      const result = clearStorage();
      
      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalled();
      
      removeItemSpy.mockRestore();
    });
  });

  describe('integration tests', () => {
    it('should correctly save and load the complete state', () => {
      const state = mockLocalStorageState();
      
      // Save the state
      saveState(state);
      
      // Load the state
      const loadedState = loadState();
      
      expect(loadedState).toEqual(state);
    });

    it('should correctly save and load todos state separately', () => {
      const todosState = mockTodosState();
      
      // Save todos
      saveTodos(todosState);
      
      // Load todos
      const loadedTodos = loadTodos();
      
      expect(loadedTodos).toEqual(todosState);
    });

    it('should correctly save and load filter state separately', () => {
      const filterState = mockFiltersState();
      
      // Save filter
      saveFilter(filterState);
      
      // Load filter
      const loadedFilter = loadFilter();
      
      expect(loadedFilter).toEqual(filterState);
    });

    it('should clear all data correctly after saving', () => {
      // Set up data in localStorage
      const state = mockLocalStorageState();
      saveState(state);
      
      // Verify data was saved
      expect(localStorage.getItem(STORAGE_KEYS.APP_NAMESPACE)).not.toBeNull();
      
      // Clear data
      clearStorage();
      
      // Verify data was cleared
      expect(localStorage.getItem(STORAGE_KEYS.APP_NAMESPACE)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.TODOS)).toBeNull();
      expect(localStorage.getItem(STORAGE_KEYS.FILTER)).toBeNull();
    });
  });
});