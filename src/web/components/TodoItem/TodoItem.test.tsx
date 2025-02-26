import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import TodoItem from './TodoItem';
import { Todo } from '../../types';
import { TEST_IDS, CSS_CLASSES, KEYBOARD_KEYS } from '../../configs/constants';
import { toggleTodo, editTodo, deleteTodo } from '../../features/todos/todosSlice';
import { validateTodoText } from '../../utils/validation';

// Mock dependencies
jest.mock('../../app/hooks', () => ({
  useAppDispatch: jest.fn(),
}));

jest.mock('../../features/todos/todosSlice', () => ({
  toggleTodo: jest.fn(),
  editTodo: jest.fn(),
  deleteTodo: jest.fn(),
}));

jest.mock('../../utils/validation', () => ({
  validateTodoText: jest.fn(),
}));

// Import the mock to access it
import { useAppDispatch } from '../../app/hooks';

/**
 * Creates a mock for the useAppDispatch hook
 * @returns A mock dispatch function
 */
const mockAppDispatch = () => {
  const dispatchMock = jest.fn();
  (useAppDispatch as jest.Mock).mockReturnValue(dispatchMock);
  return dispatchMock;
};

/**
 * Helper function to render the TodoItem component with mocked Redux dependencies
 * @param todo The todo item to render
 * @returns Testing utilities and the mock dispatch function
 */
const renderWithRedux = (todo: Todo) => {
  const dispatchMock = mockAppDispatch();
  const utils = render(<TodoItem todo={todo} />);
  return {
    ...utils,
    dispatchMock,
  };
};

describe('TodoItem Component', () => {
  // Sample todos for testing
  const activeTodo: Todo = {
    id: '1',
    text: 'Test Todo',
    completed: false,
  };
  
  const completedTodo: Todo = {
    id: '2',
    text: 'Completed Todo',
    completed: true,
  };
  
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  test('renders a todo item correctly', () => {
    renderWithRedux(activeTodo);
    
    // Verify the todo text is displayed
    expect(screen.getByText('Test Todo')).toBeInTheDocument();
    
    // Verify the checkbox is not checked for active todo
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
    
    // Verify the todo item has the correct test ID
    expect(screen.getByTestId(TEST_IDS.TODO_ITEM)).toBeInTheDocument();
  });

  test('applies completed class when todo is completed', () => {
    renderWithRedux(completedTodo);
    
    // Verify completed class is applied
    const todoItem = screen.getByTestId(TEST_IDS.TODO_ITEM);
    expect(todoItem).toHaveClass(CSS_CLASSES.COMPLETED);
    
    // Verify the checkbox is checked
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  test('dispatches toggleTodo action when checkbox is clicked', () => {
    const { dispatchMock } = renderWithRedux(activeTodo);
    
    // Mock the toggleTodo action
    (toggleTodo as jest.Mock).mockReturnValue({ type: 'todos/toggleTodo', payload: activeTodo.id });
    
    // Find and click the checkbox
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    // Verify toggleTodo was dispatched with the correct ID
    expect(toggleTodo).toHaveBeenCalledWith(activeTodo.id);
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'todos/toggleTodo', payload: activeTodo.id });
  });

  test('dispatches deleteTodo action when delete button is clicked', () => {
    const { dispatchMock } = renderWithRedux(activeTodo);
    
    // Mock the deleteTodo action
    (deleteTodo as jest.Mock).mockReturnValue({ type: 'todos/deleteTodo', payload: activeTodo.id });
    
    // Find and click the delete button (using aria-label)
    const deleteButton = screen.getByLabelText(`Delete ${activeTodo.text}`);
    fireEvent.click(deleteButton);
    
    // Verify deleteTodo was dispatched with the correct ID
    expect(deleteTodo).toHaveBeenCalledWith(activeTodo.id);
    expect(dispatchMock).toHaveBeenCalledWith({ type: 'todos/deleteTodo', payload: activeTodo.id });
  });

  test('enters edit mode on double click', () => {
    renderWithRedux(activeTodo);
    
    // Double-click on the todo text
    const todoLabel = screen.getByLabelText(`${activeTodo.text}, double click to edit`);
    fireEvent.doubleClick(todoLabel);
    
    // Verify edit input appears with current todo text
    const editInput = screen.getByRole('textbox', { name: 'Edit todo text' });
    expect(editInput).toBeInTheDocument();
    expect(editInput).toHaveValue(activeTodo.text);
    
    // Verify editing class is applied
    const todoItem = screen.getByTestId(TEST_IDS.TODO_ITEM);
    expect(todoItem).toHaveClass(CSS_CLASSES.EDITING);
  });

  test('updates edit text as user types', () => {
    renderWithRedux(activeTodo);
    
    // Enter edit mode
    const todoLabel = screen.getByLabelText(`${activeTodo.text}, double click to edit`);
    fireEvent.doubleClick(todoLabel);
    
    // Find the edit input
    const editInput = screen.getByRole('textbox', { name: 'Edit todo text' });
    
    // Type new text in the input
    fireEvent.change(editInput, { target: { value: 'Updated Todo Text' } });
    
    // Verify input value updated
    expect(editInput).toHaveValue('Updated Todo Text');
  });

  test('dispatches editTodo when valid edit is submitted', () => {
    const { dispatchMock } = renderWithRedux(activeTodo);
    
    // Mock validation to return valid
    (validateTodoText as jest.Mock).mockReturnValue({ isValid: true });
    
    // Mock the editTodo action
    (editTodo as jest.Mock).mockReturnValue({ 
      type: 'todos/editTodo', 
      payload: { id: activeTodo.id, text: 'Updated Todo Text' } 
    });
    
    // Enter edit mode
    const todoLabel = screen.getByLabelText(`${activeTodo.text}, double click to edit`);
    fireEvent.doubleClick(todoLabel);
    
    // Find the edit input and change its value
    const editInput = screen.getByRole('textbox', { name: 'Edit todo text' });
    fireEvent.change(editInput, { target: { value: 'Updated Todo Text' } });
    
    // Submit by pressing Enter
    fireEvent.keyDown(editInput, { key: KEYBOARD_KEYS.ENTER });
    
    // Verify editTodo was dispatched with correct data
    expect(validateTodoText).toHaveBeenCalledWith('Updated Todo Text');
    expect(editTodo).toHaveBeenCalledWith(activeTodo.id, 'Updated Todo Text');
    expect(dispatchMock).toHaveBeenCalledWith({ 
      type: 'todos/editTodo', 
      payload: { id: activeTodo.id, text: 'Updated Todo Text' } 
    });
  });

  test('shows error message for invalid edit', () => {
    renderWithRedux(activeTodo);
    
    // Mock validation to return invalid
    (validateTodoText as jest.Mock).mockReturnValue({ 
      isValid: false, 
      errorMessage: 'Todo text cannot be empty' 
    });
    
    // Enter edit mode
    const todoLabel = screen.getByLabelText(`${activeTodo.text}, double click to edit`);
    fireEvent.doubleClick(todoLabel);
    
    // Find the edit input and change its value
    const editInput = screen.getByRole('textbox', { name: 'Edit todo text' });
    fireEvent.change(editInput, { target: { value: '' } });
    
    // Submit by pressing Enter
    fireEvent.keyDown(editInput, { key: KEYBOARD_KEYS.ENTER });
    
    // Verify validation was called
    expect(validateTodoText).toHaveBeenCalledWith('');
    
    // Verify edit input is still present (edit mode not exited)
    expect(editInput).toBeInTheDocument();
    
    // Verify error styling/attributes
    expect(editInput).toHaveAttribute('aria-invalid', 'true');
    expect(editInput).toHaveAttribute('title', 'Todo text cannot be empty');
    expect(editInput).toHaveStyle({ borderColor: 'red' });
    
    // Verify editTodo was not called
    expect(editTodo).not.toHaveBeenCalled();
  });

  test('cancels edit mode when Escape is pressed', () => {
    const { dispatchMock } = renderWithRedux(activeTodo);
    
    // Enter edit mode
    const todoLabel = screen.getByLabelText(`${activeTodo.text}, double click to edit`);
    fireEvent.doubleClick(todoLabel);
    
    // Find the edit input and change its value
    const editInput = screen.getByRole('textbox', { name: 'Edit todo text' });
    fireEvent.change(editInput, { target: { value: 'Updated Text' } });
    
    // Press Escape to cancel
    fireEvent.keyDown(editInput, { key: KEYBOARD_KEYS.ESCAPE });
    
    // Verify edit mode is exited
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    
    // Verify original text is still displayed
    expect(screen.getByText(activeTodo.text)).toBeInTheDocument();
    
    // Verify editTodo was not called
    expect(editTodo).not.toHaveBeenCalled();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  test('submits edit when focus is lost', async () => {
    const { dispatchMock } = renderWithRedux(activeTodo);
    
    // Mock validation to return valid
    (validateTodoText as jest.Mock).mockReturnValue({ isValid: true });
    
    // Mock the editTodo action
    (editTodo as jest.Mock).mockReturnValue({ 
      type: 'todos/editTodo', 
      payload: { id: activeTodo.id, text: 'Edited on blur' } 
    });
    
    // Enter edit mode
    const todoLabel = screen.getByLabelText(`${activeTodo.text}, double click to edit`);
    fireEvent.doubleClick(todoLabel);
    
    // Find the edit input and change its value
    const editInput = screen.getByRole('textbox', { name: 'Edit todo text' });
    fireEvent.change(editInput, { target: { value: 'Edited on blur' } });
    
    // Blur the input to trigger submit
    fireEvent.blur(editInput);
    
    // Wait for any async updates
    await waitFor(() => {
      // Verify editTodo was dispatched with correct data
      expect(validateTodoText).toHaveBeenCalledWith('Edited on blur');
      expect(editTodo).toHaveBeenCalledWith(activeTodo.id, 'Edited on blur');
      expect(dispatchMock).toHaveBeenCalledWith({ 
        type: 'todos/editTodo', 
        payload: { id: activeTodo.id, text: 'Edited on blur' } 
      });
    });
  });
});