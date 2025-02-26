import { useState, useCallback } from 'react';
import { ValidationResult } from '../types';
import { validateTodoText } from '../utils/validation';

/**
 * Options for configuring the useValidation hook behavior
 */
interface ValidationOptions {
  /**
   * If true, validation will run automatically when the value changes
   */
  validateOnChange?: boolean;
}

/**
 * Return type for the useValidation hook
 */
interface ValidationHookReturn {
  /**
   * Current input value
   */
  value: string;
  
  /**
   * Function to update the input value
   */
  setValue: (newValue: string) => void;
  
  /**
   * Current validation error message (if any)
   */
  error?: string;
  
  /**
   * Whether the current input is valid
   */
  isValid: boolean;
  
  /**
   * Function to validate the current input value
   * Returns true if valid, false if invalid
   */
  validate: () => boolean;
  
  /**
   * Function to reset validation state
   */
  resetValidation: () => void;
}

/**
 * Custom hook for managing form validation in todo input forms
 * 
 * @param initialValue - Optional initial value for the input
 * @param options - Configuration options for validation behavior
 * @returns Object containing value, setValue, error, isValid, validate, and resetValidation
 */
const useValidation = (
  initialValue: string = '',
  options?: ValidationOptions
): ValidationHookReturn => {
  // Initialize value state with initialValue or empty string
  const [value, setValue] = useState<string>(initialValue);
  
  // Initialize validation state with isValid = true and error = undefined
  const [validationState, setValidationState] = useState<ValidationResult>({
    isValid: true,
    errorMessage: undefined
  });
  
  // Memoize the validate function to prevent unnecessary re-renders
  const validate = useCallback((): boolean => {
    const result = validateTodoText(value);
    setValidationState(result);
    return result.isValid;
  }, [value]);
  
  // Memoize the resetValidation function
  const resetValidation = useCallback((): void => {
    setValidationState({
      isValid: true,
      errorMessage: undefined
    });
  }, []);
  
  // Create a custom setValue function that validates on change if option is enabled
  const setValueWithValidation = useCallback((newValue: string): void => {
    setValue(newValue);
    
    // If validateOnChange is enabled, validate the new value
    if (options?.validateOnChange) {
      const result = validateTodoText(newValue);
      setValidationState(result);
    }
  }, [options?.validateOnChange]);
  
  return {
    value,
    setValue: setValueWithValidation,
    error: validationState.errorMessage,
    isValid: validationState.isValid,
    validate,
    resetValidation
  };
};

export default useValidation;