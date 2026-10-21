/**
 * URL validation utilities to prevent unsafe protocols (javascript:, data:, etc.)
 * Strictly allows http: and https: protocols for external applications and resources.
 */
export const isValidHttpUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};
