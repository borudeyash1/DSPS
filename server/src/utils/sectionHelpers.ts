// Helper function to get max blogs allowed for a section type
export const getMaxBlogsForSectionType = (sectionType: string): number => {
    const typeMap: Record<string, number> = {
        'blog-grid': 999, // Unlimited (using large number)
        'blog-grid-uneven-2': 2,
        'blog-grid-uneven-3': 3,
        'blog-single-row': 4,
        // Add more mappings as needed
    };

    return typeMap[sectionType] || 999; // Default to unlimited
};
