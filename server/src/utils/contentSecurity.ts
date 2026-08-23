import sanitizeHtml from 'sanitize-html';
import validator from 'validator';

// Blacklisted words/phrases (case-insensitive)
const BLACKLISTED_WORDS = [
    // Add your blacklisted words here
    'spam',
    'viagra',
    'casino',
    'porn',
    'xxx',
    // Add more as needed
];

// Suspicious patterns
const SUSPICIOUS_PATTERNS = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // Event handlers like onclick=
    /data:text\/html/gi,
    /<iframe/gi,
    /<embed/gi,
    /<object/gi,
];

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitizeHTML = (dirty: string): string => {
    if (!dirty) return '';

    // Configure sanitize-html
    const config = {
        allowedTags: [
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'p', 'br', 'hr',
            'strong', 'em', 'u', 's', 'del', 'ins', 'mark', 'sub', 'sup',
            'ul', 'ol', 'li',
            'blockquote', 'pre', 'code',
            'a', 'img',
            'table', 'thead', 'tbody', 'tr', 'th', 'td',
            'div', 'span',
        ],
        allowedAttributes: {
            'a': ['href', 'title'],
            'img': ['src', 'alt', 'title', 'width', 'height'],
            '*': ['class', 'id']
        },
        allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    };

    return sanitizeHtml(dirty, config);
};

/**
 * Validate and sanitize blog title
 */
export const sanitizeTitle = (title: string): { isValid: boolean; sanitized: string; errors: string[] } => {
    const errors: string[] = [];

    if (!title || typeof title !== 'string') {
        errors.push('Title is required');
        return { isValid: false, sanitized: '', errors };
    }

    // Trim and limit length
    let sanitized = validator.trim(title);

    // Check length
    if (sanitized.length < 3) {
        errors.push('Title must be at least 3 characters long');
    }
    if (sanitized.length > 200) {
        errors.push('Title must not exceed 200 characters');
        sanitized = sanitized.substring(0, 200);
    }

    // Check for suspicious patterns
    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(sanitized)) {
            errors.push('Title contains suspicious content');
            break;
        }
    }

    // Check for blacklisted words
    const lowerTitle = sanitized.toLowerCase();
    for (const word of BLACKLISTED_WORDS) {
        if (lowerTitle.includes(word.toLowerCase())) {
            errors.push(`Title contains prohibited word: "${word}"`);
            break;
        }
    }

    // Escape HTML entities
    sanitized = validator.escape(sanitized);

    return {
        isValid: errors.length === 0,
        sanitized,
        errors
    };
};

/**
 * Validate and sanitize blog content (markdown)
 */
export const sanitizeContent = (content: string): { isValid: boolean; sanitized: string; errors: string[] } => {
    const errors: string[] = [];

    if (!content || typeof content !== 'string') {
        errors.push('Content is required');
        return { isValid: false, sanitized: '', errors };
    }

    let sanitized = content;

    // Check length
    if (sanitized.length < 10) {
        errors.push('Content must be at least 10 characters long');
    }
    if (sanitized.length > 100000) {
        errors.push('Content must not exceed 100,000 characters');
        sanitized = sanitized.substring(0, 100000);
    }

    // Check for excessive script tags or suspicious patterns
    const scriptMatches = sanitized.match(/<script/gi);
    if (scriptMatches && scriptMatches.length > 0) {
        errors.push('Content contains script tags');
    }

    // Check for blacklisted words in content
    const lowerContent = sanitized.toLowerCase();
    const foundBlacklistedWords: string[] = [];
    for (const word of BLACKLISTED_WORDS) {
        if (lowerContent.includes(word.toLowerCase())) {
            foundBlacklistedWords.push(word);
        }
    }
    if (foundBlacklistedWords.length > 0) {
        errors.push(`Content contains prohibited words: ${foundBlacklistedWords.join(', ')}`);
    }

    // Sanitize HTML in markdown (for HTML tags within markdown)
    // This preserves markdown syntax but sanitizes any HTML
    sanitized = sanitized.replace(/<[^>]+>/g, (match) => {
        return sanitizeHTML(match);
    });

    return {
        isValid: errors.length === 0,
        sanitized,
        errors
    };
};

/**
 * Validate and sanitize excerpt
 */
export const sanitizeExcerpt = (excerpt: string): { isValid: boolean; sanitized: string; errors: string[] } => {
    const errors: string[] = [];

    if (!excerpt || typeof excerpt !== 'string') {
        return { isValid: true, sanitized: '', errors }; // Excerpt is optional
    }

    let sanitized = validator.trim(excerpt);

    // Check length
    if (sanitized.length > 500) {
        errors.push('Excerpt must not exceed 500 characters');
        sanitized = sanitized.substring(0, 500);
    }

    // Check for suspicious patterns
    for (const pattern of SUSPICIOUS_PATTERNS) {
        if (pattern.test(sanitized)) {
            errors.push('Excerpt contains suspicious content');
            break;
        }
    }

    // Escape HTML entities
    sanitized = validator.escape(sanitized);

    return {
        isValid: errors.length === 0,
        sanitized,
        errors
    };
};

/**
 * Validate image URL
 */
export const validateImageURL = (url: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!url || typeof url !== 'string') {
        errors.push('Image URL is required');
        return { isValid: false, errors };
    }

    // Check if it's a valid URL
    if (!validator.isURL(url, { protocols: ['http', 'https'], require_protocol: true })) {
        errors.push('Invalid image URL format');
    }

    // Check for suspicious patterns in URL
    if (/javascript:/i.test(url) || /data:text\/html/i.test(url)) {
        errors.push('Image URL contains suspicious content');
    }

    // Check file extension (optional but recommended)
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasValidExtension = validExtensions.some(ext => url.toLowerCase().includes(ext));

    // Allow URLs without extensions (like CDN URLs with query params)
    // but warn if it looks suspicious
    if (!hasValidExtension && !url.includes('?') && !url.includes('thumbnail')) {
        // This is just a warning, not an error
        console.warn('Image URL does not have a common image extension:', url);
    }

    return {
        isValid: errors.length === 0,
        errors
    };
};

/**
 * Comprehensive blog validation
 */
export const validateBlogData = (data: {
    title: string;
    content: string;
    excerpt?: string;
    featuredImage: string;
    tags?: string[];
}): { isValid: boolean; sanitized: any; errors: string[] } => {
    const allErrors: string[] = [];

    // Validate title
    const titleResult = sanitizeTitle(data.title);
    if (!titleResult.isValid) {
        allErrors.push(...titleResult.errors);
    }

    // Validate content
    const contentResult = sanitizeContent(data.content);
    if (!contentResult.isValid) {
        allErrors.push(...contentResult.errors);
    }

    // Validate excerpt
    const excerptResult = sanitizeExcerpt(data.excerpt || '');
    if (!excerptResult.isValid) {
        allErrors.push(...excerptResult.errors);
    }

    // Validate featured image
    const imageResult = validateImageURL(data.featuredImage);
    if (!imageResult.isValid) {
        allErrors.push(...imageResult.errors);
    }

    // Validate tags
    let sanitizedTags: string[] = [];
    if (data.tags && Array.isArray(data.tags)) {
        sanitizedTags = data.tags
            .filter(tag => typeof tag === 'string')
            .map(tag => validator.trim(validator.escape(tag)))
            .filter(tag => tag.length > 0 && tag.length <= 50)
            .slice(0, 10); // Max 10 tags
    }

    return {
        isValid: allErrors.length === 0,
        sanitized: {
            title: titleResult.sanitized,
            content: contentResult.sanitized,
            excerpt: excerptResult.sanitized,
            featuredImage: data.featuredImage,
            tags: sanitizedTags,
        },
        errors: allErrors
    };
};

/**
 * Rate limiting helper - track blog creation attempts
 */
export const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (userId: string, maxAttempts: number = 10, windowMs: number = 60000): boolean => {
    const now = Date.now();
    const userLimit = rateLimitMap.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
        return true;
    }

    if (userLimit.count >= maxAttempts) {
        return false;
    }

    userLimit.count++;
    return true;
};
