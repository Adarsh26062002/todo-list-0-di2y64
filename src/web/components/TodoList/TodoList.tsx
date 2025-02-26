import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group'; // ^4.4.5
import TodoItem from '../TodoItem/TodoItem';
import { Todo } from '../../types';
import { useAppSelector } from '../../app/hooks';
import { selectFilteredTodos } from '../../features/todos/todosSlice';
import { TEST_IDS } from '../../configs/constants';
import './TodoList.css';

/**
 * TodoList Component
 * 
 * Renders a filtered list of todo items based on the current filter state.
 * Implements animations for items entering/exiting the list and handles empty states.
 * 
 * @returns JSX.Element - The rendered todo list component
 */
const TodoList: React.FC = () => {
  // Select the filtered todos from the Redux store
  const filteredTodos = useAppSelector(selectFilteredTodos);
  
  return (
    <div className="todo-list-container">
      {filteredTodos.length === 0 ? (
        // Display a message when no todos match the current filter
        <div className="todo-list-empty">
          No todos to display. Add some tasks or change the filter.
        </div>
      ) : (
        // Render the list of todos with transition effects
        <ul className="todo-list" data-testid={TEST_IDS.TODO_LIST}>
          <TransitionGroup component={null}>
            {filteredTodos.map((todo: Todo) => (
              <CSSTransition
                key={todo.id}
                timeout={300}
                classNames="todo-list"
                appear={true}
              >
                <TodoItem todo={todo} />
              </CSSTransition>
            ))}
          </TransitionGroup>
        </ul>
      )}
    </div>
  );
};

export default TodoList;