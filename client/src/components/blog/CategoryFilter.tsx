import { useState } from 'react';

interface CategoryFilterProps {
    config: {
        categories?: string[];
    };
    onCategoryChange?: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ config, onCategoryChange }) => {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const defaultCategories = ['all', 'fashion', 'lifestyle', 'tips', 'news', 'trends', 'style'];
    const categories = config.categories && config.categories.length > 0
        ? ['all', ...config.categories]
        : defaultCategories;

    const handleCategoryClick = (category: string) => {
        setSelectedCategory(category);
        if (onCategoryChange) {
            onCategoryChange(category === 'all' ? '' : category);
        }
    };

    return (
        <div className="bg-gray-50 py-8">
            <div className="container-custom">
                <div className="flex flex-wrap justify-center gap-3">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => handleCategoryClick(category)}
                            className={`px-6 py-2 rounded-full font-medium transition-all ${selectedCategory === category
                                    ? 'bg-black text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CategoryFilter;
