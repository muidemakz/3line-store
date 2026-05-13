import winston from 'winston';
import { env } from './env';

const { combine, timestamp, colorize, printf, json, errors } = winston.format;

// Custom log format for console
const consoleFormat = printf(({ level, message, timestamp, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${timestamp} [${level}]: ${stack ?? message}${metaStr}`;
});

const logger = winston.createLogger({
  level: env.LOG_LEVEL,
  defaultMeta: { service: 'palliative-api' },
  transports: [
    // Console — human-readable in development, JSON in production
    new winston.transports.Console({
      format:
        env.NODE_ENV === 'production'
          ? combine(timestamp(), errors({ stack: true }), json())
          : combine(
              colorize({ all: true }),
              timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
              errors({ stack: true }),
              consoleFormat,
            ),
    }),
  ],
});

// Silence logger during tests
if (env.NODE_ENV === 'test') {
  logger.silent = true;
}

export { logger };
