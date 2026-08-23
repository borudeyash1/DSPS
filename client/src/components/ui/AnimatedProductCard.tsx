import { motion } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';
import { useState } from 'react';

interface AnimatedProductCardProps {
    product: {
        _id?: string;
        id?: string;
        name: string;
        price: number;
        discountPrice?: number;
        image: string;
        badge?: string;
    };
    onAddToCart?: () => void;
    onToggleWishlist?: () => void;
    onClick?: () => void;
    index?: number;
}

const cardVariants = {
    rest: {
        scale: 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
    },
    hover: {
        scale: 1.02,
        boxShadow: '0 8px 16px rgba(0,0,0,0.12)',
        border: '1px solid #d1d5db',
        transition: {
            duration: 0.2,
            ease: 'easeOut' as const,
        },
    },
};

const imageVariants = {
    rest: { scale: 1 },
    hover: {
        scale: 1.05,
        transition: {
            duration: 0.3,
            ease: 'easeOut' as const,
        },
    },
};

const buttonVariants = {
    rest: { opacity: 0, y: 10 },
    hover: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.2,
            ease: 'easeOut' as const,
        },
    },
};

export const AnimatedProductCard = ({
    product,
    onAddToCart,
    onToggleWishlist,
    onClick,

}: AnimatedProductCardProps) => {
    const [isWishlisted, setIsWishlisted] = useState(false);

    const handleWishlistToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsWishlisted(!isWishlisted);
        onToggleWishlist?.();
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart?.();
    };

    const discount = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    return (
        <motion.div
            initial="rest"
            whileHover="hover"
            animate="rest"
            variants={cardVariants}
            className="bg-white rounded-lg overflow-hidden cursor-pointer group relative border border-gray-300"
            onClick={onClick}
        >
            {/* Badge */}
            {product.badge && (
                <div className="absolute top-3 left-3 z-20 bg-black text-white text-xs px-3 py-1 font-semibold">
                    {product.badge}
                </div>
            )}

            {/* Discount Badge */}
            {discount > 0 && (
                <div className="absolute top-3 right-3 z-20 bg-accent text-white text-xs px-2 py-1 font-bold rounded">
                    {discount}% OFF
                </div>
            )}

            {/* Wishlist Button */}
            <button
                onClick={handleWishlistToggle}
                className="absolute top-3 right-3 z-20 p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
            >
                <Heart
                    className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                />
            </button>

            {/* Product Image */}
            <div className="aspect-square overflow-hidden bg-gray-100 relative">
                <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    variants={imageVariants}
                />
            </div>

            {/* Product Info */}
            <div className="p-4">
                <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[40px]">
                    {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                    {product.discountPrice ? (
                        <>
                            <span className="text-lg font-bold">₹{product.discountPrice}</span>
                            <span className="text-sm text-gray-400 line-through">
                                ₹{product.price}
                            </span>
                        </>
                    ) : (
                        <span className="text-lg font-bold">₹{product.price}</span>
                    )}
                </div>

                {/* Add to Cart Button - Appears on Hover */}
                <motion.button
                    variants={buttonVariants}
                    onClick={handleAddToCart}
                    className="w-full py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                >
                    <ShoppingCart className="w-4 h-4" />
                    ADD TO BAG
                </motion.button>
            </div>
        </motion.div>
    );
};
