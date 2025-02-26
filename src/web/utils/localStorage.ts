/**
 * Utility module for localStorage operations in the Todo application
 * 
 * This module provides functions for interacting with the browser's localStorage API,
 * handling persistence of application state between sessions, and managing errors
 * that can occur with client-side storage.
 */

import { STORAGE_KEYS, STORAGE_CONFIG } from '../configs/constants';
import { LocalStorageState, TodosState, FiltersState } from '../types';

/**
 * Checks if localStorage is available and functioning in the current browser environment
 * 
 * This function tests localStorage by attempting to set and remove a test item,
 * which helps identify environments where localStorage might be disabled 
 * (e.g., private browsing modes in some browsers).
 * 
 * @returns {boolean} True if localStorage is available and working, false otherwise
 */
export const isStorageAvailable = (): boolean => {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    console.warn('localStorage is not available:', e);
    return false;
  }
};

/**
 * Saves the entire application state to localStorage
 * 
 * @param {LocalStorageState} state - The complete application state to save
 * @returns {boolean} True if save was successful, false otherwise
 */
export const saveState = (state: LocalStorageState): boolean => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEYS.APP_NAMESPACE, serializedState);
    return true;
  } catch (e) {
    console.error('Failed to save state to localStorage:', e);
    
    // Provide more context if it's a quota error
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Consider cleaning up old data.');
    }
    
    return false;
  }
};

/**
 * Loads the entire application state from localStorage
 * 
 * @returns {LocalStorageState | undefined} The parsed state if successful, undefined otherwise
 */
export const loadState = (): LocalStorageState | undefined => {
  if (!isStorageAvailable()) {
    return undefined;
  }

  try {
    const serializedState = localStorage.getItem(STORAGE_KEYS.APP_NAMESPACE);
    
    if (serializedState === null) {
      return undefined;
    }
    
    return JSON.parse(serializedState) as LocalStorageState;
  } catch (e) {
    console.error('Failed to load state from localStorage:', e);
    
    // Log specific error for corrupted data
    if (e instanceof SyntaxError) {
      console.error('Stored state data appears to be corrupted. Resetting to default state.');
    }
    
    return undefined;
  }
};

/**
 * Saves only the todos portion of the state to localStorage
 * 
 * This is more efficient than saving the entire state when only todos have changed.
 * 
 * @param {TodosState} todosState - The todos state to save
 * @returns {boolean} True if save was successful, false otherwise
 */
export const saveTodos = (todosState: TodosState): boolean => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const serializedTodos = JSON.stringify(todosState);
    localStorage.setItem(STORAGE_KEYS.TODOS, serializedTodos);
    return true;
  } catch (e) {
    console.error('Failed to save todos to localStorage:', e);
    
    // Provide specific message for quota errors
    if (e instanceof DOMException && e.name === 'QuotaExceededError') {
      console.error('localStorage quota exceeded. Consider removing old completed todos.');
    }
    
    return false;
  }
};

/**
 * Loads only the todos portion of the state from localStorage
 * 
 * @returns {TodosState | undefined} The parsed todos state if successful, undefined otherwise
 */
export const loadTodos = (): TodosState | undefined => {
  if (!isStorageAvailable()) {
    return undefined;
  }

  try {
    const serializedTodos = localStorage.getItem(STORAGE_KEYS.TODOS);
    
    if (serializedTodos === null) {
      return undefined;
    }
    
    return JSON.parse(serializedTodos) as TodosState;
  } catch (e) {
    console.error('Failed to load todos from localStorage:', e);
    return undefined;
  }
};

/**
 * Saves only the filter portion of the state to localStorage
 * 
 * This is more efficient than saving the entire state when only the filter has changed.
 * 
 * @param {FiltersState} filterState - The filter state to save
 * @returns {boolean} True if save was successful, false otherwise
 */
export const saveFilter = (filterState: FiltersState): boolean => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    const serializedFilter = JSON.stringify(filterState);
    localStorage.setItem(STORAGE_KEYS.FILTER, serializedFilter);
    return true;
  } catch (e) {
    console.error('Failed to save filter to localStorage:', e);
    return false;
  }
};

/**
 * Loads only the filter portion of the state from localStorage
 * 
 * @returns {FiltersState | undefined} The parsed filter state if successful, undefined otherwise
 */
export const loadFilter = (): FiltersState | undefined => {
  if (!isStorageAvailable()) {
    return undefined;
  }

  try {
    const serializedFilter = localStorage.getItem(STORAGE_KEYS.FILTER);
    
    if (serializedFilter === null) {
      return undefined;
    }
    
    return JSON.parse(serializedFilter) as FiltersState;
  } catch (e) {
    console.error('Failed to load filter from localStorage:', e);
    return undefined;
  }
};

/**
 * Removes all application data from localStorage
 * 
 * This function clears all todo application data without affecting
 * other applications using localStorage.
 * 
 * @returns {boolean} True if clear was successful, false otherwise
 */
export const clearStorage = (): boolean => {
  if (!isStorageAvailable()) {
    return false;
  }

  try {
    localStorage.removeItem(STORAGE_KEYS.APP_NAMESPACE);
    localStorage.removeItem(STORAGE_KEYS.TODOS);
    localStorage.removeItem(STORAGE_KEYS.FILTER);
    return true;
  } catch (e) {
    console.error('Failed to clear localStorage:', e);
    return false;
  }
};