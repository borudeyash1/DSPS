import { motion } from 'framer-motion';

interface CategoryToggleProps {
    categories: string[];
    activeCategory: string;
    onCategoryChange: (category: string) => void;
    className?: string;
}

export const CategoryToggle = ({
    categories,
    activeCategory,
    onCategoryChange,
    className = '',
}: CategoryToggleProps) => {
    const activeIndex = categories.indexOf(activeCategory);

    return (
        <div className={`inline-flex bg-gray-200 rounded-lg p-1 relative ${className}`}>
            {/* Sliding background indicator */}
            <motion.div
                className="absolute top-1 bottom-1 bg-primary rounded-md"
                initial={false}
                animate={{
                    left: `${(activeIndex * 100) / categories.length}%`,
                    width: `${100 / categories.length}%`,
                }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 30,
                }}
                style={{
                    padding: '0.25rem',
                }}
            />

            {/* Category buttons */}
            {categories.map((category) => (
                <button
                    key={category}
                    onClick={() => onCategoryChange(category)}
                    className={`relative z-10 px-6 py-2 text-sm font-medium transition-colors duration-200 ${activeCategory === category
                        ? 'text-white'
                        : 'text-gray-700 hover:text-gray-900'
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
};
