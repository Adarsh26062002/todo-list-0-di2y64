import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import App from './App';
import { store } from './app/store';
import { TEST_IDS } from './configs/constants';
import { addTodo } from './features/todos/todosSlice';
import { setFilter } from './features/filters/filtersSlice';
import { loadTodos, loadFilter } from './utils/localStorage';

// Mock localStorage functions
jest.mock('./utils/localStorage', () => ({
  loadTodos: jest.fn(),
  loadFilter: jest.fn(),
  saveState: jest.fn(),
  saveTodos: jest.fn(),
  saveFilter: jest.fn(),
  isStorageAvailable: jest.fn().mockReturnValue(true),
}));

// Helper function to render with Redux
const renderWithRedux = (ui, options = {}) => {
  const { store: testStore = store, ...renderOptions } = options;
  
  return {
    ...render(
      <Provider store={testStore}>
        {ui}
      </Provider>,
      renderOptions
    ),
    store: testStore,
  };
};

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    
    // Default mock implementations
    loadTodos.mockReturnValue(undefined);
    loadFilter.mockReturnValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders app container with correct structure', () => {
    render(<App />);
    
    const appContainer = screen.getByTestId(TEST_IDS.APP_CONTAINER);
    expect(appContainer).toBeInTheDocument();
    expect(appContainer).toHaveClass('todoapp');
  });

  it('renders the application title correctly', () => {
    render(<App />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toHaveTextContent('todos');
  });

  it('renders TodoForm component', () => {
    render(<App />);
    
    const todoForm = screen.getByTestId(TEST_IDS.TODO_FORM);
    expect(todoForm).toBeInTheDocument();
  });

  it('renders TodoList component', () => {
    render(<App />);
    
    const todoList = screen.getByTestId(TEST_IDS.TODO_LIST);
    expect(todoList).toBeInTheDocument();
  });

  it('renders Footer component when todos exist', () => {
    // Mock localStorage to return todos
    const mockTodos = {
      entities: [{ id: '1', text: 'Test Todo', completed: false }]
    };
    loadTodos.mockReturnValue(mockTodos);
    
    render(<App />);
    
    const footer = screen.getByTestId(TEST_IDS.FOOTER);
    expect(footer).toBeInTheDocument();
  });

  it('does not render Footer component when no todos exist', () => {
    // Ensure localStorage returns empty todos
    loadTodos.mockReturnValue({ entities: [] });
    
    render(<App />);
    
    const footer = screen.queryByTestId(TEST_IDS.FOOTER);
    expect(footer).not.toBeInTheDocument();
  });

  it('loads todos from localStorage on initialization', async () => {
    // Mock localStorage return value
    const mockTodos = {
      entities: [
        { id: '1', text: 'Todo from localStorage', completed: false }
      ]
    };
    
    loadTodos.mockReturnValue(mockTodos);
    
    render(<App />);
    
    // Check that loadTodos was called
    expect(loadTodos).toHaveBeenCalled();
    
    // Check that the todo from localStorage is displayed
    await waitFor(() => {
      expect(screen.getByText('Todo from localStorage')).toBeInTheDocument();
    });
  });

  it('loads filter preference from localStorage on initialization', () => {
    // Mock localStorage return value for filter
    const mockFilter = {
      status: 'completed'
    };
    
    loadFilter.mockReturnValue(mockFilter);
    
    render(<App />);
    
    // Check that loadFilter was called
    expect(loadFilter).toHaveBeenCalled();
    
    // The actual filter state would be verified in an integration test
    // since it requires checking the Redux store state
  });

  it('properly handles localStorage failure', () => {
    // Mock localStorage to throw errors
    loadTodos.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    loadFilter.mockImplementation(() => {
      throw new Error('Storage error');
    });
    
    // Should not throw and should render normally
    expect(() => render(<App />)).not.toThrow();
    
    // App should still render with default state
    const appContainer = screen.getByTestId(TEST_IDS.APP_CONTAINER);
    expect(appContainer).toBeInTheDocument();
  });

  it('integrates ErrorBoundary for error handling', () => {
    // Mock console.error to prevent test output noise
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Create a component that will throw an error
    const ErrorComponent = () => {
      throw new Error('Test error');
    };
    
    // Mock one of App's children to be our error component
    jest.mock('./components/TodoForm/TodoForm', () => ErrorComponent);
    
    // Render should not throw despite child component error
    expect(() => render(<App />)).not.toThrow();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
});