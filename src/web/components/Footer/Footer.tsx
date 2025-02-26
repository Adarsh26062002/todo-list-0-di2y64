import React from 'react'; // ^18.2.0
import classNames from 'classnames'; // ^2.3.2
import { useAppSelector, useAppDispatch } from '../../app/hooks';
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
  FILTERS,
  FILTER_LABELS,
  UI_CONSTANTS,
  CSS_CLASSES,
  TEST_IDS
} from '../../configs/constants';

/**
 * Footer component that displays information about todo items and provides filter controls.
 * Shows the count of remaining active todo items and allows users to filter the todo list
 * by All, Active, or Completed status.
 * 
 * @returns {JSX.Element | null} The footer component or null if there are no todos
 */
const Footer = (): JSX.Element | null => {
  // Get active and completed todo counts from Redux store
  const activeTodoCount = useAppSelector(selectActiveTodoCount);
  const completedTodoCount = useAppSelector(selectCompletedTodoCount);
  
  // Get current filter from Redux store
  const currentFilter = useAppSelector(selectCurrentFilter);
  
  // Get dispatch function for Redux actions
  const dispatch = useAppDispatch();
  
  // Don't render the footer if there are no todos
  if (activeTodoCount === 0 && completedTodoCount === 0) {
    return null;
  }
  
  /**
   * Handles filter change when a filter button is clicked
   * 
   * @param filter - The filter status to set (all, active, completed)
   * @param e - Mouse event from the click
   */
  const handleFilterChange = (filter: FilterStatus, e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Prevent default link behavior
    dispatch(setFilter(filter));
  };
  
  // Determine text for item count (singular or plural)
  const itemText = activeTodoCount === 1 
    ? UI_CONSTANTS.ITEMS_LEFT_SINGULAR 
    : UI_CONSTANTS.ITEMS_LEFT_PLURAL;
  
  return (
    <footer className="footer" data-testid={TEST_IDS.FOOTER}>
      <span className="todo-count">
        <strong>{activeTodoCount}</strong> {itemText}
      </span>
      <ul className="filters">
        <li>
          <a 
            href="#"
            className={classNames({ [CSS_CLASSES.SELECTED]: currentFilter === FilterStatus.All })}
            onClick={(e) => handleFilterChange(FilterStatus.All, e)}
            data-testid={`${TEST_IDS.FILTER_BUTTON}-${FILTERS.ALL}`}
          >
            {FILTER_LABELS.ALL}
          </a>
        </li>
        <li>
          <a 
            href="#"
            className={classNames({ [CSS_CLASSES.SELECTED]: currentFilter === FilterStatus.Active })}
            onClick={(e) => handleFilterChange(FilterStatus.Active, e)}
            data-testid={`${TEST_IDS.FILTER_BUTTON}-${FILTERS.ACTIVE}`}
          >
            {FILTER_LABELS.ACTIVE}
          </a>
        </li>
        <li>
          <a 
            href="#"
            className={classNames({ [CSS_CLASSES.SELECTED]: currentFilter === FilterStatus.Completed })}
            onClick={(e) => handleFilterChange(FilterStatus.Completed, e)}
            data-testid={`${TEST_IDS.FILTER_BUTTON}-${FILTERS.COMPLETED}`}
          >
            {FILTER_LABELS.COMPLETED}
          </a>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;