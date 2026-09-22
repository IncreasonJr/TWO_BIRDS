/**
 * Validates whether an email address is a valid university email ending with .edu or .edu.gh.
 * Case-insensitive (accepts .edu, .EDU, .edu.gh, .EDU.GH, etc.).
 */
export function isValidEduEmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim();
  // Standard email format ending with .edu or .edu.gh
  const eduRegex = /^[^\s@]+@[^\s@]+\.(?:edu|edu\.gh)$/i;
  return eduRegex.test(trimmed);
}
