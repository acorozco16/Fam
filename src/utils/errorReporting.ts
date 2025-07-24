// Simple error reporting utility
// Can be extended with Sentry or other services later

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  context?: Record<string, any>;
}

class ErrorReporter {
  private static instance: ErrorReporter;
  private userId?: string;
  private enableReporting: boolean;

  constructor() {
    this.enableReporting = import.meta.env.VITE_ENABLE_ERROR_REPORTING === 'true';
    this.setupGlobalErrorHandlers();
  }

  static getInstance(): ErrorReporter {
    if (!ErrorReporter.instance) {
      ErrorReporter.instance = new ErrorReporter();
    }
    return ErrorReporter.instance;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private setupGlobalErrorHandlers() {
    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        userId: this.userId,
        context: {
          type: 'javascript_error',
          line: event.lineno,
          column: event.colno
        }
      });
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
        userId: this.userId,
        context: {
          type: 'unhandled_promise_rejection',
          reason: event.reason
        }
      });
    });
  }

  private async reportError(errorReport: ErrorReport) {
    if (!this.enableReporting) {
      console.warn('📊 Error reporting disabled');
      return;
    }

    try {
      // Log to console in development
      if (import.meta.env.DEV) {
        console.error('🚨 Error Report:', errorReport);
      }

      // Send to your backend or error service
      // For now, we'll just store in localStorage for debugging
      const existingErrors = JSON.parse(localStorage.getItem('famapp-error-logs') || '[]');
      existingErrors.push(errorReport);
      
      // Keep only last 50 errors
      if (existingErrors.length > 50) {
        existingErrors.splice(0, existingErrors.length - 50);
      }
      
      localStorage.setItem('famapp-error-logs', JSON.stringify(existingErrors));

      // TODO: Send to external service like Sentry
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });

    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  }

  // Manual error reporting
  reportManualError(error: Error, context?: Record<string, any>) {
    this.reportError({
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      userId: this.userId,
      context: {
        type: 'manual_error',
        ...context
      }
    });
  }

  // Get stored error logs (for debugging)
  getErrorLogs(): ErrorReport[] {
    return JSON.parse(localStorage.getItem('famapp-error-logs') || '[]');
  }

  // Clear error logs
  clearErrorLogs() {
    localStorage.removeItem('famapp-error-logs');
  }
}

export const errorReporter = ErrorReporter.getInstance();

// React Error Boundary hook
export const useErrorReporting = () => {
  return {
    reportError: (error: Error, context?: Record<string, any>) => {
      errorReporter.reportManualError(error, context);
    },
    getErrorLogs: () => errorReporter.getErrorLogs(),
    clearErrorLogs: () => errorReporter.clearErrorLogs()
  };
};