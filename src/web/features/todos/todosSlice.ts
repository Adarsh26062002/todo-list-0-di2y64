/**
 * Redux Toolkit slice for managing todo items in the Todo List application.
 * Provides actions for creating, updating, toggling, and deleting todos,
 * as well as selectors for retrieving todos filtered by completion status.
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit'; // v1.9.3
import { nanoid } from 'nanoid'; // v4.0.0
import { Todo, TodosState, RootState, FilterStatus } from '../../types';
import { loadTodos } from '../../utils/localStorage';
import { selectCurrentFilter } from '../filters/filtersSlice';
import { validateTodoText } from '../../utils/validation';

/**
 * Initial state for the todos slice.
 * Attempts to load todos from localStorage, or initializes with an empty array if none exist.
 */
const initialState: TodosState = loadTodos() || {
  entities: []
};

/**
 * Redux Toolkit slice for managing todo items.
 * Provides reducers for adding, toggling, editing, and deleting todos.
 */
export const todosSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    /**
     * Adds a new todo with the provided text.
     * Generates a unique ID and sets completed status to false.
     * 
     * @param state - Current todos state
     * @param action - Action containing the todo text
     */
    addTodo: {
      reducer: (state, action: PayloadAction<Todo>) => {
        state.entities.push(action.payload);
      },
      prepare: (text: string) => {
        // Validate the text using the validation utility
        const validationResult = validateTodoText(text);
        if (!validationResult.isValid) {
          throw new Error(validationResult.errorMessage || 'Invalid todo text');
        }
        
        return {
          payload: {
            id: nanoid(),
            text: text.trim(),
            completed: false
          }
        };
      }
    },
    
    /**
     * Toggles the completed status of a todo.
     * 
     * @param state - Current todos state
     * @param action - Action containing the todo ID to toggle
     */
    toggleTodo: (state, action: PayloadAction<string>) => {
      const todo = state.entities.find(todo => todo.id === action.payload);
      if (todo) {
        todo.completed = !todo.completed;
      }
    },
    
    /**
     * Edits the text of an existing todo.
     * 
     * @param state - Current todos state
     * @param action - Action containing the todo ID and new text
     */
    editTodo: {
      reducer: (state, action: PayloadAction<{ id: string; text: string }>) => {
        const { id, text } = action.payload;
        const todo = state.entities.find(todo => todo.id === id);
        if (todo) {
          todo.text = text;
        }
      },
      prepare: (id: string, text: string) => {
        // Validate the text using the validation utility
        const validationResult = validateTodoText(text);
        if (!validationResult.isValid) {
          throw new Error(validationResult.errorMessage || 'Invalid todo text');
        }
        
        return {
          payload: {
            id,
            text: text.trim()
          }
        };
      }
    },
    
    /**
     * Deletes a todo by ID.
     * 
     * @param state - Current todos state
     * @param action - Action containing the todo ID to delete
     */
    deleteTodo: (state, action: PayloadAction<string>) => {
      state.entities = state.entities.filter(todo => todo.id !== action.payload);
    }
  }
});

// Extract and export action creators
export const { addTodo, toggleTodo, editTodo, deleteTodo } = todosSlice.actions;

/**
 * Selector that retrieves all todos from the Redux state.
 * 
 * @param state - The root Redux state
 * @returns Array of all todo items
 */
export const selectAllTodos = (state: RootState): Todo[] => state.todos.entities;

/**
 * Memoized selector that returns todos filtered by the current filter status.
 * Uses createSelector for performance optimization through memoization.
 * 
 * @param state - The root Redux state
 * @returns Array of filtered todo items based on the current filter
 */
export const selectFilteredTodos = createSelector(
  [selectAllTodos, selectCurrentFilter],
  (todos, filter) => {
    switch (filter) {
      case FilterStatus.Active:
        return todos.filter(todo => !todo.completed);
      case FilterStatus.Completed:
        return todos.filter(todo => todo.completed);
      case FilterStatus.All:
      default:
        return todos;
    }
  }
);

/**
 * Selector that counts active (uncompleted) todos.
 * Uses createSelector for performance optimization through memoization.
 * 
 * @param state - The root Redux state
 * @returns Count of incomplete todos
 */
export const selectActiveTodoCount = createSelector(
  [selectAllTodos],
  (todos) => todos.filter(todo => !todo.completed).length
);

/**
 * Selector that counts completed todos.
 * Uses createSelector for performance optimization through memoization.
 * 
 * @param state - The root Redux state
 * @returns Count of completed todos
 */
export const selectCompletedTodoCount = createSelector(
  [selectAllTodos],
  (todos) => todos.filter(todo => todo.completed).length
);

// Export the slice and reducer
export { todosSlice };
export default todosSlice.reducer;