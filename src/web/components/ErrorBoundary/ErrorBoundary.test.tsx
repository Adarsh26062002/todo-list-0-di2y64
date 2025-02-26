import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import ErrorBoundary from './ErrorBoundary';
import { UI_CONSTANTS, TEST_IDS } from '../../configs/constants';

// Component that renders normally
const NormalComponent = () => <div>Normal component content</div>;

// Component that always throws an error
const ErrorComponent = () => {
  throw new Error('Test error');
  // eslint-disable-next-line no-unreachable
  return <div>This will never render</div>;
};

// Component that conditionally throws errors based on a prop
class ConditionalErrorComponent extends React.Component<{ shouldThrow: boolean }> {
  render() {
    if (this.props.shouldThrow) {
      throw new Error('Conditional test error');
    }
    return <div>Conditional component content</div>;
  }
}

// Custom fallback component
const CustomFallback = ({ error, resetErrorBoundary }: { 
  error: Error; 
  resetErrorBoundary: () => void 
}) => (
  <div data-testid="custom-fallback">
    <h3>Custom error UI</h3>
    <p>{error?.message}</p>
    <button onClick={resetErrorBoundary}>Custom reset</button>
  </div>
);

describe('ErrorBoundary', () => {
  // Suppress console errors during tests
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  
  afterAll(() => {
    console.error = originalConsoleError;
  });
  
  beforeEach(() => {
    (console.error as jest.Mock).mockClear();
  });

  test('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Normal component content')).toBeInTheDocument();
    expect(screen.queryByTestId(TEST_IDS.ERROR_BOUNDARY)).not.toBeInTheDocument();
  });

  test('displays fallback UI when child component throws', () => {
    // Render will log errors to console because ErrorComponent throws
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByTestId(TEST_IDS.ERROR_BOUNDARY)).toBeInTheDocument();
    expect(screen.getByText(UI_CONSTANTS.ERROR_FALLBACK_TITLE)).toBeInTheDocument();
    expect(screen.getByText(UI_CONSTANTS.ERROR_FALLBACK_MESSAGE)).toBeInTheDocument();
    expect(screen.getByText(UI_CONSTANTS.ERROR_FALLBACK_BUTTON)).toBeInTheDocument();
    expect(screen.queryByText('This will never render')).not.toBeInTheDocument();
  });

  test('resets error state when reset button is clicked', () => {
    // Mock the setState method to verify it's called correctly
    const setStateMock = jest.fn();
    const originalSetState = ErrorBoundary.prototype.setState;
    ErrorBoundary.prototype.setState = setStateMock;
    
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Verify error UI is shown
    expect(screen.getByTestId(TEST_IDS.ERROR_BOUNDARY)).toBeInTheDocument();
    
    // Reset mock to clear previous calls
    setStateMock.mockClear();
    
    // Click reset button
    fireEvent.click(screen.getByText(UI_CONSTANTS.ERROR_FALLBACK_BUTTON));
    
    // Verify setState was called with correct parameters
    expect(setStateMock).toHaveBeenCalledWith({ hasError: false, error: undefined });
    
    // Restore original method
    ErrorBoundary.prototype.setState = originalSetState;
  });

  test('accepts and renders custom fallback component', () => {
    // Create a custom fallback component
    const fallback = (
      <CustomFallback 
        error={new Error('Custom fallback error')} 
        resetErrorBoundary={() => {}}
      />
    );
    
    render(
      <ErrorBoundary fallback={fallback}>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Verify custom fallback is rendered
    expect(screen.getByTestId('custom-fallback')).toBeInTheDocument();
    expect(screen.getByText('Custom error UI')).toBeInTheDocument();
    expect(screen.getByText('Custom fallback error')).toBeInTheDocument();
    expect(screen.getByText('Custom reset')).toBeInTheDocument();
    
    // Default error UI should not be present
    expect(screen.queryByTestId(TEST_IDS.ERROR_BOUNDARY)).not.toBeInTheDocument();
  });

  test('properly handles error in componentDidCatch', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent />
      </ErrorBoundary>
    );
    
    // Verify console.error was called with error information
    expect(console.error).toHaveBeenCalled();
    expect((console.error as jest.Mock).mock.calls[0][0]).toBe('Error caught by ErrorBoundary:');
    
    // Verify fallback UI is shown
    expect(screen.getByTestId(TEST_IDS.ERROR_BOUNDARY)).toBeInTheDocument();
  });
});