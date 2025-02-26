import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store'; // ^1.5.4
import TodoList from './TodoList';
import TodoItem from '../TodoItem/TodoItem';
import { Todo, FilterStatus } from '../../types';
import { TEST_IDS } from '../../configs/constants';
import { selectFilteredTodos } from '../../features/todos/todosSlice';

// Mock dependencies
jest.mock('../../app/hooks', () => ({
  useAppSelector: jest.fn()
}));

// Mock the TodoItem component to simplify testing
jest.mock('../TodoItem/TodoItem', () => {
  return function MockTodoItem({ todo }) {
    return <li data-testid={TEST_IDS.TODO_ITEM} data-todo-id={todo.id}>{todo.text}</li>;
  };
});

// Mock the transition group components for animation testing
jest.mock('react-transition-group', () => ({
  TransitionGroup: ({ children }) => <div data-testid="transition-group">{children}</div>,
  CSSTransition: ({ children, timeout, classNames }) => (
    <div data-testid="css-transition" data-timeout={timeout} data-classnames={classNames}>
      {children}
    </div>
  )
}));

// Import mocked dependencies
import { useAppSelector } from '../../app/hooks';

// Test data
const todoItems: Todo[] = [
  { id: '1', text: 'Test todo 1', completed: false },
  { id: '2', text: 'Test todo 2', completed: true },
  { id: '3', text: 'Test todo 3', completed: false }
];

/**
 * Helper function to render a component with Redux store provider for testing
 * @param ui The React element to render
 * @param preloadedState Optional state to preload into the store
 * @param options Additional render options
 * @returns React Testing Library render result plus store
 */
const renderWithRedux = (
  ui: React.ReactElement,
  { filteredTodos = [] } = {}
) => {
  // Mock the useAppSelector hook to return the provided filtered todos
  (useAppSelector as jest.Mock).mockReturnValue(filteredTodos);
  
  return {
    ...render(ui),
    rerender: (newUI: React.ReactElement, newTodos = filteredTodos) => {
      (useAppSelector as jest.Mock).mockReturnValue(newTodos);
      return render(newUI);
    }
  };
};

describe('TodoList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders empty state when there are no todos', () => {
    // Mock the selector to return an empty array
    renderWithRedux(<TodoList />, { filteredTodos: [] });
    
    // Assert empty state message is displayed
    expect(screen.getByText(/No todos to display/i)).toBeInTheDocument();
    
    // Assert no todo list is rendered
    expect(screen.queryByTestId(TEST_IDS.TODO_LIST)).not.toBeInTheDocument();
  });

  test('renders todo items for each todo in the filtered list', () => {
    // Mock the selector to return all test todos
    renderWithRedux(<TodoList />, { filteredTodos: todoItems });
    
    // Assert todo list is rendered
    expect(screen.getByTestId(TEST_IDS.TODO_LIST)).toBeInTheDocument();
    
    // Assert correct number of todo items are rendered
    expect(screen.getAllByTestId(TEST_IDS.TODO_ITEM)).toHaveLength(todoItems.length);
    
    // Assert each todo text is displayed
    todoItems.forEach(todo => {
      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });
  });

  test('applies filter correctly to show only active todos', () => {
    // Get active todos (not completed)
    const activeTodos = todoItems.filter(todo => !todo.completed);
    renderWithRedux(<TodoList />, { filteredTodos: activeTodos });
    
    // Assert correct number of todo items are rendered
    expect(screen.getAllByTestId(TEST_IDS.TODO_ITEM)).toHaveLength(activeTodos.length);
    
    // Assert active todos are displayed
    expect(screen.getByText('Test todo 1')).toBeInTheDocument();
    expect(screen.getByText('Test todo 3')).toBeInTheDocument();
    
    // Assert completed todos are not displayed
    expect(screen.queryByText('Test todo 2')).not.toBeInTheDocument();
  });

  test('applies filter correctly to show only completed todos', () => {
    // Get completed todos
    const completedTodos = todoItems.filter(todo => todo.completed);
    renderWithRedux(<TodoList />, { filteredTodos: completedTodos });
    
    // Assert correct number of todo items are rendered
    expect(screen.getAllByTestId(TEST_IDS.TODO_ITEM)).toHaveLength(completedTodos.length);
    
    // Assert completed todos are displayed
    expect(screen.getByText('Test todo 2')).toBeInTheDocument();
    
    // Assert active todos are not displayed
    expect(screen.queryByText('Test todo 1')).not.toBeInTheDocument();
    expect(screen.queryByText('Test todo 3')).not.toBeInTheDocument();
  });

  test('renders todos with correct completion styling', () => {
    // Note: This is primarily testing the TodoItem component integration
    // The TodoList itself just passes the todo data to TodoItem components
    renderWithRedux(<TodoList />, { filteredTodos: todoItems });
    
    // Assert all todos are rendered
    expect(screen.getAllByTestId(TEST_IDS.TODO_ITEM)).toHaveLength(todoItems.length);
    
    // TodoList passes the todo objects to TodoItem which handles the styling
    todoItems.forEach(todo => {
      expect(screen.getByText(todo.text)).toBeInTheDocument();
    });
  });

  test('applies transition animations when rendering items', () => {
    renderWithRedux(<TodoList />, { filteredTodos: todoItems });
    
    // Assert TransitionGroup is used as a wrapper
    expect(screen.getByTestId('transition-group')).toBeInTheDocument();
    
    // Assert CSSTransition is applied to each todo item with correct props
    const transitions = screen.getAllByTestId('css-transition');
    expect(transitions).toHaveLength(todoItems.length);
    
    transitions.forEach(transition => {
      expect(transition).toHaveAttribute('data-timeout', '300');
      expect(transition).toHaveAttribute('data-classnames', 'todo-list');
    });
  });
});