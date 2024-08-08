import { createApplicationLogger, rewriteFieldsFormatter } from '@commercetools-backend/loggers';
import { readConfiguration } from './config.utils';
import { toBoolean } from 'validator';
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
  level: toBoolean(readConfiguration().mollie.debug ?? '0', true) ? 'debug' : 'info',

  formatters: [
    rewriteFieldsFormatter({
      fields: [{ from: 'message', to: 'message', replaceValue: (value) => `[${VERSION_STRING}] - ${value}` }],
    }),
  ],
});
