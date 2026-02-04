/**
 * Centralized logging service for PIKO COMMAND
 * Provides consistent logging across the application with environment-aware behavior
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  component?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;

  /**
   * Log informational messages (development only)
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log warning messages (development only)
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  }

  /**
   * Log error messages (always logged, can be extended to send to error tracking)
   */
  error(message: string, error?: unknown, context?: LogContext): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const fullMessage = `[ERROR] ${message}${errorMessage ? `: ${errorMessage}` : ''}`;
    
    if (this.isDevelopment) {
      console.error(fullMessage, { error, ...context });
    } else {
      // In production, you could send to error tracking service (Sentry, etc.)
      console.error(fullMessage);
    }
  }

  /**
   * Log debug messages (development only)
   */
  debug(message: string, data?: unknown): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, data || '');
    }
  }

  /**
   * Log GitHub operations with context
   */
  github(operation: string, success: boolean, details?: string): void {
    const level = success ? 'info' : 'error';
    this[level](`GitHub ${operation}`, {
      component: 'GitHubAPI',
      action: operation,
      metadata: { success, details }
    });
  }

  /**
   * Log social media operations
   */
  social(platform: string, operation: string, success: boolean): void {
    const level = success ? 'info' : 'warn';
    this[level](`Social media ${operation}`, {
      component: 'SocialMediaAdapter',
      action: operation,
      metadata: { platform, success }
    });
  }

  /**
   * Log AI operations
   */
  ai(operation: string, success: boolean, details?: string): void {
    const level = success ? 'info' : 'error';
    this[level](`AI ${operation}`, {
      component: 'Ghostwriter',
      action: operation,
      metadata: { success, details }
    });
  }
}

// Export singleton instance
export const logger = new Logger();
