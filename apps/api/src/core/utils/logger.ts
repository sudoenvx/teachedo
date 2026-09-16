import { createLogger, format, transports } from 'winston'
import { AppConfig } from '../config/server.config';
import type TransportStream from 'winston-transport';

// Define log levels and colors
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
  },
  colors: {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'blue',
  },
};


const logger = createLogger({
  levels: customLevels.levels,
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.json()
  ),
  transports: (
    [
      AppConfig.environment == 'development' ? new transports.Console({
        format: format.combine(
          format.colorize(),
          format.cli(),
        ),
      }) : undefined,
      // Log to a file in all environments
      new transports.File({
        filename: 'logs/error.log',
        level: 'error',
        format: format.combine(
          format.colorize(),
          format.simple(),
        ),
      }),

      new transports.File({
        filename: 'logs/info.log',
        level: 'info',
        format: format.combine(
          format.colorize(),
          format.simple(),
        )
      }),

      new transports.File({
        filename: 'logs/combined.log',

      }),
    ].filter(Boolean) as TransportStream[]
  ),
});


export default logger;
