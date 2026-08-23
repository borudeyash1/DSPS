import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { EditableWrapper } from '../editor/EditableWrapper';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';

interface JockeyNewArrivalsProps {
    sectionId?: string;
    content?: {
        heading?: string;
        products?: any[];
        animationStyle?: 'fade' | 'slide' | 'zoom' | 'flip';
    };
    background?: any;
    isEditMode?: boolean;
    onEdit?: (element: any) => void;
}

import { useNavigate } from 'react-router-dom';

const getBackgroundStyle = (bg: any) => {
    if (!bg || !bg.type) return { backgroundColor: '#ffffff' };
    const styles: any = {};
    if (bg.type === 'solid') {
        styles.backgroundColor = bg.color || '#ffffff';
    }
    return styles;
};

export const JockeyNewArrivalsRenderer = ({
    sectionId = '',
    content,
    background,
    isEditMode = false,
    onEdit = () => { },
}: JockeyNewArrivalsProps) => {
    const [selectedProductIndex, setSelectedProductIndex] = useState(0);
    const [hoveredProduct, setHoveredProduct] = useState<number | null>(null);
    const navigate = useNavigate();

    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
    const { isAuthenticated } = useAuthStore();
    const { showToast } = useToast();

    const handleProductClick = (productId: string) => {
        if (productId) {
            navigate(`/product/${productId}`);
        }
    };

    const handleWishlistToggle = async (product: any) => {
        if (!isAuthenticated) {
            showToast('Please login to add this item to wishlist', 'error');
            return;
        }

        try {
            if (isInWishlist(product.id || product._id)) {
                await removeFromWishlist(product.id || product._id);
                showToast('Removed from wishlist', 'success');
            } else {
                await addToWishlist(product.id || product._id);
                showToast('Added to wishlist', 'success');
            }
        } catch (error) {
            console.error('Wishlist error:', error);
        }
    };

    // Get products from content
    const currentProducts = content?.products || [];

    // Default products if none provided
    const defaultProducts = [
        {
            _id: '507f1f77bcf86cd799439011',
            name: 'Premium Cotton T-Shirt',
            price: 999,
            discountPrice: 799,
            images: [
                'https://placehold.co/400x500/667eea/ffffff?text=Product+1',
                'https://placehold.co/400x500/764ba2/ffffff?text=Alt+1',
            ],
            badge: 'New',
            category: 'Casual'
        },
        {
            _id: '507f1f77bcf86cd799439012',
            name: 'Slim Fit Jeans',
            price: 1819,
            discountPrice: 1499,
            images: [
                'https://placehold.co/400x500/764ba2/ffffff?text=Product+2',
                'https://placehold.co/400x500/667eea/ffffff?text=Alt+2',
            ],
            badge: 'Bestseller',
            category: 'Denim'
        },
        {
            _id: '507f1f77bcf86cd799439013',
            name: 'Casual Shorts',
            price: 849,
            images: [
                'https://placehold.co/400x500/f093fb/ffffff?text=Product+3',
                'https://placehold.co/400x500/667eea/ffffff?text=Alt+3',
            ],
            category: 'Summer'
        },
        {
            _id: '507f1f77bcf86cd799439014',
            name: 'Sports Jacket',
            price: 2499,
            discountPrice: 1999,
            images: [
                'https://placehold.co/400x500/4facfe/ffffff?text=Product+4',
                'https://placehold.co/400x500/00f2fe/ffffff?text=Alt+4',
            ],
            badge: 'Hot',
            category: 'Active'
        },
    ];

    // Helper to getting image URL safely
    const getImageUrl = (img: any) => {
        if (!img) return '';
        if (typeof img === 'string') return img;
        return img.url || '';
    };

    const displayProducts = currentProducts.length > 0 ? currentProducts : defaultProducts;
    const selectedProduct = displayProducts[selectedProductIndex] || displayProducts[0];

    const discount = selectedProduct?.discountPrice
        ? Math.round(((selectedProduct.price - selectedProduct.discountPrice) / selectedProduct.price) * 100)
        : 0;

    return (
        <EditableWrapper
            type="background"
            sectionId={sectionId}
            elementPath="background"
            currentValue={background}
            isEditMode={isEditMode}
            onEdit={onEdit}
        >
            <div className="w-full py-6 px-4" style={getBackgroundStyle(background)}>
                <div className="max-w-4xl mx-auto">
                    {/* Header with Creative Toggle */}
                    <div className="mb-6">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            {/* Heading */}
                            <EditableWrapper
                                type="text"
                                sectionId={sectionId}
                                elementPath="content.heading"
                                currentValue={content?.heading || 'NEW ARRIVALS'}
                                isEditMode={isEditMode}
                                onEdit={onEdit}
                            >
                                <h2 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 bg-clip-text text-transparent">
                                    {content?.heading || 'NEW ARRIVALS'}
                                </h2>
                            </EditableWrapper>

                            {/* Manage Products Button (Edit Mode) */}
                            {isEditMode && onEdit && (
                                <button
                                    onClick={() => {
                                        onEdit({
                                            type: 'jockey-arrivals-products',
                                            sectionId,
                                            elementPath: 'content.products',
                                            currentValue: content?.products || [],
                                        });
                                    }}
                                    className="bg-black text-white px-6 py-2 rounded-lg font-bold hover:bg-gray-800 flex items-center gap-2 shadow-lg"
                                >
                                    Manage Products
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
                    >
                        {/* Left Side - Featured Product */}
                        <div className="space-y-4">
                            {/* Main Image */}
                            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-2xl group">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={`main-${selectedProductIndex}`}
                                        src={getImageUrl(selectedProduct?.images?.[0]) || getImageUrl(selectedProduct?.image)}
                                        alt={selectedProduct?.name}
                                        className="w-full h-full object-cover cursor-pointer"
                                        initial={{ opacity: 0, scale: 1.1 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.5 }}
                                        onClick={() => handleProductClick(selectedProduct?._id || selectedProduct?.id)}
                                    />
                                </AnimatePresence>

                                {/* Badges */}
                                {selectedProduct?.badge && (
                                    <div className="absolute top-4 left-4 bg-black text-white px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg">
                                        {selectedProduct.badge}
                                    </div>
                                )}
                                {discount > 0 && (
                                    <div className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                                        {discount}% OFF
                                    </div>
                                )}

                                {/* Quick Actions Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute bottom-6 left-6 right-6 flex gap-3">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleProductClick(selectedProduct?._id || selectedProduct?.id);
                                            }}
                                            className="flex-1 bg-white text-black py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Eye className="w-5 h-5" />
                                            Quick View
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleWishlistToggle(selectedProduct);
                                            }}
                                            className={`p-3 rounded-lg transition-colors ${isInWishlist(selectedProduct?.id || selectedProduct?._id) ? 'bg-red-50 text-red-500' : 'bg-white text-black hover:bg-gray-100'}`}
                                        >
                                            <Heart className={`w-5 h-5 ${isInWishlist(selectedProduct?.id || selectedProduct?._id) ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Product Info Card */}
                            <motion.div
                                key={`info-${selectedProductIndex}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-gradient-to-br from-gray-900 to-black text-white rounded-2xl p-4 shadow-2xl"
                            >
                                {selectedProduct?.category && (
                                    <div className="text-sm text-gray-400 mb-2 uppercase tracking-wider">
                                        {selectedProduct.category}
                                    </div>
                                )}

                                <h3 className="text-lg font-bold mb-2 leading-tight">
                                    {selectedProduct?.name}
                                </h3>

                                <div className="flex items-baseline gap-3 mb-6">
                                    {selectedProduct?.discountPrice ? (
                                        <>
                                            <span className="text-2xl font-bold">₹{selectedProduct.discountPrice}</span>
                                            <span className="text-lg text-gray-400 line-through">₹{selectedProduct.price}</span>
                                        </>
                                    ) : (
                                        <span className="text-2xl font-bold">₹{selectedProduct?.price}</span>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleProductClick(selectedProduct?._id || selectedProduct?.id)}
                                    className="w-full bg-white text-black py-4 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-3 group"
                                >
                                    <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    VIEW DETAILS
                                </button>
                            </motion.div>
                        </div>

                        {/* Right Side - Product Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            {displayProducts.map((product: any, index: number) => {
                                const productDiscount = product.discountPrice
                                    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                                    : 0;

                                return (
                                    <motion.div
                                        key={product._id || index}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.1 }}
                                        onMouseEnter={() => setHoveredProduct(index)}
                                        onMouseLeave={() => setHoveredProduct(null)}
                                        onClick={() => setSelectedProductIndex(index)}
                                        className={`relative cursor-pointer group ${selectedProductIndex === index ? 'ring-4 ring-black rounded-xl' : ''
                                            }`}
                                    >
                                        {/* Product Card */}
                                        <div className="aspect-[3/4] rounded-xl overflow-hidden bg-gray-100 shadow-lg">
                                            <motion.img
                                                src={
                                                    hoveredProduct === index && product.images?.[1]
                                                        ? getImageUrl(product.images[1])
                                                        : getImageUrl(product.images?.[0]) || getImageUrl(product.image)
                                                }
                                                alt={product.name}
                                                className="w-full h-full object-cover"
                                                animate={{
                                                    scale: hoveredProduct === index ? 1.05 : 1,
                                                }}
                                                transition={{ duration: 0.3 }}
                                            />

                                            {/* Overlay */}
                                            <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${hoveredProduct === index ? 'opacity-100' : 'opacity-0'
                                                }`}>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm">
                                                        SELECT
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Badge */}
                                            {product.badge && (
                                                <div className="absolute top-2 left-2 bg-black text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    {product.badge}
                                                </div>
                                            )}

                                            {/* Discount */}
                                            {productDiscount > 0 && (
                                                <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                                                    -{productDiscount}%
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="mt-3 px-1">
                                            <h4 className="font-semibold text-sm line-clamp-1 mb-1">
                                                {product.name}
                                            </h4>
                                            <div className="flex items-center gap-2">
                                                {product.discountPrice ? (
                                                    <>
                                                        <span className="font-bold text-sm">₹{product.discountPrice}</span>
                                                        <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                                                    </>
                                                ) : (
                                                    <span className="font-bold text-sm">₹{product.price}</span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </motion.div>
                </div>
            </div>
        </EditableWrapper>
    );
};
