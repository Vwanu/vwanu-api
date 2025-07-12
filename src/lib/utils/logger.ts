import winston from 'winston';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom format that includes file/group, level, timestamp, message, and error details
const logFormat = printf(({ timestamp, level, message, group, stack, ...meta }) => {
  const groupLabel = group ? `[${group}]` : '[server]';
  const metaString = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  const stackTrace = stack ? `\n${stack}` : '';
  
  return `[${level.toUpperCase()}] ${timestamp} ${groupLabel}: ${message}${metaString}${stackTrace}`;
});

// Create the base logger (console only, no file output)
const baseLogger = winston.createLogger({
  level: 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }), // This captures stack traces for errors
    colorize(),
    logFormat
  ),
  transports: [
    new winston.transports.Console()
  ],
});

// Create a logger factory function
export const createLogger = (group: string) => {
  return {
    info: (message: string, meta?: Record<string, unknown>) => {
      baseLogger.info(message, { group, ...meta });
    },
    error: (message: string, error?: Error | unknown, meta?: Record<string, unknown>) => {
      if (error instanceof Error) {
        baseLogger.error(message, { group, stack: error.stack, ...meta });
      } else if (error) {
        baseLogger.error(message, { group, error: String(error), ...meta });
      } else {
        baseLogger.error(message, { group, ...meta });
      }
    },
    warn: (message: string, meta?: Record<string, unknown>) => {
      baseLogger.warn(message, { group, ...meta });
    },
    debug: (message: string, meta?: Record<string, unknown>) => {
      baseLogger.debug(message, { group, ...meta });
    },
  };
};

// Default logger for backward compatibility
const defaultLogger = createLogger('server');

// Export both the factory function and a default logger
export default {
  info: defaultLogger.info,
  error: defaultLogger.error,
  warn: defaultLogger.warn,
  debug: defaultLogger.debug,
};

// Also export the createLogger function as the main way to use logging
export { baseLogger };
