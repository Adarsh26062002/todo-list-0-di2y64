import { Middleware } from 'redux';
import { saveTodos, saveFilter, isStorageAvailable } from '../utils/localStorage';
import { STORAGE_CONFIG } from '../configs/constants';
import { RootState } from '../types';

/**
 * Creates a Redux middleware that persists state to localStorage with throttling
 * 
 * This middleware automatically saves the application state to localStorage whenever
 * the state changes, with throttling to prevent excessive writes during rapid updates.
 * 
 * @returns {Middleware} A Redux middleware function
 */
export const createStorageMiddleware = (): Middleware => {
  // Check if localStorage is available
  const storageAvailable = isStorageAvailable();
  
  if (!storageAvailable) {
    console.warn('localStorage is not available - state persistence will not work');
  }
  
  // Timer for throttling
  let saveTimer: ReturnType<typeof setTimeout> | null = null;
  
  // Return the middleware function
  return store => next => action => {
    // Call the next middleware in the chain
    const result = next(action);
    
    // Only proceed if localStorage is available
    if (storageAvailable) {
      // Throttle localStorage writes
      if (saveTimer === null) {
        saveTimer = setTimeout(() => {
          try {
            // Get current state
            const state = store.getState() as RootState;
            
            // Save todos and filter separately for efficiency
            saveTodos(state.todos);
            saveFilter(state.filters);
            
            // Reset timer
            saveTimer = null;
          } catch (e) {
            console.warn('Error in localStorage middleware:', e);
            
            // Reset timer even if save fails
            saveTimer = null;
          }
        }, STORAGE_CONFIG.THROTTLE_MS);
      }
    }
    
    return result;
  };
};

// Default export provides a pre-configured middleware instance
export default createStorageMiddleware();