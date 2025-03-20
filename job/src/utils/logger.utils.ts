import {
  createApplicationLogger,
  rewriteFieldsFormatter,
} from '@commercetools-backend/loggers';
import { VERSION_STRING } from './constant.utils';

/**
 * Create a logger instance with the appropriate log level based on the configuration.
 *
 * @returns {Object} The logger instance.
 */
export const logger = createApplicationLogger({
  /**
   * The log level to use.
   *
   * @type {string}
   */
  level: 'debug',

  formatters: [
    rewriteFieldsFormatter({
      fields: [
        {
          from: 'message',
          to: 'message',
          replaceValue: (value) => `[${VERSION_STRING}] - ${value}`,
        },
      ],
    }),
  ],
  json: true,
});
