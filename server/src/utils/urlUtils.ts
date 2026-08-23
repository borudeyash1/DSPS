import path from 'path';

/**
 * Get the base URL for the application
 * In production: https://ecom.sartthi.com
 * In development: http://localhost:5000
 */
export const getBaseUrl = (): string => {
    return process.env.BASE_URL || process.env.API_URL || 'http://localhost:5000';
};

/**
 * Convert a relative upload path to a full URL
 * @param relativePath - Path like "/uploads/images/products/..."
 * @returns Full URL like "https://ecom.sartthi.com/uploads/images/products/..."
 */
export const getFullImageUrl = (relativePath: string): string => {
    if (!relativePath) return '';

    // If it's already a full URL, return as is
    if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
        return relativePath;
    }

    // If it's a Google Drive URL
    if (relativePath.includes('drive.google.com')) {
        return relativePath;
    }

    const baseUrl = getBaseUrl();

    // Remove leading slash if present
    const cleanPath = relativePath.startsWith('/') ? relativePath.substring(1) : relativePath;

    return `${baseUrl}/${cleanPath}`;
};

/**
 * Get relative path from full URL
 * @param fullUrl - Full URL like "https://ecom.sartthi.com/uploads/..."
 * @returns Relative path like "/uploads/..."
 */
export const getRelativePath = (fullUrl: string): string => {
    if (!fullUrl) return '';

    // If it's already a relative path
    if (fullUrl.startsWith('/')) {
        return fullUrl;
    }

    // Extract path from full URL
    if (fullUrl.includes('/uploads/')) {
        const parts = fullUrl.split('/uploads/');
        return `/uploads/${parts[1]}`;
    }

    return fullUrl;
};
