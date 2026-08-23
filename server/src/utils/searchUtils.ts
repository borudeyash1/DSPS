import Fuse from 'fuse.js';
import type { IFuseOptions } from 'fuse.js';

/**
 * Utility to build robust MongoDB search queries with fuzzy matching
 */

/**
 * Escapes special characters in string for regex
 */
export const escapeRegex = (text: string): string => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

/**
 * Builds a search query that matches ALL terms in the search string
 * against ANY of the specified fields.
 * 
 * Example:
 * search = "blue shirt"
 * fields = ["name", "description"]
 * 
 * Result:
 * {
 *   $and: [
 *     { $or: [{ name: /blue/i }, { description: /blue/i }] },
 *     { $or: [{ name: /shirt/i }, { description: /shirt/i }] }
 *   ]
 * }
 */
export const buildSearchQuery = (search: string, fields: string[]): any => {
    if (!search || !fields.length) return {};

    const terms = search.trim().split(/\s+/).filter(term => term.length > 0);

    if (terms.length === 0) return {};

    const andConditions = terms.map(term => {
        const regex = new RegExp(escapeRegex(term), 'i');
        const orConditions = fields.map(field => ({
            [field]: { $regex: regex }
        }));

        return { $or: orConditions };
    });

    return { $and: andConditions };
};

/**
 * Fuzzy search using Fuse.js for typo-tolerant product search
 * Handles: typos, partial matches, phonetic errors
 * 
 * @param products - Array of products to search through
 * @param searchQuery - User's search query (can have typos)
 * @param options - Fuse.js configuration options
 * @returns Ranked array of matching products
 */
export const fuzzySearch = (
    products: any[],
    searchQuery: string,
    options?: Partial<IFuseOptions<any>>
): any[] => {
    if (!searchQuery || !products.length) return products;

    const defaultOptions: IFuseOptions<any> = {
        // Keys to search in (with weights)
        keys: [
            { name: 'name', weight: 2 },           // Product name is most important
            { name: 'category', weight: 1.5 },     // Category is important
            { name: 'subcategory', weight: 1.2 },  // Subcategory
            { name: 'description', weight: 0.8 },  // Description less important
            { name: 'colorVariants.color', weight: 0.5 },
            { name: 'variants.sku', weight: 0.3 }
        ],
        
        // Fuzzy matching settings
        threshold: 0.4,           // 0.0 = perfect match, 1.0 = match anything (0.4 is good balance)
        distance: 100,            // Maximum distance for fuzzy matching
        minMatchCharLength: 2,    // Minimum characters to match
        
        // Search behavior
        includeScore: true,       // Include relevance score
        useExtendedSearch: true,  // Enable advanced search patterns
        ignoreLocation: true,     // Don't care where in the string match occurs
        
        // Performance
        shouldSort: true,         // Sort by relevance
        findAllMatches: false,    // Stop at first match per field
        
        ...options
    };

    const fuse = new Fuse(products, defaultOptions);
    const results = fuse.search(searchQuery);

    // Return products sorted by relevance score
    return results.map(result => result.item);
};

/**
 * Enhanced search that combines MongoDB query with fuzzy matching
 * First does a broad MongoDB search, then applies fuzzy ranking
 * 
 * @param allProducts - All products from MongoDB
 * @param searchQuery - User's search query
 * @param mongoFilter - MongoDB filter object
 * @returns Ranked products
 */
export const hybridSearch = (
    allProducts: any[],
    searchQuery: string,
    mongoFilter: any = {}
): any[] => {
    // If no search query, return all products matching filter
    if (!searchQuery) {
        return allProducts;
    }

    // Apply fuzzy search on the filtered products
    return fuzzySearch(allProducts, searchQuery);
};

/**
 * Common typo corrections and synonyms
 * Can be expanded based on your product catalog
 */
export const SEARCH_SYNONYMS: Record<string, string[]> = {
    'mobile': ['phone', 'smartphone', 'cell'],
    'phone': ['mobile', 'smartphone'],
    'headphone': ['headset', 'earphone', 'earbuds'],
    'bluetooth': ['bt', 'wireless'],
    'shirt': ['tshirt', 't-shirt', 'top'],
    'pant': ['trouser', 'jeans', 'bottom'],
    'shoe': ['footwear', 'sneaker', 'boot'],
    'watch': ['timepiece', 'smartwatch'],
};

/**
 * Expand search query with synonyms
 */
export const expandQueryWithSynonyms = (query: string): string => {
    const terms = query.toLowerCase().split(/\s+/);
    const expandedTerms = new Set(terms);

    terms.forEach(term => {
        // Check if term has synonyms
        for (const [key, synonyms] of Object.entries(SEARCH_SYNONYMS)) {
            if (key === term || synonyms.includes(term)) {
                synonyms.forEach(syn => expandedTerms.add(syn));
                expandedTerms.add(key);
            }
        }
    });

    return Array.from(expandedTerms).join(' ');
};
