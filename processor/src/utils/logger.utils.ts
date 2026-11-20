import { createApplicationLogger, rewriteFieldsFormatter } from '@commercetools-backend/loggers';
import { readConfiguration } from './config.utils';
import { toBoolean } from 'validator';
import { VERSION_STRING } from './constant.utils';

type LogFormat = ReturnType<typeof rewriteFieldsFormatter>;

const SENSITIVE_LOG_KEYS = new Set([
  'cardToken',
  'applePayPaymentToken',
  'email',
  'billingEmail',
  'billingAddress',
  'shippingAddress',
  'sctm_create_payment_request',
  'sctm_apple_pay_session_response',
  'sctm_request',
  'sctm_response',
]);

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  Object.prototype.toString.call(value) === '[object Object]';

const redactEntries = (value: Record<string, unknown>, ancestors: WeakSet<object>) =>
  Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [
      key,
      SENSITIVE_LOG_KEYS.has(key) ? '[REDACTED]' : redact(nested, ancestors),
    ]),
  );

const redact = (value: unknown, ancestors = new WeakSet<object>()): unknown => {
  if (!Array.isArray(value) && !isPlainObject(value)) {
    return value;
  }

  if (ancestors.has(value)) {
    return '[Circular]';
  }

  ancestors.add(value);
  const redacted = Array.isArray(value)
    ? value.map((item) => redact(item, ancestors))
    : redactEntries(value, ancestors);
  ancestors.delete(value);

  return redacted;
};

export const redactSensitiveFieldsFormatter: LogFormat = {
  transform: (info) => ({ ...info, ...(redact(info) as object) }),
};

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
    redactSensitiveFieldsFormatter,
    rewriteFieldsFormatter({
      fields: [{ from: 'message', to: 'message', replaceValue: (value) => `[${VERSION_STRING}] - ${value}` }],
    }),
  ],
  json: true,
});
