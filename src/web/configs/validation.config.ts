/**
 * Validation configuration for todo items
 * Defines constants, rules, and error messages for todo text validation
 * throughout the application, ensuring consistent validation behavior
 * @version 1.0.0
 */

/**
 * Maximum character length allowed for todo text
 * Used for validation in both creation and editing of todos
 */
export const MAX_TODO_LENGTH = 200;

/**
 * Regular expression to detect strings containing only whitespace characters
 * Used to prevent todos with no visible content
 */
export const WHITESPACE_REGEX = /^\s*$/;

/**
 * Error message strings for different validation failure scenarios
 * These messages are displayed to users when validation fails
 */
export const VALIDATION_ERRORS = {
  /**
   * Error displayed when todo text is empty
   */
  EMPTY_TODO: "Todo text cannot be empty",
  
  /**
   * Error displayed when todo text exceeds maximum allowed length
   */
  MAX_LENGTH_EXCEEDED: `Todo text cannot exceed ${MAX_TODO_LENGTH} characters`,
  
  /**
   * Error displayed when todo text contains only whitespace characters
   */
  WHITESPACE_ONLY: "Todo text cannot be only whitespace"
};

/**
 * Configuration object defining all validation rules for todo text
 * Used to ensure consistent validation across the application
 */
export const TODO_VALIDATION_RULES = {
  /**
   * Indicates that todo text is required and cannot be empty
   */
  required: true,
  
  /**
   * Maximum length allowed for todo text
   * References the MAX_TODO_LENGTH constant for consistency
   */
  maxLength: MAX_TODO_LENGTH,
  
  /**
   * Indicates that todo text cannot consist of only whitespace
   */
  nonWhitespaceOnly: true
};