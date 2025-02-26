/**
 * Test suite for the todos Redux slice
 * Verifies correctness of reducers, actions, selectors, and integration with validation
 */

import { configureStore } from '@reduxjs/toolkit'; // v1.9.3
import todosReducer, {
  todosSlice,
  addTodo,
  toggleTodo,
  editTodo,
  deleteTodo,
  selectAllTodos,
  selectFilteredTodos,
  selectActiveTodoCount,
  selectCompletedTodoCount
} from './todosSlice';
import { RootState, Todo, FilterStatus } from '../../types';
import { VALIDATION_ERRORS, MAX_TODO_LENGTH } from '../../configs/validation.config';

// Mock localStorage to prevent actual storage operations during tests
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true
});

// Mock the selectCurrentFilter selector from filters slice
jest.mock('../filters/filtersSlice', () => ({
  selectCurrentFilter: (state: any) => state.filters.status
}));

/**
 * Helper function to create a Redux store for testing
 * 
 * @param initialState - Optional initial state for the store
 * @returns A configured Redux store instance
 */
const createTestStore = (initialState?: Partial<RootState>) => {
  return configureStore({
    reducer: {
      todos: todosReducer,
      filters: (state = { status: FilterStatus.All }, action) => state
    },
    preloadedState: initialState as any
  });
};

describe('todosSlice', () => {
  // Clear mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test for initial state
  test('should handle initial state', () => {
    expect(todosReducer(undefined, { type: 'unknown' })).toEqual({
      entities: []
    });
  });

  // Test for addTodo action
  test('should handle addTodo', () => {
    const initialState = { entities: [] };
    const todoText = 'Test todo';
    
    // Using the reducer directly
    const action = addTodo(todoText);
    const nextState = todosReducer(initialState, action);
    
    expect(nextState.entities.length).toBe(1);
    expect(nextState.entities[0].text).toBe(todoText);
    expect(nextState.entities[0].completed).toBe(false);
    expect(nextState.entities[0].id).toBeDefined();
  });

  // Test for toggleTodo action
  test('should handle toggleTodo', () => {
    const todoId = '1';
    const initialState = {
      entities: [{ id: todoId, text: 'Test todo', completed: false }]
    };
    
    // First toggle - false to true
    let action = toggleTodo(todoId);
    let nextState = todosReducer(initialState, action);
    
    expect(nextState.entities[0].completed).toBe(true);
    
    // Second toggle - true to false
    action = toggleTodo(todoId);
    nextState = todosReducer(nextState, action);
    
    expect(nextState.entities[0].completed).toBe(false);
  });

  // Test toggleTodo with non-existent ID
  test('should handle toggleTodo with non-existent ID', () => {
    const initialState = {
      entities: [{ id: '1', text: 'Test todo', completed: false }]
    };
    
    const action = toggleTodo('non-existent-id');
    const nextState = todosReducer(initialState, action);
    
    // State should remain unchanged
    expect(nextState).toEqual(initialState);
  });

  // Test for editTodo action
  test('should handle editTodo', () => {
    const todoId = '1';
    const initialState = {
      entities: [{ id: todoId, text: 'Original text', completed: false }]
    };
    
    const newText = 'Updated text';
    const action = editTodo(todoId, newText);
    const nextState = todosReducer(initialState, action);
    
    expect(nextState.entities[0].text).toBe(newText);
    expect(nextState.entities[0].id).toBe(todoId);
    expect(nextState.entities[0].completed).toBe(false);
  });

  // Test editTodo with non-existent ID
  test('should handle editTodo with non-existent ID', () => {
    const initialState = {
      entities: [{ id: '1', text: 'Original text', completed: false }]
    };
    
    const action = editTodo('non-existent-id', 'New text');
    const nextState = todosReducer(initialState, action);
    
    // State should remain unchanged
    expect(nextState).toEqual(initialState);
  });

  // Test for deleteTodo action
  test('should handle deleteTodo', () => {
    const todoId = '1';
    const initialState = {
      entities: [
        { id: todoId, text: 'Todo to delete', completed: false },
        { id: '2', text: 'Another todo', completed: true }
      ]
    };
    
    const action = deleteTodo(todoId);
    const nextState = todosReducer(initialState, action);
    
    expect(nextState.entities.length).toBe(1);
    expect(nextState.entities[0].id).toBe('2');
  });

  // Test deleteTodo with non-existent ID
  test('should handle deleteTodo with non-existent ID', () => {
    const initialState = {
      entities: [
        { id: '1', text: 'Todo item', completed: false },
        { id: '2', text: 'Another todo', completed: true }
      ]
    };
    
    const action = deleteTodo('non-existent-id');
    const nextState = todosReducer(initialState, action);
    
    // All todos should still be present
    expect(nextState.entities.length).toBe(2);
  });

  // Test for selectAllTodos selector
  test('selectAllTodos should return all todos', () => {
    const todos = [
      { id: '1', text: 'First todo', completed: false },
      { id: '2', text: 'Second todo', completed: true }
    ];
    
    const state = { todos: { entities: todos }, filters: { status: FilterStatus.All } } as RootState;
    
    expect(selectAllTodos(state)).toEqual(todos);
  });

  // Test for selectFilteredTodos selector with different filters
  test('selectFilteredTodos should return todos based on filter', () => {
    const todos = [
      { id: '1', text: 'Active todo', completed: false },
      { id: '2', text: 'Completed todo', completed: true }
    ];
    
    // Test with 'all' filter
    const stateWithAllFilter = {
      todos: { entities: todos },
      filters: { status: FilterStatus.All }
    } as RootState;
    
    expect(selectFilteredTodos(stateWithAllFilter)).toEqual(todos);
    
    // Test with 'active' filter
    const stateWithActiveFilter = {
      todos: { entities: todos },
      filters: { status: FilterStatus.Active }
    } as RootState;
    
    expect(selectFilteredTodos(stateWithActiveFilter)).toEqual([todos[0]]);
    
    // Test with 'completed' filter
    const stateWithCompletedFilter = {
      todos: { entities: todos },
      filters: { status: FilterStatus.Completed }
    } as RootState;
    
    expect(selectFilteredTodos(stateWithCompletedFilter)).toEqual([todos[1]]);
  });

  // Test for selectActiveTodoCount selector
  test('selectActiveTodoCount should return count of active todos', () => {
    const todos = [
      { id: '1', text: 'Active todo 1', completed: false },
      { id: '2', text: 'Completed todo', completed: true },
      { id: '3', text: 'Active todo 2', completed: false }
    ];
    
    const state = { todos: { entities: todos }, filters: { status: FilterStatus.All } } as RootState;
    
    expect(selectActiveTodoCount(state)).toBe(2);
  });

  // Test for selectCompletedTodoCount selector
  test('selectCompletedTodoCount should return count of completed todos', () => {
    const todos = [
      { id: '1', text: 'Active todo 1', completed: false },
      { id: '2', text: 'Completed todo 1', completed: true },
      { id: '3', text: 'Active todo 2', completed: false },
      { id: '4', text: 'Completed todo 2', completed: true }
    ];
    
    const state = { todos: { entities: todos }, filters: { status: FilterStatus.All } } as RootState;
    
    expect(selectCompletedTodoCount(state)).toBe(2);
  });

  // Test with empty todos array
  test('selectors should handle empty todos array', () => {
    const state = { todos: { entities: [] }, filters: { status: FilterStatus.All } } as RootState;
    
    expect(selectAllTodos(state)).toEqual([]);
    expect(selectFilteredTodos(state)).toEqual([]);
    expect(selectActiveTodoCount(state)).toBe(0);
    expect(selectCompletedTodoCount(state)).toBe(0);
  });
});

// Integration tests for validation
describe('Integration Tests', () => {
  // Test validation when adding todos
  test('should validate todo text when adding', () => {
    // Test empty text
    expect(() => {
      addTodo('');
    }).toThrow(VALIDATION_ERRORS.EMPTY_TODO);
    
    // Test whitespace-only text
    expect(() => {
      addTodo('   ');
    }).toThrow(VALIDATION_ERRORS.WHITESPACE_ONLY);
    
    // Test text exceeding maximum length
    const longText = 'a'.repeat(MAX_TODO_LENGTH + 1);
    expect(() => {
      addTodo(longText);
    }).toThrow(VALIDATION_ERRORS.MAX_LENGTH_EXCEEDED);
    
    // Test valid text
    const validText = 'Valid todo';
    const action = addTodo(validText);
    expect(action.payload.text).toBe(validText);
  });

  // Test validation when editing todos
  test('should validate todo text when editing', () => {
    const todoId = '1';
    
    // Test empty text
    expect(() => {
      editTodo(todoId, '');
    }).toThrow(VALIDATION_ERRORS.EMPTY_TODO);
    
    // Test whitespace-only text
    expect(() => {
      editTodo(todoId, '   ');
    }).toThrow(VALIDATION_ERRORS.WHITESPACE_ONLY);
    
    // Test text exceeding maximum length
    const longText = 'a'.repeat(MAX_TODO_LENGTH + 1);
    expect(() => {
      editTodo(todoId, longText);
    }).toThrow(VALIDATION_ERRORS.MAX_LENGTH_EXCEEDED);
    
    // Test valid text
    const validText = 'Valid edited todo';
    const action = editTodo(todoId, validText);
    expect(action.payload.text).toBe(validText);
    expect(action.payload.id).toBe(todoId);
  });

  // Test trim functionality when adding and editing todos
  test('should trim whitespace from todo text', () => {
    // Adding a todo with leading/trailing whitespace
    const action1 = addTodo('  Trim this text  ');
    expect(action1.payload.text).toBe('Trim this text');
    
    // Editing a todo with leading/trailing whitespace
    const action2 = editTodo('1', '  Updated with spaces  ');
    expect(action2.payload.text).toBe('Updated with spaces');
  });

  // Test full store integration
  test('should interact with Redux store correctly', () => {
    const store = createTestStore();
    
    // Add a todo
    store.dispatch(addTodo('Test todo'));
    let state = store.getState();
    expect(state.todos.entities.length).toBe(1);
    expect(state.todos.entities[0].text).toBe('Test todo');
    
    // Get the ID of the added todo
    const todoId = state.todos.entities[0].id;
    
    // Toggle the todo
    store.dispatch(toggleTodo(todoId));
    state = store.getState();
    expect(state.todos.entities[0].completed).toBe(true);
    
    // Edit the todo
    store.dispatch(editTodo(todoId, 'Updated todo'));
    state = store.getState();
    expect(state.todos.entities[0].text).toBe('Updated todo');
    
    // Delete the todo
    store.dispatch(deleteTodo(todoId));
    state = store.getState();
    expect(state.todos.entities.length).toBe(0);
  });

  // Test with multiple todos to verify correct filtering
  test('should correctly filter todos in the store', () => {
    // Create store with initial todos
    const store = createTestStore({
      todos: {
        entities: [
          { id: '1', text: 'Active todo', completed: false },
          { id: '2', text: 'Completed todo', completed: true }
        ]
      },
      filters: { status: FilterStatus.All }
    });
    
    // Test with different filter states
    let state = store.getState();
    
    // All filter (default)
    expect(selectFilteredTodos(state).length).toBe(2);
    
    // Active filter
    store.dispatch({ type: 'filters/setFilter', payload: FilterStatus.Active });
    state = store.getState();
    expect(selectFilteredTodos(state).length).toBe(1);
    expect(selectFilteredTodos(state)[0].completed).toBe(false);
    
    // Completed filter
    store.dispatch({ type: 'filters/setFilter', payload: FilterStatus.Completed });
    state = store.getState();
    expect(selectFilteredTodos(state).length).toBe(1);
    expect(selectFilteredTodos(state)[0].completed).toBe(true);
  });
});