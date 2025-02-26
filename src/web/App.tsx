import React from 'react'; // ^18.2.0
import { Provider } from 'react-redux'; // ^8.0.5
import TodoForm from './components/TodoForm/TodoForm';
import TodoList from './components/TodoList/TodoList';
import Footer from './components/Footer/Footer';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { store } from './app/store';
import { TEST_IDS } from './configs/constants';

/**
 * Main application component that serves as the entry point for the Todo List application.
 * Provides the overall structure and layout, integrates all key components,
 * and ensures Redux store is available throughout the component tree.
 * 
 * @returns {JSX.Element} The rendered Todo List application
 */
const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <div className="todoapp" data-testid={TEST_IDS.APP_CONTAINER}>
          <header className="header">
            <h1>todos</h1>
            <TodoForm />
          </header>
          <section className="main">
            <TodoList />
          </section>
          <Footer />
        </div>
      </ErrorBoundary>
    </Provider>
  );
};

export default App;