/**
 * Validates whether an email address is a valid university email ending with .edu.
 * Case-insensitive (accepts .edu, .EDU, etc.).
 */
export function isValidEduEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  // Standard email format ending with .edu
  const eduRegex = /^[^\s@]+@[^\s@]+\.edu$/i;
  return eduRegex.test(trimmed);
}
