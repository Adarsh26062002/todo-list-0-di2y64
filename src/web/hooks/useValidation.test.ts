import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect } from '@jest/globals';
import useValidation from './useValidation';
import { ValidationResult } from '../types';
import { VALIDATION_ERRORS, MAX_TODO_LENGTH } from '../configs/validation.config';

describe('useValidation hook', () => {
  it('should initialize with valid state when no initial value', () => {
    const { result } = renderHook(() => useValidation());
    
    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeUndefined();
  });
  
  it('should validate empty input', () => {
    const { result } = renderHook(() => useValidation());
    
    let isValid;
    act(() => {
      result.current.setValue('');
      isValid = result.current.validate();
    });
    
    expect(isValid).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe(VALIDATION_ERRORS.EMPTY_TODO);
  });
  
  it('should validate text exceeding maximum length', () => {
    const { result } = renderHook(() => useValidation());
    const oversizedText = 'a'.repeat(MAX_TODO_LENGTH + 1);
    
    let isValid;
    act(() => {
      result.current.setValue(oversizedText);
      isValid = result.current.validate();
    });
    
    expect(isValid).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe(VALIDATION_ERRORS.MAX_LENGTH_EXCEEDED);
  });
  
  it('should validate whitespace-only input', () => {
    const { result } = renderHook(() => useValidation());
    
    let isValid;
    act(() => {
      result.current.setValue('   ');
      isValid = result.current.validate();
    });
    
    expect(isValid).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe(VALIDATION_ERRORS.WHITESPACE_ONLY);
  });
  
  it('should return valid for proper input', () => {
    const { result } = renderHook(() => useValidation());
    
    let isValid;
    act(() => {
      result.current.setValue('Buy groceries');
      isValid = result.current.validate();
    });
    
    expect(isValid).toBe(true);
    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeUndefined();
  });
  
  it('should update validation when value changes and validateOnChange is true', () => {
    const { result } = renderHook(() => useValidation('', { validateOnChange: true }));
    
    act(() => {
      result.current.setValue('');
    });
    
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe(VALIDATION_ERRORS.EMPTY_TODO);
    
    act(() => {
      result.current.setValue('Valid todo');
    });
    
    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeUndefined();
  });
  
  it('should reset validation state', () => {
    const { result } = renderHook(() => useValidation());
    
    act(() => {
      result.current.setValue('');
      result.current.validate();
    });
    
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBe(VALIDATION_ERRORS.EMPTY_TODO);
    
    act(() => {
      result.current.resetValidation();
    });
    
    expect(result.current.isValid).toBe(true);
    expect(result.current.error).toBeUndefined();
  });
});