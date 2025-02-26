import React from 'react'; // ^18.2.0
import TodoForm from '../components/TodoForm/TodoForm';
import TodoList from '../components/TodoList/TodoList';
import Footer from '../components/Footer/Footer';
import ErrorBoundary from '../components/ErrorBoundary/ErrorBoundary';
import { UI_CONSTANTS, TEST_IDS } from '../configs/constants';
import './MainLayout.css';

/**
 * Main layout component that provides the overall structure for the Todo application.
 * Wraps TodoForm, TodoList, and Footer components in a responsive container with appropriate styling.
 * 
 * @returns JSX.Element - The rendered layout with TodoForm, TodoList, and Footer components
 */
const MainLayout: React.FC = () => {
  return (
    <div className="todoapp" data-testid={TEST_IDS.MAIN_LAYOUT}>
      <header className="header">
        <h1 className="app-title">{UI_CONSTANTS.APP_TITLE}</h1>
        <ErrorBoundary>
          <TodoForm />
        </ErrorBoundary>
      </header>
      
      <section className="main">
        <ErrorBoundary>
          <TodoList />
        </ErrorBoundary>
      </section>
      
      <ErrorBoundary>
        <Footer />
      </ErrorBoundary>
    </div>
  );
};

export default MainLayout;