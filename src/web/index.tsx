import React from 'react'; // ^18.2.0
import { createRoot } from 'react-dom/client'; // ^18.2.0
import { Provider } from 'react-redux'; // ^8.0.5

import App from './App';
import { store } from './app/store';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

/**
 * Retrieves the DOM element that will serve as the mounting point for the React application
 * 
 * @returns The DOM element where the React app will be mounted
 */
const getRootElement = (): HTMLElement => {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error(
      'Unable to find the root element to mount the React application. ' +
      'Make sure there is an element with id "root" in your HTML.'
    );
  }
  
  return rootElement;
};

/**
 * Renders the application with all required providers and error boundaries
 */
const renderApp = (): void => {
  try {
    const rootElement = getRootElement();
    const root = createRoot(rootElement);
    
    root.render(
      <React.StrictMode>
        <Provider store={store}>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </Provider>
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to render the application:', error);
  }
};

// Initialize the application
renderApp();