import React, { FormEvent, KeyboardEvent, useRef, useEffect } from 'react'; // ^18.0.0
import classNames from 'classnames'; // ^2.3.2
import { useAppDispatch } from '../../app/hooks';
import { addTodo } from '../../features/todos/todosSlice';
import useValidation from '../../hooks/useValidation';
import { TEST_IDS, UI_CONSTANTS, KEYBOARD_KEYS } from '../../configs/constants';

/**
 * TodoForm component for creating new todo items
 * Provides an input form with validation and error display
 * 
 * @returns JSX.Element - Rendered form component
 */
const TodoForm = () => {
  // Get the dispatch function from Redux
  const dispatch = useAppDispatch();
  
  // Use the validation hook to manage form state and validation
  const {
    value,
    setValue,
    error,
    isValid,
    validate,
    resetValidation
  } = useValidation('', { validateOnChange: false });
  
  // Create a ref for the input element to focus it
  const inputRef = useRef<HTMLInputElement>(null);
  
  /**
   * Handle form submission
   * Validates input and dispatches addTodo action if valid
   * 
   * @param e - Form submit event
   */
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Validate the input
    if (!validate()) {
      return; // Stop if validation fails
    }
    
    try {
      // Dispatch the addTodo action with the trimmed value
      dispatch(addTodo(value.trim()));
      
      // Clear the input and reset validation
      setValue('');
      resetValidation();
    } catch (error) {
      // If addTodo fails (e.g., validation in the action creator),
      // don't clear the form so the user can fix the issue
      console.error('Failed to add todo:', error);
    }
  };
  
  /**
   * Handle keyboard events
   * Escape key clears the input
   * 
   * @param e - Keyboard event
   */
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === KEYBOARD_KEYS.ESCAPE) {
      setValue('');
      resetValidation();
    }
  };
  
  // Focus the input field when the component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  return (
    <form 
      className="todo-form" 
      onSubmit={handleSubmit}
      data-testid={TEST_IDS.TODO_FORM}
    >
      <input
        className={classNames('new-todo', { 'error': !isValid })}
        placeholder={UI_CONSTANTS.TODO_PLACEHOLDER}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        ref={inputRef}
        aria-label="New todo input"
        aria-invalid={!isValid}
        aria-describedby={error ? "validation-error" : undefined}
      />
      
      {error && (
        <div 
          id="validation-error" 
          className="validation-error" 
          aria-live="polite"
        >
          {error}
        </div>
      )}
    </form>
  );
};

export default TodoForm;