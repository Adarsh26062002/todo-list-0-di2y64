import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames'; // ^2.3.2
import { Todo } from '../../types';
import { useAppDispatch } from '../../app/hooks';
import { toggleTodo, editTodo, deleteTodo } from '../../features/todos/todosSlice';
import { validateTodoText } from '../../utils/validation';
import { CSS_CLASSES, TEST_IDS, KEYBOARD_KEYS } from '../../configs/constants';
import './TodoItem.css';

/**
 * TodoItem Component
 * 
 * Renders an individual todo item with capabilities for viewing, toggling completion status,
 * editing text, and deleting. Handles validation for edits and provides keyboard navigation.
 * 
 * @param props - Component props containing the todo item data
 * @returns A rendered todo item component
 */
const TodoItem: React.FC<{todo: Todo}> = ({ todo }) => {
  // State for tracking edit mode and edited text
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editText, setEditText] = useState<string>(todo.text);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  // Reference to the edit input field for focusing
  const editInputRef = useRef<HTMLInputElement>(null);
  
  // Get Redux dispatch function
  const dispatch = useAppDispatch();
  
  // Focus the edit input when entering edit mode
  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      // Position cursor at the end of the text
      editInputRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, [isEditing, editText.length]);
  
  /**
   * Toggles the completion status of the todo
   */
  const handleToggle = () => {
    dispatch(toggleTodo(todo.id));
  };
  
  /**
   * Deletes the todo
   */
  const handleDelete = () => {
    dispatch(deleteTodo(todo.id));
  };
  
  /**
   * Activates edit mode for the todo
   */
  const handleEdit = () => {
    setIsEditing(true);
    setEditText(todo.text);
    setValidationError(null);
  };
  
  /**
   * Updates the edit text state as user types
   * 
   * @param e - Change event from the input field
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditText(e.target.value);
    // Clear validation errors when user starts typing
    if (validationError) {
      setValidationError(null);
    }
  };
  
  /**
   * Validates and saves the edited todo text if valid
   */
  const handleSubmit = () => {
    const validationResult = validateTodoText(editText);
    
    if (validationResult.isValid) {
      dispatch(editTodo(todo.id, editText));
      setIsEditing(false);
      setValidationError(null);
    } else {
      setValidationError(validationResult.errorMessage || 'Invalid input');
      
      // Make sure the input stays focused after validation failure
      if (editInputRef.current) {
        editInputRef.current.focus();
      }
    }
  };
  
  /**
   * Handles keyboard events during editing
   * - Enter: Submit the edit
   * - Escape: Cancel editing and restore original text
   * 
   * @param e - Keyboard event from the input field
   */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === KEYBOARD_KEYS.ENTER) {
      handleSubmit();
    } else if (e.key === KEYBOARD_KEYS.ESCAPE) {
      // Cancel editing and revert to original text
      setIsEditing(false);
      setEditText(todo.text);
      setValidationError(null);
    }
  };
  
  // Determine CSS classes for the todo item
  const itemClasses = classNames({
    'todo-item': true,
    [CSS_CLASSES.COMPLETED]: todo.completed,
    [CSS_CLASSES.EDITING]: isEditing
  });
  
  return (
    <li 
      className={itemClasses} 
      data-testid={TEST_IDS.TODO_ITEM}
    >
      {/* View mode (display when not editing) */}
      <div className="view">
        <input 
          type="checkbox" 
          className="toggle" 
          checked={todo.completed} 
          onChange={handleToggle} 
          aria-label={`Mark ${todo.text} as ${todo.completed ? 'incomplete' : 'complete'}`}
        />
        <label 
          onDoubleClick={handleEdit}
          aria-label={`${todo.text}, double click to edit`}
        >
          {todo.text}
        </label>
        <button 
          className="destroy" 
          onClick={handleDelete}
          aria-label={`Delete ${todo.text}`}
        />
      </div>
      
      {/* Edit mode (display when editing) */}
      <input 
        ref={editInputRef}
        type="text" 
        className="edit" 
        value={editText} 
        onChange={handleChange} 
        onBlur={handleSubmit} 
        onKeyDown={handleKeyDown}
        aria-label="Edit todo text"
        aria-invalid={!!validationError}
        title={validationError || undefined}
        style={validationError ? { borderColor: 'red' } : undefined}
      />
    </li>
  );
};

export default TodoItem;