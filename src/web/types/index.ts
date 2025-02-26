/**
 * TypeScript type definitions for the Todo application.
 * This file serves as a central repository for all type definitions used across the application.
 */

/**
 * Represents a todo item in the application.
 */
export interface Todo {
  /** Unique identifier for the todo item */
  id: string;
  /** Text content of the todo item */
  text: string;
  /** Indicates whether the todo is completed or not */
  completed: boolean;
}

/**
 * Represents the todos slice in the Redux store.
 */
export interface TodosState {
  /** Array of todo items */
  entities: Todo[];
}

/**
 * Enum representing the possible filter states for todo items.
 */
export enum FilterStatus {
  /** Show all todos regardless of completion status */
  All = 'all',
  /** Show only active (incomplete) todos */
  Active = 'active',
  /** Show only completed todos */
  Completed = 'completed'
}

/**
 * Represents the filters slice in the Redux store.
 */
export interface FiltersState {
  /** Current active filter status */
  status: FilterStatus;
}

/**
 * Represents the root state structure of the Redux store.
 */
export interface RootState {
  /** Todos slice of the store */
  todos: TodosState;
  /** Filters slice of the store */
  filters: FiltersState;
}

/**
 * Type definition for the Redux store dispatch function.
 * This type will be properly defined when configuring the store.
 */
export type AppDispatch = any; // This will be properly typed when the store is configured

/**
 * Represents validation results for form inputs.
 */
export interface ValidationResult {
  /** Indicates whether the validation passed (true) or failed (false) */
  isValid: boolean;
  /** Error message when validation fails, undefined when validation passes */
  errorMessage?: string;
}

/**
 * Represents the structure of the state saved in localStorage.
 */
export interface LocalStorageState {
  /** Todos state to be persisted */
  todos: TodosState;
  /** Filters state to be persisted */
  filters: FiltersState;
}