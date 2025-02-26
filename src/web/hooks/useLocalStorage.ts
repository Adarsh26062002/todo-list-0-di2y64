/**
 * A custom React hook for using localStorage with a useState-like API
 * 
 * This hook provides a way to persist component state in localStorage between
 * browser sessions while maintaining a familiar state management interface.
 * 
 * @template T The type of the state value to be stored
 * @param {string} key The localStorage key to store the state under
 * @param {T} initialValue The initial value to use if no value is found in localStorage
 * @returns {[T, (value: T | ((val: T) => T)) => void]} A stateful value and a function to update it
 */
import { useState, useEffect, useCallback } from 'react'; // React ^18.2.0
import { saveState, loadState, isStorageAvailable } from '../utils/localStorage';
import { STORAGE_KEYS } from '../configs/constants';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Function to get the stored value from localStorage or return initialValue
  const getStoredValue = (): T => {
    if (!isStorageAvailable()) {
      console.warn('localStorage is not available, using in-memory state only');
      return initialValue;
    }

    try {
      // Construct the full key with namespace
      const fullKey = `${STORAGE_KEYS.APP_NAMESPACE}.${key}`;
      // Get the item from localStorage
      const item = localStorage.getItem(fullKey);
      // Parse stored json or return initialValue if nothing in localStorage
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If reading from localStorage fails, log error and return initialValue
      console.error(`Error reading from localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // State to store our value
  // Pass initial state function to useState so the logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(getStoredValue);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage.
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage if available
      if (isStorageAvailable()) {
        const fullKey = `${STORAGE_KEYS.APP_NAMESPACE}.${key}`;
        localStorage.setItem(fullKey, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // If localStorage operations fail, we still update the in-memory state
      // but log the error for debugging
      console.error(`Error saving to localStorage key "${key}":`, error);
      
      // Provide more specific guidance if it's a quota error
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('localStorage quota exceeded. Consider cleaning up stored data.');
      }
    }
  }, [key, storedValue]);

  // Listen for changes to this localStorage key in other windows/tabs
  useEffect(() => {
    if (!isStorageAvailable()) {
      return;
    }
    
    const handleStorageChange = (e: StorageEvent) => {
      const fullKey = `${STORAGE_KEYS.APP_NAMESPACE}.${key}`;
      if (e.key === fullKey && e.newValue) {
        try {
          const newValue = JSON.parse(e.newValue);
          // Only update state if the value actually changed
          // This prevents needless re-renders
          if (JSON.stringify(newValue) !== JSON.stringify(storedValue)) {
            setStoredValue(newValue);
          }
        } catch (error) {
          console.error(`Error parsing storage event for key "${key}":`, error);
        }
      }
    };
    
    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, storedValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;