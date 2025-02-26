import React from 'react';
import { UI_CONSTANTS, TEST_IDS } from '../../configs/constants';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * A class component that catches JavaScript errors in its child components
 * and displays a fallback UI.
 */
class ErrorBoundary extends React.Component<Props, State> {
  /**
   * Initializes the component with default state
   */
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: undefined };
    this.resetErrorBoundary = this.resetErrorBoundary.bind(this);
  }

  /**
   * Static lifecycle method called when a child component throws an error
   */
  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  /**
   * Lifecycle method called after an error has been thrown by a descendant component
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    // You can also log the error to an error reporting service here
  }

  /**
   * Resets the error state to allow recovery
   */
  resetErrorBoundary(): void {
    this.setState({ hasError: false, error: undefined });
  }

  /**
   * Renders the component based on error state
   */
  render(): React.ReactNode {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Default fallback UI
      return (
        <div data-testid={TEST_IDS.ERROR_BOUNDARY} className="error-boundary">
          <h2>{UI_CONSTANTS.ERROR_FALLBACK_TITLE}</h2>
          <p>{UI_CONSTANTS.ERROR_FALLBACK_MESSAGE}</p>
          <button onClick={this.resetErrorBoundary}>
            {UI_CONSTANTS.ERROR_FALLBACK_BUTTON}
          </button>
        </div>
      );
    }

    // When no error has occurred, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;