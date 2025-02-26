import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import TodoForm from './TodoForm';
import { addTodo } from '../../features/todos/todosSlice';
import useValidation from '../../hooks/useValidation';
import { TEST_IDS, UI_CONSTANTS, KEYBOARD_KEYS } from '../../configs/constants';
import { VALIDATION_ERRORS } from '../../configs/validation.config';

// Mock dependencies
jest.mock('../../hooks/useValidation');
jest.mock('../../features/todos/todosSlice');

// Helper function to render component with Redux
const renderWithRedux = (ui, preloadedState = {}) => {
  const store = configureStore({
    reducer: {
      todos: (state = { entities: [] }) => state,
      filters: (state = { status: 'all' }) => state
    },
    preloadedState
  });
  
  return {
    ...render(<Provider store={store}>{ui}</Provider>),
    store
  };
};

describe('TodoForm Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup default useValidation mock
    (useValidation as jest.Mock).mockImplementation(() => ({
      value: '',
      setValue: jest.fn(),
      error: undefined,
      isValid: true,
      validate: jest.fn().mockReturnValue(true),
      resetValidation: jest.fn()
    }));
    
    // Setup default addTodo mock
    (addTodo as jest.Mock).mockImplementation((text) => ({
      type: 'todos/addTodo',
      payload: { id: 'mock-id', text, completed: false }
    }));
  });
  
  test('renders the form correctly', () => {
    renderWithRedux(<TodoForm />);
    
    // Verify form renders with correct attributes
    const formElement = screen.getByTestId(TEST_IDS.TODO_FORM);
    expect(formElement).toBeInTheDocument();
    expect(formElement).toHaveClass('todo-form');
    
    // Verify input renders with correct attributes
    const inputElement = screen.getByPlaceholderText(UI_CONSTANTS.TODO_PLACEHOLDER);
    expect(inputElement).toBeInTheDocument();
    expect(inputElement).toHaveClass('new-todo');
    expect(inputElement).toHaveAttribute('aria-label', 'New todo input');
    
    // Verify no error message is displayed initially
    expect(screen.queryByText(VALIDATION_ERRORS.EMPTY_TODO)).not.toBeInTheDocument();
  });
  
  test('handles input changes correctly', () => {
    // Setup mock for setValue function
    const mockSetValue = jest.fn();
    (useValidation as jest.Mock).mockImplementation(() => ({
      value: '',
      setValue: mockSetValue,
      error: undefined,
      isValid: true,
      validate: jest.fn().mockReturnValue(true),
      resetValidation: jest.fn()
    }));
    
    renderWithRedux(<TodoForm />);
    
    // Simulate user typing in the input
    const inputElement = screen.getByPlaceholderText(UI_CONSTANTS.TODO_PLACEHOLDER);
    fireEvent.change(inputElement, { target: { value: 'New todo' } });
    
    // Verify setValue was called with the new value
    expect(mockSetValue).toHaveBeenCalledWith('New todo');
  });
  
  test('displays validation error when input is invalid', () => {
    // Setup mock with validation error
    const errorMessage = VALIDATION_ERRORS.EMPTY_TODO;
    (useValidation as jest.Mock).mockImplementation(() => ({
      value: '',
      setValue: jest.fn(),
      error: errorMessage,
      isValid: false,
      validate: jest.fn().mockReturnValue(false),
      resetValidation: jest.fn()
    }));
    
    renderWithRedux(<TodoForm />);
    
    // Verify error message is displayed
    const errorElement = screen.getByText(errorMessage);
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass('validation-error');
    expect(errorElement).toHaveAttribute('aria-live', 'polite');
    
    // Verify input has error class and accessibility attributes
    const inputElement = screen.getByPlaceholderText(UI_CONSTANTS.TODO_PLACEHOLDER);
    expect(inputElement).toHaveClass('error');
    expect(inputElement).toHaveAttribute('aria-invalid', 'true');
    expect(inputElement).toHaveAttribute('aria-describedby', 'validation-error');
  });
  
  test('validates on submit', () => {
    // Setup mock with validation that fails
    const mockValidate = jest.fn().mockReturnValue(false);
    (useValidation as jest.Mock).mockImplementation(() => ({
      value: '',
      setValue: jest.fn(),
      error: VALIDATION_ERRORS.EMPTY_TODO,
      isValid: false,
      validate: mockValidate,
      resetValidation: jest.fn()
    }));
    
    renderWithRedux(<TodoForm />);
    
    // Submit the form
    const formElement = screen.getByTestId(TEST_IDS.TODO_FORM);
    fireEvent.submit(formElement);
    
    // Verify validation function was called
    expect(mockValidate).toHaveBeenCalled();
    
    // Verify addTodo was not called since validation failed
    expect(addTodo).not.toHaveBeenCalled();
  });
  
  test('dispatches addTodo on valid submission', () => {
    // Setup mocks for successful validation and form submission
    const mockSetValue = jest.fn();
    const mockResetValidation = jest.fn();
    const mockValidate = jest.fn().mockReturnValue(true);
    const todoText = 'New todo item';
    
    (useValidation as jest.Mock).mockImplementation(() => ({
      value: todoText,
      setValue: mockSetValue,
      error: undefined,
      isValid: true,
      validate: mockValidate,
      resetValidation: mockResetValidation
    }));
    
    renderWithRedux(<TodoForm />);
    
    // Submit the form
    const formElement = screen.getByTestId(TEST_IDS.TODO_FORM);
    fireEvent.submit(formElement);
    
    // Verify validation was called
    expect(mockValidate).toHaveBeenCalled();
    
    // Verify addTodo was called with the correct text
    expect(addTodo).toHaveBeenCalledWith(todoText);
    
    // Verify form was reset after successful submission
    expect(mockSetValue).toHaveBeenCalledWith('');
    expect(mockResetValidation).toHaveBeenCalled();
  });
  
  test('handles error during addTodo dispatch', () => {
    // Mock console.error to prevent actual console output in tests
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // Setup addTodo to throw an error
    (addTodo as jest.Mock).mockImplementation(() => {
      throw new Error('Test error');
    });
    
    // Setup validation mocks
    const mockSetValue = jest.fn();
    const mockResetValidation = jest.fn();
    (useValidation as jest.Mock).mockImplementation(() => ({
      value: 'New todo',
      setValue: mockSetValue,
      error: undefined,
      isValid: true,
      validate: jest.fn().mockReturnValue(true),
      resetValidation: mockResetValidation
    }));
    
    renderWithRedux(<TodoForm />);
    
    // Submit the form
    const formElement = screen.getByTestId(TEST_IDS.TODO_FORM);
    fireEvent.submit(formElement);
    
    // Verify error was logged
    expect(console.error).toHaveBeenCalled();
    
    // Verify form was not reset since submission failed
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(mockResetValidation).not.toHaveBeenCalled();
    
    // Restore console.error
    console.error = originalConsoleError;
  });
  
  test('handles keyboard events correctly', () => {
    // Setup mocks
    const mockSetValue = jest.fn();
    const mockResetValidation = jest.fn();
    
    (useValidation as jest.Mock).mockImplementation(() => ({
      value: 'Test todo',
      setValue: mockSetValue,
      error: undefined,
      isValid: true,
      validate: jest.fn().mockReturnValue(true),
      resetValidation: mockResetValidation
    }));
    
    renderWithRedux(<TodoForm />);
    
    const inputElement = screen.getByPlaceholderText(UI_CONSTANTS.TODO_PLACEHOLDER);
    
    // Test Escape key clears the input
    fireEvent.keyDown(inputElement, { key: KEYBOARD_KEYS.ESCAPE });
    expect(mockSetValue).toHaveBeenCalledWith('');
    expect(mockResetValidation).toHaveBeenCalled();
    
    // Reset mocks
    jest.clearAllMocks();
    
    // Test other keys don't trigger clear functionality
    fireEvent.keyDown(inputElement, { key: 'a' });
    expect(mockSetValue).not.toHaveBeenCalled();
    expect(mockResetValidation).not.toHaveBeenCalled();
  });
  
  test('focuses input on mount', () => {
    // Mock the focus method
    const focusMock = jest.fn();
    
    // Save original implementation
    const originalFocus = HTMLElement.prototype.focus;
    
    // Replace with mock
    HTMLElement.prototype.focus = focusMock;
    
    try {
      renderWithRedux(<TodoForm />);
      
      // Verify focus was called
      expect(focusMock).toHaveBeenCalled();
    } finally {
      // Restore original implementation to avoid affecting other tests
      HTMLElement.prototype.focus = originalFocus;
    }
  });
  
  test('handles whitespace-only input validation', () => {
    // Setup validation with whitespace error
    const mockValidate = jest.fn().mockReturnValue(false);
    (useValidation as jest.Mock).mockImplementation(() => ({
      value: '   ',
      setValue: jest.fn(),
      error: VALIDATION_ERRORS.WHITESPACE_ONLY,
      isValid: false,
      validate: mockValidate,
      resetValidation: jest.fn()
    }));
    
    renderWithRedux(<TodoForm />);
    
    // Submit form
    const formElement = screen.getByTestId(TEST_IDS.TODO_FORM);
    fireEvent.submit(formElement);
    
    // Verify validation was called
    expect(mockValidate).toHaveBeenCalled();
    
    // Verify error is displayed
    const errorElement = screen.getByText(VALIDATION_ERRORS.WHITESPACE_ONLY);
    expect(errorElement).toBeInTheDocument();
  });
  
  test('handles todo text that exceeds maximum length', () => {
    // Setup validation with length error
    const mockValidate = jest.fn().mockReturnValue(false);
    (useValidation as jest.Mock).mockImplementation(() => ({
      value: 'A'.repeat(250), // Longer than MAX_TODO_LENGTH
      setValue: jest.fn(),
      error: VALIDATION_ERRORS.MAX_LENGTH_EXCEEDED,
      isValid: false,
      validate: mockValidate,
      resetValidation: jest.fn()
    }));
    
    renderWithRedux(<TodoForm />);
    
    // Submit form
    const formElement = screen.getByTestId(TEST_IDS.TODO_FORM);
    fireEvent.submit(formElement);
    
    // Verify validation was called
    expect(mockValidate).toHaveBeenCalled();
    
    // Verify error is displayed
    const errorElement = screen.getByText(VALIDATION_ERRORS.MAX_LENGTH_EXCEEDED);
    expect(errorElement).toBeInTheDocument();
  });
});