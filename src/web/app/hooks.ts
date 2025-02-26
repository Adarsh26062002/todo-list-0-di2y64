/**
 * Custom typed hooks for Redux state and dispatch access within the Todo application.
 * Provides type-safe versions of useDispatch and useSelector hooks to ensure proper 
 * TypeScript type checking when accessing the store.
 */

import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'; // ^8.0.0
import { RootState, AppDispatch } from './store';

/**
 * Type-safe version of useDispatch hook that returns AppDispatch type
 * Use this hook throughout the app instead of plain useDispatch
 * 
 * @returns Typed dispatch function for dispatching Redux actions
 */
export const useAppDispatch = () => useDispatch<AppDispatch>();

/**
 * Type-safe version of useSelector hook that knows the RootState type
 * Use this hook throughout the app instead of plain useSelector
 */
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;