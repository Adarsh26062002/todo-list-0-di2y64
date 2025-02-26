/**
 * Validation utility module
 * Provides functions for validating todo text input throughout the application
 * @module validation
 * @version 1.0.0
 */

import { ValidationResult } from '../types';
import { MAX_TODO_LENGTH, VALIDATION_ERRORS, WHITESPACE_REGEX } from '../configs/validation.config';

/**
 * Validates todo text against predefined rules:
 * - Non-empty
 * - Length within limit
 * - Not only whitespace
 * 
 * @param text - The todo text to validate
 * @returns Validation result object with status and error message if invalid
 */
export const validateTodoText = (text: string): ValidationResult => {
  // Check for completely empty text
  if (isEmptyText(text)) {
    return createInvalidResult(VALIDATION_ERRORS.EMPTY_TODO);
  }

  // Check for whitespace-only text
  if (isWhitespaceOnly(text)) {
    return createInvalidResult(VALIDATION_ERRORS.WHITESPACE_ONLY);
  }

  // Check for text exceeding maximum length
  if (exceedsMaxLength(text)) {
    return createInvalidResult(VALIDATION_ERRORS.MAX_LENGTH_EXCEEDED);
  }

  // All validation passed
  return createValidResult();
};

/**
 * Checks if text is empty (zero length)
 * 
 * @param text - The text to check
 * @returns True if text has zero length, false otherwise
 */
export const isEmptyText = (text: string): boolean => {
  return text.length === 0;
};

/**
 * Checks if text exceeds the maximum allowed length
 * 
 * @param text - The text to check
 * @returns True if text exceeds MAX_TODO_LENGTH, false otherwise
 */
export const exceedsMaxLength = (text: string): boolean => {
  return text.length > MAX_TODO_LENGTH;
};

/**
 * Checks if text consists only of whitespace characters
 * 
 * @param text - The text to check
 * @returns True if text is non-empty but consists only of whitespace, false otherwise
 */
export const isWhitespaceOnly = (text: string): boolean => {
  return text.length > 0 && text.trim().length === 0;
};

/**
 * Creates a valid validation result object
 * 
 * @returns Valid result with no error message
 */
const createValidResult = (): ValidationResult => {
  return {
    isValid: true
  };
};

/**
 * Creates an invalid validation result object with error message
 * 
 * @param errorMessage - The error message to include
 * @returns Invalid result with the provided error message
 */
const createInvalidResult = (errorMessage: string): ValidationResult => {
  return {
    isValid: false,
    errorMessage
  };
};