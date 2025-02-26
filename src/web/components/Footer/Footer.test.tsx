import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react'; // ^13.4.0
import { jest } from '@jest/globals'; // ^27.5.1
import Footer from './Footer';
import { 
  selectActiveTodoCount,
  selectCompletedTodoCount 
} from '../../features/todos/todosSlice';
import {
  selectCurrentFilter,
  setFilter
} from '../../features/filters/filtersSlice';
import { FilterStatus } from '../../types';
import {
  TEST_IDS,
  FILTERS,
  FILTER_LABELS,
  UI_CONSTANTS,
  CSS_CLASSES
} from '../../configs/constants';

// Mock the hooks and Redux functions
jest.mock('../../app/hooks', () => ({
  useAppSelector: jest.fn(selector => {
    // Default implementations to be overridden in tests
    if (selector === selectActiveTodoCount) return 0;
    if (selector === selectCompletedTodoCount) return 0;
    if (selector === selectCurrentFilter) return FilterStatus.All;
    return null;
  }),
  useAppDispatch: jest.fn(() => mockAppDispatch)
}));

// Mock the action creators and selectors
jest.mock('../../features/todos/todosSlice', () => ({
  selectActiveTodoCount: jest.fn(),
  selectCompletedTodoCount: jest.fn()
}));

jest.mock('../../features/filters/filtersSlice', () => ({
  selectCurrentFilter: jest.fn(),
  setFilter: jest.fn((filter) => ({ type: 'filters/setFilter', payload: filter }))
}));

// Mock dispatch function
const mockAppDispatch = jest.fn();

/**
 * Helper function to render the component with mocked Redux dependencies
 */
const renderWithRedux = (
  activeTodoCount: number, 
  completedTodoCount: number, 
  currentFilter: FilterStatus
) => {
  // Set up mock selectors to return provided values
  require('../../app/hooks').useAppSelector.mockImplementation((selector) => {
    if (selector === selectActiveTodoCount) return activeTodoCount;
    if (selector === selectCompletedTodoCount) return completedTodoCount;
    if (selector === selectCurrentFilter) return currentFilter;
    return null;
  });
  
  mockAppDispatch.mockClear();
  
  const renderResult = render(<Footer />);
  
  return {
    ...renderResult,
    mockDispatch: mockAppDispatch
  };
};

describe('Footer Component', () => {
  test('renders nothing when there are no todos', () => {
    renderWithRedux(0, 0, FilterStatus.All);
    
    // Footer should not be in the document
    const footer = screen.queryByTestId(TEST_IDS.FOOTER);
    expect(footer).not.toBeInTheDocument();
  });
  
  test('renders correctly with active todos', () => {
    renderWithRedux(2, 0, FilterStatus.All);
    
    // Footer should be in the document
    const footer = screen.getByTestId(TEST_IDS.FOOTER);
    expect(footer).toBeInTheDocument();
    
    // Should show "2 items left" (plural)
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(UI_CONSTANTS.ITEMS_LEFT_PLURAL)).toBeInTheDocument();
    
    // Should render all three filter buttons
    expect(screen.getByTestId(`${TEST_IDS.FILTER_BUTTON}-${FILTERS.ALL}`)).toBeInTheDocument();
    expect(screen.getByTestId(`${TEST_IDS.FILTER_BUTTON}-${FILTERS.ACTIVE}`)).toBeInTheDocument();
    expect(screen.getByTestId(`${TEST_IDS.FILTER_BUTTON}-${FILTERS.COMPLETED}`)).toBeInTheDocument();
  });
  
  test('uses singular text when only one active todo', () => {
    renderWithRedux(1, 0, FilterStatus.All);
    
    // Should show "1 item left" (singular)
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText(UI_CONSTANTS.ITEMS_LEFT_SINGULAR)).toBeInTheDocument();
  });
  
  test('applies selected class to the current filter button', () => {
    renderWithRedux(2, 1, FilterStatus.Active);
    
    // Get all filter buttons
    const allFilterBtn = screen.getByTestId(`${TEST_IDS.FILTER_BUTTON}-${FILTERS.ALL}`);
    const activeFilterBtn = screen.getByTestId(`${TEST_IDS.FILTER_BUTTON}-${FILTERS.ACTIVE}`);
    const completedFilterBtn = screen.getByTestId(`${TEST_IDS.FILTER_BUTTON}-${FILTERS.COMPLETED}`);
    
    // Active filter should have selected class
    expect(activeFilterBtn).toHaveClass(CSS_CLASSES.SELECTED);
    
    // Other filters should not have selected class
    expect(allFilterBtn).not.toHaveClass(CSS_CLASSES.SELECTED);
    expect(completedFilterBtn).not.toHaveClass(CSS_CLASSES.SELECTED);
  });
  
  test('dispatches setFilter action when filter button is clicked', () => {
    const { mockDispatch } = renderWithRedux(2, 1, FilterStatus.All);
    
    // Click the Completed filter button
    const completedFilterBtn = screen.getByTestId(`${TEST_IDS.FILTER_BUTTON}-${FILTERS.COMPLETED}`);
    fireEvent.click(completedFilterBtn);
    
    // Verify setFilter action was dispatched with correct filter
    expect(setFilter).toHaveBeenCalledWith(FilterStatus.Completed);
    expect(mockDispatch).toHaveBeenCalled();
  });
  
  test('renders with completed todos but no active todos', () => {
    renderWithRedux(0, 3, FilterStatus.All);
    
    // Footer should be in the document
    const footer = screen.getByTestId(TEST_IDS.FOOTER);
    expect(footer).toBeInTheDocument();
    
    // Should show "0 items left"
    expect(screen.getByText('0')).toBeInTheDocument();
    expect(screen.getByText(UI_CONSTANTS.ITEMS_LEFT_PLURAL)).toBeInTheDocument();
    
    // Should render all three filter buttons
    expect(screen.getByTestId(`${TEST_IDS.FILTER_BUTTON}-${FILTERS.ALL}`)).toBeInTheDocument();
    expect(screen.getByTestId(`${TEST_IDS.FILTER_BUTTON}-${FILTERS.ACTIVE}`)).toBeInTheDocument();
    expect(screen.getByTestId(`${TEST_IDS.FILTER_BUTTON}-${FILTERS.COMPLETED}`)).toBeInTheDocument();
  });
});