import { describe, it, expect } from '@jest/globals';
import { validateTodoText } from './validation';
import { MAX_TODO_LENGTH } from '../configs/validation.config';

describe('validateTodoText', () => {
  it('should return invalid result for empty string', () => {
    const result = validateTodoText('');
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('empty');
  });

  it('should return invalid result for whitespace-only string', () => {
    const spaceOnlyResult = validateTodoText('   ');
    const tabsAndNewlinesResult = validateTodoText('\t\n');

    expect(spaceOnlyResult.isValid).toBe(false);
    expect(spaceOnlyResult.errorMessage).toContain('whitespace');
    
    expect(tabsAndNewlinesResult.isValid).toBe(false);
    expect(tabsAndNewlinesResult.errorMessage).toContain('whitespace');
  });

  it('should return invalid result for strings exceeding maximum length', () => {
    // Generate a string that's one character longer than the maximum
    const longText = 'a'.repeat(MAX_TODO_LENGTH + 1);
    
    const result = validateTodoText(longText);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('exceed');
  });

  it('should return valid result for valid todo text', () => {
    const normalResult = validateTodoText('Buy groceries');
    const maxLengthResult = validateTodoText('a'.repeat(MAX_TODO_LENGTH));
    
    expect(normalResult.isValid).toBe(true);
    expect(normalResult.errorMessage).toBeUndefined();
    
    expect(maxLengthResult.isValid).toBe(true);
    expect(maxLengthResult.errorMessage).toBeUndefined();
  });

  it('should accept valid text with leading and trailing whitespace', () => {
    const result = validateTodoText('  Valid todo with whitespace  ');
    
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('should consider total length including whitespace for max length validation', () => {
    const textWithWhitespace = '  ' + 'a'.repeat(MAX_TODO_LENGTH - 1);
    // This exceeds MAX_TODO_LENGTH because of the 2 leading spaces
    
    const result = validateTodoText(textWithWhitespace);
    expect(result.isValid).toBe(false);
    expect(result.errorMessage).toContain('exceed');
  });

  it('should validate string at exact max length with whitespace', () => {
    // Create a string that's exactly MAX_TODO_LENGTH including whitespace
    const textAtMaxLength = ' ' + 'a'.repeat(MAX_TODO_LENGTH - 2) + ' ';
    
    const result = validateTodoText(textAtMaxLength);
    expect(result.isValid).toBe(true);
    expect(result.errorMessage).toBeUndefined();
  });

  it('should handle edge cases appropriately', () => {
    // Test with special characters
    const specialCharsResult = validateTodoText('!@#$%^&*()_+');
    expect(specialCharsResult.isValid).toBe(true);
    
    // Test with emoji characters
    const emojiResult = validateTodoText('💼 Work on project 🚀');
    expect(emojiResult.isValid).toBe(true);
  });
});