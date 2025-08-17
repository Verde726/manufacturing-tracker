// Manufacturing Production Tracker - Error Boundary Component
// Catches and handles React errors gracefully

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Manufacturing Tracker Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    
    this.setState({
      error,
      errorInfo
    });

    // Log error to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, send to error tracking service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    console.log('Error data that would be sent to service:', errorData);
  };

  private handleRetry = () => {
    if (this.state.retryCount < this.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    } else {
      window.location.reload();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private toggleDetails = () => {
    const details = document.getElementById('error-details');
    if (details) {
      details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const canRetry = this.state.retryCount < this.maxRetries;
      
      return (
        <div className="error-boundary">
          <div className="error-content">
            <div className="error-icon">
              <AlertTriangle size={48} />
            </div>
            
            <h1 className="error-title">Something Went Wrong</h1>
            
            <p className="error-message">
              The Manufacturing Tracker encountered an unexpected error. 
              Your data is safe and the application will continue to work offline.
            </p>
            
            <div className="error-actions">
              {canRetry && (
                <button 
                  className="btn btn-primary"
                  onClick={this.handleRetry}
                >
                  <RefreshCw size={16} />
                  Try Again ({this.maxRetries - this.state.retryCount} attempts left)
                </button>
              )}
              
              <button 
                className="btn btn-secondary"
                onClick={this.handleReload}
              >
                <RefreshCw size={16} />
                Reload Application
              </button>
              
              <button 
                className="btn btn-ghost"
                onClick={this.handleGoHome}
              >
                <Home size={16} />
                Go to Homepage
              </button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="error-debug">
                <button 
                  className="btn btn-ghost small"
                  onClick={this.toggleDetails}
                >
                  <Bug size={14} />
                  Show Technical Details
                </button>
                
                <div id="error-details" style={{ display: 'none' }}>
                  <div className="error-technical">
                    <h3>Error Details</h3>
                    <pre className="error-stack">
                      {this.state.error?.message}
                      {'\n\n'}
                      {this.state.error?.stack}
                    </pre>
                    
                    {this.state.errorInfo && (
                      <>
                        <h3>Component Stack</h3>
                        <pre className="error-stack">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            <div className="error-footer">
              <p>
                If this problem persists, please contact support with the error details above.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}