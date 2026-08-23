/**
 * Input Sanitization Utility
 * Protects against XSS, SQL Injection, Command Injection, and other input vulnerabilities
 */

/**
 * Sanitize string input to prevent XSS attacks
 * Removes HTML tags and dangerous characters
 */
export const sanitizeString = (input: string): string => {
  if (!input || typeof input !== 'string') return '';

  return input
    .trim()
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Remove data: protocol
    .replace(/data:/gi, '')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Sanitize email input
 * Ensures email format and removes dangerous characters
 */
export const sanitizeEmail = (email: string): string => {
  if (!email || typeof email !== 'string') return '';

  return email
    .toLowerCase()
    .trim()
    // Remove any characters that aren't valid in emails
    .replace(/[^a-z0-9@._+-]/gi, '')
    // Remove multiple @ symbols (keep only first)
    .replace(/(@.*?)@/g, '$1')
    // Remove leading/trailing dots
    .replace(/^\.+|\.+$/g, '')
    // Remove consecutive dots
    .replace(/\.{2,}/g, '.')
    .slice(0, 254); // Max email length per RFC 5321
};

/**
 * Sanitize phone number
 * Allows only numbers, +, -, spaces, and parentheses
 */
export const sanitizePhone = (phone: string): string => {
  if (!phone || typeof phone !== 'string') return '';

  return phone
    .trim()
    // Remove any characters except numbers, +, -, spaces, parentheses, and dots
    .replace(/[^0-9+\-\s().]/g, '')
    // Remove multiple consecutive spaces
    .replace(/\s{2,}/g, ' ')
    .slice(0, 20); // Reasonable max length for phone numbers
};

/**
 * Sanitize name input
 * Allows only letters, spaces, hyphens, and apostrophes
 */
export const sanitizeName = (name: string): string => {
  if (!name || typeof name !== 'string') return '';

  return name
    .trim()
    // Remove numbers and special characters except spaces, hyphens, and apostrophes
    .replace(/[^a-zA-Z\s'-]/g, '')
    // Remove multiple consecutive spaces
    .replace(/\s{2,}/g, ' ')
    // Remove leading/trailing special characters
    .replace(/^['-]+|['-]+$/g, '')
    .slice(0, 100); // Reasonable max length for names
};

/**
 * Sanitize password input
 * Removes null bytes and control characters but preserves special characters
 */
export const sanitizePassword = (password: string): string => {
  if (!password || typeof password !== 'string') return '';

  return password
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newline and tab
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .slice(0, 128); // Max password length
};

/**
 * Sanitize OTP input
 * Allows only 6 digits
 */
export const sanitizeOTP = (otp: string): string => {
  if (!otp || typeof otp !== 'string') return '';

  return otp
    .replace(/\D/g, '') // Remove non-digits
    .slice(0, 6); // Max 6 digits
};

/**
 * Detect potential SQL injection patterns
 */
export const detectSQLInjection = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;

  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|(--)|;|\/\*|\*\/|\bOR\b|\bAND\b).*?=/gi,
    /(UNION.*SELECT|SELECT.*FROM|INSERT.*INTO|DELETE.*FROM)/gi,
  ];

  return sqlPatterns.some(pattern => pattern.test(input));
};

/**
 * Detect potential command injection patterns
 */
export const detectCommandInjection = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;

  const commandPatterns = [
    /[;&|`$(){}[\]<>]/g,
    /(\.\.|\/etc\/|\/bin\/|\/usr\/)/gi,
  ];

  return commandPatterns.some(pattern => pattern.test(input));
};

/**
 * Detect potential XSS patterns
 */
export const detectXSS = (input: string): boolean => {
  if (!input || typeof input !== 'string') return false;

  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Comprehensive input validation
 * Returns true if input is safe, false if potentially malicious
 */
export const validateInput = (input: string, type: 'email' | 'name' | 'phone' | 'password' | 'otp' | 'general' = 'general'): {
  isValid: boolean;
  error?: string;
  sanitized: string;
} => {
  if (!input) {
    return { isValid: false, error: 'Input is required', sanitized: '' };
  }

  // Check for SQL injection (skip for password as it may contain special chars)
  if (type !== 'password' && detectSQLInjection(input)) {
    console.error('SQL Injection detected in:', type, input);
    return { isValid: false, error: `Invalid input detected (SQL) in ${type}`, sanitized: '' };
  }

  // Check for command injection (except in passwords where special chars are allowed)
  if (type !== 'password' && detectCommandInjection(input)) {
    console.error('Command Injection detected in:', type, input);
    return { isValid: false, error: `Invalid characters detected in ${type}`, sanitized: '' };
  }

  // Check for XSS (skip for password)
  if (type !== 'password' && detectXSS(input)) {
    console.error('XSS detected in:', type, input);
    return { isValid: false, error: `Invalid input detected (XSS) in ${type}`, sanitized: '' };
  }

  // Sanitize based on type
  let sanitized = '';
  switch (type) {
    case 'email':
      sanitized = sanitizeEmail(input);
      break;
    case 'name':
      sanitized = sanitizeName(input);
      break;
    case 'phone':
      sanitized = sanitizePhone(input);
      break;
    case 'password':
      sanitized = sanitizePassword(input);
      break;
    case 'otp':
      sanitized = sanitizeOTP(input);
      break;
    default:
      sanitized = sanitizeString(input);
  }

  return { isValid: true, sanitized };
};

/**
 * Escape HTML to prevent XSS when displaying user input
 */
export const escapeHTML = (text: string): string => {
  if (!text || typeof text !== 'string') return '';

  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};
