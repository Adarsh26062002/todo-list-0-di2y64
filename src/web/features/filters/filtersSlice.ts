/**
 * Redux Toolkit slice for managing filter state in the Todo List application.
 * Provides actions and selectors for filtering todos by their completion status (All, Active, Completed).
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit'; // v1.9.3
import { FilterStatus, FiltersState, RootState } from '../../types';
import { FILTERS, DEFAULT_VALUES } from '../../configs/constants';

/**
 * Initial state for the filters slice
 * Uses the default filter value from constants (typically 'all')
 */
const initialState: FiltersState = {
  status: DEFAULT_VALUES.DEFAULT_FILTER as FilterStatus
};

/**
 * Redux Toolkit slice for managing filter state
 * Provides actions and reducers for setting the active filter
 */
export const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    /**
     * Updates the current filter status
     * @param state - Current filters state
     * @param action - Action containing the new filter status
     */
    setFilter: (state, action: PayloadAction<FilterStatus>) => {
      state.status = action.payload;
    }
  }
});

// Extract and export the action creator
export const { setFilter } = filtersSlice.actions;

/**
 * Selector to retrieve the current filter status from the Redux state
 * @param state - The root Redux state
 * @returns The current filter status (all, active, or completed)
 */
export const selectCurrentFilter = (state: RootState): FilterStatus => {
  return state.filters.status;
};

// Export the reducer as default
export default filtersSlice.reducer;