/**
 * Constants used throughout the Todo List application
 * 
 * This file serves as a central repository for all constant values used in the application.
 * Centralizing constants improves maintainability by ensuring consistency across components
 * and making it easier to update values in one place.
 */

/**
 * Filter values used in the Redux store and filter logic
 */
export const FILTERS = {
  /** Show all todos regardless of completion status */
  ALL: 'all',
  /** Show only incomplete todos */
  ACTIVE: 'active',
  /** Show only completed todos */
  COMPLETED: 'completed',
} as const;

/**
 * Human-readable labels for filter options displayed in the UI
 */
export const FILTER_LABELS = {
  /** Label for the "All" filter button */
  ALL: 'All',
  /** Label for the "Active" filter button */
  ACTIVE: 'Active',
  /** Label for the "Completed" filter button */
  COMPLETED: 'Completed',
} as const;

/**
 * Default values used for initial application state
 */
export const DEFAULT_VALUES = {
  /** Default filter value when application first loads */
  DEFAULT_FILTER: FILTERS.ALL,
} as const;

/**
 * Keys used for localStorage persistence
 */
export const STORAGE_KEYS = {
  /** Namespace for all todo app storage keys to avoid conflicts with other applications */
  APP_NAMESPACE: 'todoApp',
  /** Key for storing todo items */
  TODOS: 'todoApp.todos',
  /** Key for storing the active filter */
  FILTER: 'todoApp.filter',
} as const;

/**
 * Text constants used in the UI
 */
export const UI_CONSTANTS = {
  /** Text displayed when a single todo item remains */
  ITEMS_LEFT_SINGULAR: 'item left',
  /** Text displayed when multiple todo items remain */
  ITEMS_LEFT_PLURAL: 'items left',
  /** Application title displayed in the header */
  APP_TITLE: 'todos',
  /** Placeholder text for the todo input field */
  TODO_PLACEHOLDER: 'What needs to be done?',
} as const;

/**
 * CSS class names used for styling elements
 */
export const CSS_CLASSES = {
  /** Class applied to the currently selected filter */
  SELECTED: 'selected',
  /** Class applied to completed todo items */
  COMPLETED: 'completed',
  /** Class applied to a todo item in edit mode */
  EDITING: 'editing',
} as const;

/**
 * Test IDs used for component testing
 * These IDs help select elements in tests without relying on implementation details
 */
export const TEST_IDS = {
  /** Test ID for todo item components */
  TODO_ITEM: 'todo-item',
  /** Test ID for the todo list component */
  TODO_LIST: 'todo-list',
  /** Test ID for the todo form component */
  TODO_FORM: 'todo-form',
  /** Test ID for the footer component */
  FOOTER: 'footer',
  /** Test ID for filter buttons */
  FILTER_BUTTON: 'filter-button',
} as const;

/**
 * Configuration values for localStorage operations
 */
export const STORAGE_CONFIG = {
  /** Milliseconds to delay between persistence operations to reduce performance impact */
  THROTTLE_MS: 300,
} as const;

/**
 * Keyboard key constants for handling keyboard events
 */
export const KEYBOARD_KEYS = {
  /** Enter key code */
  ENTER: 'Enter',
  /** Escape key code */
  ESCAPE: 'Escape',
} as const;