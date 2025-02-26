/**
 * Central Redux store configuration for the Todo List application using Redux Toolkit.
 * Configures the store with todos and filters reducers, sets up localStorage persistence middleware,
 * and provides type definitions for the store, state, and dispatch types.
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit'; // v1.9.3
import todosReducer from '../features/todos/todosSlice';
import filtersReducer from '../features/filters/filtersSlice';
import storageMiddleware from '../middleware/localStorage';
import { loadTodos, loadFilter } from '../utils/localStorage';
import { TodosState, FiltersState, FilterStatus } from '../types';
import { DEFAULT_VALUES } from '../configs/constants';

/**
 * Helper function that loads persisted state from localStorage to hydrate the initial Redux state
 * @returns Initial state with data from localStorage if available, or undefined if nothing was loaded
 */
const getPreloadedState = (): { todos: TodosState; filters: FiltersState } | undefined => {
  const todos = loadTodos();
  const filter = loadFilter();
  
  // Only return preloaded state if at least one slice has data
  if (todos || filter) {
    return {
      todos: todos || { entities: [] },
      filters: filter || { status: DEFAULT_VALUES.DEFAULT_FILTER as FilterStatus }
    };
  }
  
  return undefined;
};

// Combine individual reducers into a root reducer
const rootReducer = combineReducers({
  todos: todosReducer,
  filters: filtersReducer
});

/**
 * Configure and create the Redux store using Redux Toolkit's configureStore
 * This sets up:
 * - Combined reducers for todos and filters
 * - Preloaded state from localStorage
 * - Default middleware plus custom localStorage persistence middleware
 * - Redux DevTools extension integration
 */
export const store = configureStore({
  reducer: rootReducer,
  preloadedState: getPreloadedState(),
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(storageMiddleware),
  // DevTools is enabled by default in development
});

// Infer the `RootState` and `AppDispatch` types from the store itself
// These types are used throughout the application for type-safe Redux usage
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;