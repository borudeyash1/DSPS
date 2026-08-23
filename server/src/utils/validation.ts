/**
 * Input Validation and Sanitization Utilities
 * Protects against XSS, SQL Injection, NoSQL Injection, and DoS attacks
 */

// Maximum lengths for various fields (prevents DoS via large payloads)
export const MAX_LENGTHS = {
    STREET: 200,
    CITY: 100,
    STATE: 100,
    PINCODE: 10,
    COUNTRY: 100,
    COUPON_CODE: 50,
    NOTES: 500,
    PHONE: 20,
    NAME: 100,
    EMAIL: 254, // RFC 5321
};

/**
 * Sanitize string input - removes dangerous characters
 * Prevents XSS and injection attacks
 */
export const sanitizeString = (input: string, maxLength: number): string => {
    if (typeof input !== 'string') {
        return '';
    }

    // Remove null bytes (can cause issues in some databases)
    let sanitized = input.replace(/\0/g, '');

    // Remove control characters except newlines and tabs
    sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

    // Remove HTML tags to prevent XSS
    sanitized = sanitized.replace(/<[^>]*>/g, '');

    // Remove script tags specifically (extra protection)
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove javascript: protocol
    sanitized = sanitized.replace(/javascript:/gi, '');

    // Remove on* event handlers
    sanitized = sanitized.replace(/on\w+\s*=/gi, '');

    // Trim whitespace
    sanitized = sanitized.trim();

    // Enforce maximum length
    if (sanitized.length > maxLength) {
        sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
};

/**
 * Validate and sanitize address field
 */
export const sanitizeAddress = (address: string, maxLength: number): string => {
    const sanitized = sanitizeString(address, maxLength);
    
    // Additional validation: must contain at least some alphanumeric characters
    if (!/[a-zA-Z0-9]/.test(sanitized)) {
        throw new Error('Address must contain valid characters');
    }

    return sanitized;
};

/**
 * Validate and sanitize pincode
 */
export const sanitizePincode = (pincode: string): string => {
    const sanitized = sanitizeString(pincode, MAX_LENGTHS.PINCODE);
    
    // Must be numeric (Indian pincode format)
    if (!/^\d{6}$/.test(sanitized)) {
        throw new Error('Invalid pincode format. Must be 6 digits.');
    }

    return sanitized;
};

/**
 * Validate and sanitize coupon code
 */
export const sanitizeCouponCode = (code: string): string => {
    const sanitized = sanitizeString(code, MAX_LENGTHS.COUPON_CODE).toUpperCase();
    
    // Coupon codes should only contain alphanumeric and hyphens
    if (!/^[A-Z0-9-]+$/.test(sanitized)) {
        throw new Error('Invalid coupon code format');
    }

    return sanitized;
};

/**
 * Validate shipping address object
 */
export interface ShippingAddress {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export const validateAndSanitizeShippingAddress = (address: any): ShippingAddress => {
    if (!address || typeof address !== 'object') {
        throw new Error('Invalid address format');
    }

    // Validate required fields exist
    const requiredFields = ['street', 'city', 'state', 'pincode', 'country'];
    for (const field of requiredFields) {
        if (!address[field] || typeof address[field] !== 'string') {
            throw new Error(`Missing or invalid ${field}`);
        }
    }

    // Sanitize and validate each field
    const sanitized: ShippingAddress = {
        street: sanitizeAddress(address.street, MAX_LENGTHS.STREET),
        city: sanitizeAddress(address.city, MAX_LENGTHS.CITY),
        state: sanitizeAddress(address.state, MAX_LENGTHS.STATE),
        pincode: sanitizePincode(address.pincode),
        country: sanitizeAddress(address.country, MAX_LENGTHS.COUNTRY),
    };

    // Additional validation: ensure minimum lengths
    if (sanitized.street.length < 5) {
        throw new Error('Street address too short');
    }
    if (sanitized.city.length < 2) {
        throw new Error('City name too short');
    }
    if (sanitized.state.length < 2) {
        throw new Error('State name too short');
    }

    return sanitized;
};

/**
 * Validate order items array
 */
export const validateOrderItems = (items: any[]): void => {
    if (!Array.isArray(items)) {
        throw new Error('Items must be an array');
    }

    if (items.length === 0) {
        throw new Error('Order must contain at least one item');
    }

    // Prevent DoS via too many items
    if (items.length > 100) {
        throw new Error('Too many items in order');
    }

    for (const item of items) {
        // Validate item structure
        if (!item.productId || typeof item.productId !== 'string') {
            throw new Error('Invalid product ID');
        }

        if (!item.quantity || typeof item.quantity !== 'number' || item.quantity < 1 || item.quantity > 999) {
            throw new Error('Invalid quantity');
        }

        // Validate size and color if present
        if (item.size && typeof item.size === 'string') {
            if (item.size.length > 20) {
                throw new Error('Invalid size');
            }
        }

        if (item.color && typeof item.color === 'string') {
            if (item.color.length > 50) {
                throw new Error('Invalid color');
            }
        }
    }
};

/**
 * Validate payment method
 */
export const validatePaymentMethod = (method: string): 'cod' | 'online' => {
    const sanitized = sanitizeString(method, 20).toLowerCase();
    
    if (sanitized !== 'cod' && sanitized !== 'online') {
        throw new Error('Invalid payment method');
    }

    return sanitized as 'cod' | 'online';
};

/**
 * Rate limiting helper - track requests per IP
 */
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (ip: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const record = requestCounts.get(ip);

    if (!record || now > record.resetTime) {
        // New window
        requestCounts.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (record.count >= maxRequests) {
        return false; // Rate limit exceeded
    }

    record.count++;
    return true;
};

/**
 * Clean up old rate limit records (call periodically)
 */
export const cleanupRateLimits = (): void => {
    const now = Date.now();
    for (const [ip, record] of requestCounts.entries()) {
        if (now > record.resetTime) {
            requestCounts.delete(ip);
        }
    }
};

// Clean up every 5 minutes
setInterval(cleanupRateLimits, 5 * 60 * 1000);
