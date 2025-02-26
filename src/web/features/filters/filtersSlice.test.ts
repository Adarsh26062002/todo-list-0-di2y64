import { filtersSlice, setFilter, selectCurrentFilter } from './filtersSlice';
import { FilterStatus } from '../../types';
import { FILTERS, DEFAULT_VALUES } from '../../configs/constants';

const { reducer, actions } = filtersSlice;

describe('Filters Reducer', () => {
  test('should handle initial state', () => {
    // When the reducer is called with undefined state and an unknown action
    // It should return the initial state with the default filter
    const initialState = reducer(undefined, { type: 'unknown' });
    
    // Verify the initial state has the correct default filter value
    expect(initialState.status).toEqual(DEFAULT_VALUES.DEFAULT_FILTER);
  });

  test('should handle setFilter', () => {
    // Given an initial state with the default filter
    const initialState = { status: FilterStatus.All };
    
    // When the setFilter action is dispatched with 'active' filter
    let newState = reducer(
      initialState, 
      setFilter(FilterStatus.Active)
    );
    
    // Then the state should be updated with the 'active' filter
    expect(newState.status).toEqual(FilterStatus.Active);
    
    // When the setFilter action is dispatched with 'completed' filter
    newState = reducer(
      initialState, 
      setFilter(FilterStatus.Completed)
    );
    
    // Then the state should be updated with the 'completed' filter
    expect(newState.status).toEqual(FilterStatus.Completed);
    
    // When the setFilter action is dispatched with 'all' filter
    newState = reducer(
      initialState, 
      setFilter(FilterStatus.All)
    );
    
    // Then the state should be updated with the 'all' filter
    expect(newState.status).toEqual(FilterStatus.All);
  });
});

describe('selectCurrentFilter', () => {
  test('should return the current filter status', () => {
    // Given a state with the 'completed' filter active
    const mockState = {
      filters: {
        status: FilterStatus.Completed
      },
      todos: {
        entities: [] // Required by RootState type but not used in this test
      }
    };
    
    // When the selectCurrentFilter selector is called
    const result = selectCurrentFilter(mockState);
    
    // Then it should return the correct filter status
    expect(result).toEqual(FilterStatus.Completed);
  });
});