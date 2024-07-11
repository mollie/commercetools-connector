/**
 * Generates an ISO string date
 * @returns Returns the current date converted to ISO.
 */
export function createDateNowString(): string {
  return new Date().toISOString();
}
