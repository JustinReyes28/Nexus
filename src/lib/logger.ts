/**
 * Simple logger utility for the Nexus application
 * Provides environment-aware logging with debug level support
 */

export const logger = {
  isDebugEnabled: () => process.env.NODE_ENV === 'development',
  
  /**
   * Debug-level logging - only enabled in development
   * Use for debugging information that should not appear in production
   */
  debug: (...args: unknown[]) => {
    if (logger.isDebugEnabled()) {
      console.log(...args);
    }
  },
  
  /**
   * Info-level logging - appears in all environments
   * Use for important operational information
   */
  info: (...args: unknown[]) => {
    console.log(...args);
  },
  
  /**
   * Warn-level logging - appears in all environments
   * Use for warnings and potential issues
   */
  warn: (...args: unknown[]) => {
    console.warn(...args);
  },
  
  /**
   * Error-level logging - appears in all environments
   * Use for errors and failures
   */
  error: (...args: unknown[]) => {
    console.error(...args);
  },
  
  /**
   * Redacts sensitive information from logs
   * Replaces sensitive strings with [REDACTED]
   */
  redact: (text: string, sensitiveTerms: string[]): string => {
    let redactedText = text;
    for (const term of sensitiveTerms) {
      if (term && term.length > 0) {
        const regex = new RegExp(term, 'gi');
        redactedText = redactedText.replace(regex, '[REDACTED]');
      }
    }
    return redactedText;
  },
  
  /**
   * Creates a metadata-only log for sensitive data
   * Instead of logging the actual content, logs hash/length/metadata
   */
  metadata: (label: string, data: unknown): void => {
    const metadata = {
      length: typeof data === 'string' ? data.length : undefined,
      type: typeof data,
      isEmpty: data === null || data === undefined || data === '',
      timestamp: new Date().toISOString(),
    };
    logger.debug(`[METADATA] ${label}:`, metadata);
  }
};