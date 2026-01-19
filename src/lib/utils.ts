/**
 * Escapes HTML special characters to prevent XSS attacks
 * @param str - String to escape
 * @returns Escaped string safe for HTML interpolation
 */
export const escapeHtml = (str: unknown): string => {
  if (str === null || str === undefined) {
    return '';
  }
  
  const stringified = String(str);
  const entityMap: Record<string, string> = {
    '&': '&',
    '<': '<',
    '>': '>',
    '"': '"',
    "'": "'",
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return stringified.replace(/[&<>"'`=\/]/g, function (s) {
    return entityMap[s];
  });
};

/**
 * Combines multiple class names into a single string
 * @param inputs - Class names to combine
 * @returns Combined class names as a string
 */
export const cn = (...inputs: (string | undefined | null | false)[]): string => {
  return inputs.filter(Boolean).join(' ');
};

/**
 * Validates and sanitizes a URL
 * @param urlStr - URL string to validate
 * @param allowedProtocols - Array of allowed protocols (defaults to ['https:'])
 * @returns Validated and sanitized URL or null if invalid
 */
export const validateAndSanitizeUrl = (urlStr: unknown, allowedProtocols: string[] = ['https:']): string | null => {
  if (typeof urlStr !== 'string' || !urlStr.trim()) {
    return null;
  }
 
  try {
    const url = new URL(urlStr);
     
    // Check if the protocol is in the allowed list
    if (!allowedProtocols.includes(url.protocol)) {
      return null;
    }
     
    // Return the normalized URL
    return url.toString();
  } catch (error) {
    // If URL parsing fails, return null
    return null;
  }
};
