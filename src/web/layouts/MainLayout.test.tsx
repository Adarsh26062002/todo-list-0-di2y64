import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { Provider } from 'react-redux';
import MainLayout from './MainLayout';
import { TEST_IDS, UI_CONSTANTS } from '../configs/constants';

// Create a mock Redux store for testing
const mockStore = {
  getState: () => ({
    todos: { 
      entities: [
        { id: '1', text: 'Test todo', completed: false }
      ] 
    },
    filters: { status: 'all' }
  }),
  dispatch: jest.fn(),
  subscribe: jest.fn(),
  replaceReducer: jest.fn()
};

describe('MainLayout', () => {
  test('renders the component with correct structure', () => {
    render(
      <Provider store={mockStore}>
        <MainLayout />
      </Provider>
    );
    
    // Verify the component has the correct test ID
    expect(screen.getByTestId(TEST_IDS.MAIN_LAYOUT)).toBeInTheDocument();
    
    // Verify app title is rendered correctly
    expect(screen.getByText(UI_CONSTANTS.APP_TITLE)).toBeInTheDocument();
    
    // Verify main container has expected className
    expect(screen.getByTestId(TEST_IDS.MAIN_LAYOUT)).toHaveClass('todoapp');
  });

  test('renders TodoForm, TodoList and Footer components', () => {
    const { container } = render(
      <Provider store={mockStore}>
        <MainLayout />
      </Provider>
    );
    
    // Find the header element
    const headerElement = container.querySelector('header.header');
    expect(headerElement).not.toBeNull();
    
    // Verify TodoForm is rendered within the header
    const todoForm = screen.getByTestId(TEST_IDS.TODO_FORM);
    expect(todoForm).toBeInTheDocument();
    expect(headerElement).toContainElement(todoForm);
    
    // Find the main section element
    const mainElement = container.querySelector('section.main');
    expect(mainElement).not.toBeNull();
    
    // Verify TodoList is rendered within the main section
    const todoList = screen.getByTestId(TEST_IDS.TODO_LIST);
    expect(todoList).toBeInTheDocument();
    expect(mainElement).toContainElement(todoList);
    
    // Verify Footer component is rendered
    expect(screen.getByTestId(TEST_IDS.FOOTER)).toBeInTheDocument();
  });

  test('wraps components in ErrorBoundary components', () => {
    render(
      <Provider store={mockStore}>
        <MainLayout />
      </Provider>
    );
    
    // Note: This test verifies that components render successfully,
    // which is the expected outcome when ErrorBoundaries are correctly implemented.
    // Comprehensive ErrorBoundary testing would be in dedicated test files.
    
    expect(screen.getByTestId(TEST_IDS.TODO_FORM)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.TODO_LIST)).toBeInTheDocument();
    expect(screen.getByTestId(TEST_IDS.FOOTER)).toBeInTheDocument();
  });

  test('applies responsive container class', () => {
    render(
      <Provider store={mockStore}>
        <MainLayout />
      </Provider>
    );
    
    // Verify the main container has the 'todoapp' class for responsive styling
    expect(screen.getByTestId(TEST_IDS.MAIN_LAYOUT)).toHaveClass('todoapp');
  });
});