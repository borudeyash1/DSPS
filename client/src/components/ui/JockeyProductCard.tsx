import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Star } from 'lucide-react';
import { useState, useRef, useMemo, useEffect } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { Product } from '../../types';
import { useToastStore } from '../../store/toastStore';

interface JockeyProductCardProps {
    product: Product;
    onClick?: (e?: React.MouseEvent) => void;
}

export const JockeyProductCard = ({ product, onClick }: JockeyProductCardProps) => {
    const navigate = useNavigate();
    const { addItem, openCart } = useCartStore();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
    const { showToast } = useToastStore();

    // Track selected color variant
    const [selectedColorIndex, setSelectedColorIndex] = useState(0);

    // Helper function to get color hex from color name
    const getColorHex = (colorName: string, colorHex?: string): string => {
        if (colorHex) return colorHex;

        // Common color mappings
        const colorMap: Record<string, string> = {
            'black': '#000000',
            'white': '#FFFFFF',
            'red': '#FF0000',
            'blue': '#0000FF',
            'green': '#00FF00',
            'yellow': '#FFFF00',
            'purple': '#800080',
            'pink': '#FFC0CB',
            'orange': '#FFA500',
            'brown': '#A52A2A',
            'gray': '#808080',
            'grey': '#808080',
            'navy': '#000080',
            'beige': '#F5F5DC',
            'maroon': '#800000',
            'olive': '#808000',
            'cyan': '#00FFFF',
            'magenta': '#FF00FF',
        };

        const lowerColor = colorName.toLowerCase();
        return colorMap[lowerColor] || '#CCCCCC';
    };

    // Get color variants
    const colorVariants = product.colorVariants || [];
    const currentVariant = colorVariants.length > 0 ? colorVariants[selectedColorIndex] : null;

    // Determine which image to display
    const displayImage = currentVariant?.images?.find(img => img.view === 'front')?.url
        || currentVariant?.images?.[0]?.url
        || product.images?.[0]?.url
        || (product as any).image
        || 'https://via.placeholder.com/400x500';

    // Slideshow Logic
    const [isSlideshowActive, setIsSlideshowActive] = useState(false);
    const [slideshowIndex, setSlideshowIndex] = useState(0);
    const hoverTimerRef = useRef<any>(null);
    const slideshowIntervalRef = useRef<any>(null);

    // Get all valid images for the current slideshow
    const slideshowImages = useMemo(() => {
        const images = currentVariant?.images?.map(img => img.url)
            || product.images?.map(img => img.url)
            || [(product as any).image];
        return images?.filter(Boolean) || [];
    }, [currentVariant, product]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
            if (slideshowIntervalRef.current) clearInterval(slideshowIntervalRef.current);
        };
    }, []);

    const handleMouseEnter = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);

        // Preload images immediately on hover
        if (slideshowImages.length > 1) {
            slideshowImages.forEach((src) => {
                const img = new Image();
                img.src = src;
            });
        }

        hoverTimerRef.current = setTimeout(() => {
            setIsSlideshowActive(true);
            slideshowIntervalRef.current = setInterval(() => {
                setSlideshowIndex((prev) => (prev + 1) % slideshowImages.length);
            }, 1200);
        }, 1000);
    };

    const handleMouseLeave = () => {
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
        if (slideshowIntervalRef.current) clearInterval(slideshowIntervalRef.current);
        setIsSlideshowActive(false);
        setSlideshowIndex(0);
    };

    const imageToShow = (isSlideshowActive && slideshowImages.length > 1)
        ? slideshowImages[slideshowIndex]
        : displayImage;

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Add default variant
        const defaultSize = product.sizes?.[0] || 'M';
        const selectedColor = currentVariant?.color || product.colors?.[0] || 'Default';

        addItem(product, 1, defaultSize, selectedColor);
        showToast('Product added to cart!', 'success');
        openCart(); // Open the side drawer
    };

    const handleWishlist = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            if (isInWishlist(product._id!)) {
                await removeFromWishlist(product._id!);
                showToast('Removed from wishlist', 'success');
            } else {
                await addToWishlist(product._id!);
                showToast('Added to wishlist', 'success');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to update wishlist';
            if (errorMessage === 'Product already in wishlist') {
                showToast('Already in wishlist', 'info');
            } else {
                showToast(errorMessage, 'error');
            }
        }
    };

    const handleColorClick = (e: React.MouseEvent, index: number) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedColorIndex(index);
    };

    const handleCardClick = (e: React.MouseEvent) => {
        if (onClick) {
            onClick(e);
            return;
        }

        const selectedColor = currentVariant?.color || '';
        const url = selectedColor
            ? `/product/${product._id}?color=${encodeURIComponent(selectedColor)}`
            : `/product/${product._id}`;
        navigate(url);
    };

    // Calculate discount percentage
    const discountPercent = product.discountPrice
        ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
        : 0;

    return (
        <motion.div
            className="group relative bg-white rounded-xl overflow-hidden border border-gray-300 hover:border-gray-400 hover:shadow-xl transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleCardClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {/* Image Container */}
            <div className="relative aspect-[3/4] bg-gray-50 overflow-hidden cursor-pointer">
                <img
                    src={imageToShow}
                    alt={product.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {(product as any).badge && (
                        <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                            {(product as any).badge}
                        </span>
                    )}
                    {discountPercent > 0 && (
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider rounded-sm">
                            {discountPercent}% OFF
                        </span>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={handleWishlist}
                    className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors z-10"
                >
                    <Heart
                        className={`w-4 h-4 ${isInWishlist(product._id!) ? 'fill-red-500 text-red-500' : 'text-gray-600'}`}
                    />
                </button>

                {/* Color Count Overlay (Jockey Style) */}
                {colorVariants.length > 0 && (
                    <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow-sm text-xs font-bold text-gray-700">
                        <span className="w-4 h-4 rounded bg-gray-800 border border-white shadow-sm flex items-center justify-center text-[8px] text-white">
                            {colorVariants.length}
                        </span>
                        <span>Colors</span>
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-4">
                {/* ID/SKU - Simulated */}
                <p className="text-[10px] font-bold text-gray-400 mb-1">
                    #{product._id!.toString().slice(-4).toUpperCase()}
                </p>

                {/* Title */}
                <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 min-h-[40px] leading-relaxed">
                    {product.name}
                </h3>

                {/* Color Swatches */}
                {colorVariants.length > 0 && (
                    <div className="flex gap-1.5 mb-3">
                        {colorVariants.map((variant, index) => (
                            <button
                                key={index}
                                onClick={(e) => handleColorClick(e, index)}
                                className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${index === selectedColorIndex
                                    ? 'border-black ring-2 ring-offset-1 ring-black'
                                    : 'border-gray-300 hover:border-gray-400'
                                    }`}
                                style={{ backgroundColor: getColorHex(variant.color, variant.colorHex) }}
                                title={variant.color}
                            />
                        ))}
                    </div>
                )}

                {/* Price & Rating Row */}
                <div className="flex flex-col gap-3 mt-3">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            {product.discountPrice ? (
                                <>
                                    <span className="text-lg font-bold text-gray-900">₹{product.discountPrice}</span>
                                    <span className="text-xs text-gray-500 line-through decoration-gray-400">₹{product.price}</span>
                                </>
                            ) : (
                                <span className="text-lg font-bold text-gray-900">₹{product.price}</span>
                            )}
                        </div>

                        {/* Rating */}
                        {product.rating ? (
                            <div className="flex items-center gap-1 mt-1">
                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                <span className="text-xs text-gray-400">({product.reviewCount || 0})</span>
                            </div>
                        ) : (
                            <div className="h-5"></div> // Spacer
                        )}
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-gray-900 hover:bg-black text-white px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wide flex items-center justify-center gap-2 transition-all hover:shadow-lg transform active:scale-95 whitespace-nowrap"
                    >
                        <ShoppingBag size={14} />
                        ADD TO CART
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
