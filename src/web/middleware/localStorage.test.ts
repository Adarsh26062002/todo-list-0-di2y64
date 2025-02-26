import configureMockStore from 'redux-mock-store'; // v1.5.4
import 'jest-localstorage-mock'; // v2.4.21
import localStorageMiddleware, { createStorageMiddleware } from './localStorage';
import { 
  saveTodos, 
  saveFilter, 
  isStorageAvailable,
  loadTodos,
  loadFilter
} from '../utils/localStorage';
import { STORAGE_CONFIG } from '../configs/constants';
import { addTodo, toggleTodo } from '../features/todos/todosSlice';
import { setFilter } from '../features/filters/filtersSlice';

// Mock the localStorage utility functions
jest.mock('../utils/localStorage');

// Setup and teardown
beforeEach(() => {
  localStorage.clear();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

/**
 * Helper function to create a mock Redux store with the localStorage middleware applied
 */
const createMockStore = (initialState = {}) => {
  const mockStore = configureMockStore([localStorageMiddleware]);
  return mockStore(initialState);
};

/**
 * Helper function to mock Date.now for testing throttling behavior
 */
const mockSystemTime = (timestamp: number) => {
  jest.spyOn(Date, 'now').mockReturnValue(timestamp);
};

describe('localStorage Middleware', () => {
  describe('createStorageMiddleware', () => {
    it('should create middleware when localStorage is available', () => {
      // Mock localStorage availability
      (isStorageAvailable as jest.Mock).mockReturnValue(true);
      
      // Create middleware
      const middleware = createStorageMiddleware();
      
      // Verify it's a function (middleware)
      expect(typeof middleware).toBe('function');
      expect(console.warn).not.toHaveBeenCalled();
    });
    
    it('should create middleware with warning when localStorage is not available', () => {
      // Mock localStorage unavailability
      (isStorageAvailable as jest.Mock).mockReturnValue(false);
      
      // Spy on console.warn
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      // Create middleware
      const middleware = createStorageMiddleware();
      
      // Verify it's a function and logs warning
      expect(typeof middleware).toBe('function');
      expect(consoleSpy).toHaveBeenCalledWith(
        'localStorage is not available - state persistence will not work'
      );
      
      // Cleanup
      consoleSpy.mockRestore();
    });
  });
  
  describe('Middleware functionality', () => {
    beforeEach(() => {
      // Mock localStorage availability by default
      (isStorageAvailable as jest.Mock).mockReturnValue(true);
      
      // Mock saveTodos and saveFilter to succeed by default
      (saveTodos as jest.Mock).mockReturnValue(true);
      (saveFilter as jest.Mock).mockReturnValue(true);
      
      // Use fake timers for better control
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should pass actions through to the next middleware', () => {
      const store = createMockStore({
        todos: { entities: [] },
        filters: { status: 'all' }
      });
      
      // Dispatch action
      const action = addTodo('Test todo');
      store.dispatch(action);
      
      // Verify action was passed through (will be in the actions array of mockStore)
      const actions = store.getActions();
      expect(actions).toEqual([action]);
    });
    
    it('should save todos state to localStorage after todo actions', () => {
      const initialState = {
        todos: { entities: [] },
        filters: { status: 'all' }
      };
      const store = createMockStore(initialState);
      
      // Dispatch a todos action
      store.dispatch(addTodo('Test todo'));
      
      // Run timers to trigger the throttled save
      jest.runAllTimers();
      
      // Verify saveTodos was called with the state
      expect(saveTodos).toHaveBeenCalledWith(initialState.todos);
      expect(saveFilter).toHaveBeenCalledWith(initialState.filters);
    });
    
    it('should save filter state to localStorage after filter actions', () => {
      const initialState = {
        todos: { entities: [] },
        filters: { status: 'all' }
      };
      const store = createMockStore(initialState);
      
      // Dispatch a filter action
      store.dispatch(setFilter('active'));
      
      // Run timers to trigger the throttled save
      jest.runAllTimers();
      
      // Verify saveFilter was called with the state
      expect(saveTodos).toHaveBeenCalledWith(initialState.todos);
      expect(saveFilter).toHaveBeenCalledWith(initialState.filters);
    });
    
    it('should not save to localStorage when it is unavailable', () => {
      // Mock localStorage unavailability
      (isStorageAvailable as jest.Mock).mockReturnValue(false);
      
      // Create a store with middleware that knows storage is unavailable
      const mockStore = configureMockStore([createStorageMiddleware()]);
      const store = mockStore({
        todos: { entities: [] },
        filters: { status: 'all' }
      });
      
      // Dispatch action
      store.dispatch(addTodo('Test todo'));
      
      // Run timers to trigger the throttled save
      jest.runAllTimers();
      
      // Verify saveTodos and saveFilter were not called
      expect(saveTodos).not.toHaveBeenCalled();
      expect(saveFilter).not.toHaveBeenCalled();
    });
  });
  
  describe('Throttling behavior', () => {
    beforeEach(() => {
      // Mock localStorage availability
      (isStorageAvailable as jest.Mock).mockReturnValue(true);
      
      // Mock save functions
      (saveTodos as jest.Mock).mockReturnValue(true);
      (saveFilter as jest.Mock).mockReturnValue(true);
      
      // Use fake timers
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should throttle multiple saves within the throttle period', () => {
      const store = createMockStore({
        todos: { entities: [] },
        filters: { status: 'all' }
      });
      
      // Dispatch multiple actions in quick succession
      store.dispatch(addTodo('Todo 1'));
      store.dispatch(toggleTodo('123'));
      store.dispatch(addTodo('Todo 2'));
      
      // Verify save not called before timeout completes
      expect(saveTodos).not.toHaveBeenCalled();
      expect(saveFilter).not.toHaveBeenCalled();
      
      // Run timers partially - not enough to trigger save
      jest.advanceTimersByTime(STORAGE_CONFIG.THROTTLE_MS - 10);
      
      // Verify still not called
      expect(saveTodos).not.toHaveBeenCalled();
      expect(saveFilter).not.toHaveBeenCalled();
      
      // Advance to complete throttle period
      jest.advanceTimersByTime(10);
      
      // Now verify save was called exactly once
      expect(saveTodos).toHaveBeenCalledTimes(1);
      expect(saveFilter).toHaveBeenCalledTimes(1);
    });
    
    it('should save again after throttle period completes', () => {
      const store = createMockStore({
        todos: { entities: [] },
        filters: { status: 'all' }
      });
      
      // First action
      store.dispatch(addTodo('Todo 1'));
      
      // Complete first throttle period
      jest.advanceTimersByTime(STORAGE_CONFIG.THROTTLE_MS);
      
      // Verify first save occurred
      expect(saveTodos).toHaveBeenCalledTimes(1);
      expect(saveFilter).toHaveBeenCalledTimes(1);
      
      // Reset mocks to clearly count next calls
      jest.clearAllMocks();
      
      // Another action after throttle period
      store.dispatch(addTodo('Todo 2'));
      
      // Complete second throttle period
      jest.advanceTimersByTime(STORAGE_CONFIG.THROTTLE_MS);
      
      // Verify second save occurred
      expect(saveTodos).toHaveBeenCalledTimes(1);
      expect(saveFilter).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('Error handling', () => {
    beforeEach(() => {
      // Mock localStorage availability
      (isStorageAvailable as jest.Mock).mockReturnValue(true);
      
      // Use fake timers
      jest.useFakeTimers();
    });
    
    afterEach(() => {
      jest.useRealTimers();
    });
    
    it('should log warning when saveTodos throws an error', () => {
      // Mock saveTodos to throw an error
      (saveTodos as jest.Mock).mockImplementation(() => {
        throw new Error('Storage error');
      });
      (saveFilter as jest.Mock).mockReturnValue(true);
      
      // Spy on console.warn
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const store = createMockStore({
        todos: { entities: [] },
        filters: { status: 'all' }
      });
      
      // Dispatch action
      store.dispatch(addTodo('Test todo'));
      
      // Run timers to trigger save
      jest.runAllTimers();
      
      // Verify warning was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in localStorage middleware:',
        expect.any(Error)
      );
      
      // Cleanup
      consoleSpy.mockRestore();
    });
    
    it('should log warning when saveFilter throws an error', () => {
      // Mock saveFilter to throw an error
      (saveTodos as jest.Mock).mockReturnValue(true);
      (saveFilter as jest.Mock).mockImplementation(() => {
        throw new Error('Filter storage error');
      });
      
      // Spy on console.warn
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const store = createMockStore({
        todos: { entities: [] },
        filters: { status: 'all' }
      });
      
      // Dispatch action
      store.dispatch(setFilter('active'));
      
      // Run timers to trigger save
      jest.runAllTimers();
      
      // Verify warning was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in localStorage middleware:',
        expect.any(Error)
      );
      
      // Cleanup
      consoleSpy.mockRestore();
    });
    
    it('should continue working after a storage error', () => {
      // First make saveTodos throw an error
      (saveTodos as jest.Mock).mockImplementationOnce(() => {
        throw new Error('Temporary storage error');
      });
      (saveFilter as jest.Mock).mockReturnValue(true);
      
      // Spy on console.warn but allow it to execute
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      const store = createMockStore({
        todos: { entities: [] },
        filters: { status: 'all' }
      });
      
      // Dispatch action and trigger error
      store.dispatch(addTodo('Todo 1'));
      jest.runAllTimers();
      
      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalled();
      
      // Reset mocks for second test
      jest.clearAllMocks();
      consoleSpy.mockClear();
      
      // Now make saveTodos work normally again
      (saveTodos as jest.Mock).mockReturnValue(true);
      
      // Dispatch another action
      store.dispatch(addTodo('Todo 2'));
      jest.runAllTimers();
      
      // Verify save was successful this time (no error logged)
      expect(saveTodos).toHaveBeenCalledTimes(1);
      expect(consoleSpy).not.toHaveBeenCalled();
      
      // Cleanup
      consoleSpy.mockRestore();
    });
  });
});