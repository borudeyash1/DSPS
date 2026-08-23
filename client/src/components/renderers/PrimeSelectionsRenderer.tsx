import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Trash2, Edit, Heart, Star } from 'lucide-react';
import { EditableWrapper } from '../editor/EditableWrapper';
import axios from 'axios';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';

interface PrimeSelectionsProps {
    sectionId?: string;
    content?: {
        heading?: string;
        mainImage?: string | { url: string; alt?: string };
        hotspots?: Array<{
            productId: string;
            position: { x: number; y: number };
        }>;
    };
    background?: any;
    isEditMode?: boolean;
    onEdit?: (element: any) => void;
}

const getBackgroundStyle = (bg: any) => {
    if (!bg || !bg.type) return { backgroundColor: '#ffffff' };
    const styles: any = {};
    if (bg.type === 'solid') {
        styles.backgroundColor = bg.color || '#ffffff';
    }
    return styles;
};

export const PrimeSelectionsRenderer = ({
    sectionId = '',
    content,
    background,
    isEditMode = false,
    onEdit = () => { },
}: PrimeSelectionsProps) => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeHotspot, setActiveHotspot] = useState<number | null>(null);
    const [hoveredProduct, setHoveredProduct] = useState<any | null>(null);

    const { addItem, openCart } = useCartStore();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
    const { isAuthenticated } = useAuthStore();
    const { showToast } = useToast();

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);

                if (content?.hotspots && content.hotspots.length > 0) {
                    // Fetch specific products
                    console.log('🔍 Fetching products for hotspots:', content.hotspots);
                    const productPromises = content.hotspots.map(item =>
                        axios.get(`${import.meta.env.VITE_API_URL}/products/${item.productId}`)
                    );
                    const responses = await Promise.all(productPromises);
                    const fetchedProducts = responses.map((res, index) => {
                        // Handle API response format
                        let productData;
                        if (res.data.success && res.data.data) {
                            // Format: { success: true, data: { product: {...} } }
                            productData = res.data.data.product || res.data.data;
                        } else if (res.data.data) {
                            // Format: { data: {...} }
                            productData = res.data.data;
                        } else {
                            // Format: direct product object
                            productData = res.data;
                        }

                        console.log('📦 Fetched product data:', productData);

                        return {
                            ...productData,
                            position: content.hotspots![index].position,
                        };
                    });
                    console.log('✅ All fetched products with positions:', fetchedProducts);
                    setProducts(fetchedProducts);
                } else {
                    // Fetch default products
                    const response = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
                        params: {
                            limit: 3,
                            isActive: true,
                            sort: '-createdAt',
                        },
                    });
                    const productsData = response.data.data?.products || response.data.products || [];
                    const defaultProducts = productsData.slice(0, 3).map((prod: any, index: number) => ({
                        ...prod,
                        position: {
                            x: 25 + index * 20,
                            y: 35 + index * 15,
                        },
                    }));
                    setProducts(defaultProducts);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
            } finally {
                setLoading(false);
            }
        };

        console.log('🔄 PrimeSelections useEffect triggered. Hotspots:', content?.hotspots);
        fetchProducts();
    }, [content?.hotspots]);

    const rawMainImage = content?.mainImage;
    const mainImage = (typeof rawMainImage === 'string' ? rawMainImage : rawMainImage?.url) || 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800&h=600&fit=crop';

    const handleHotspotClick = (index: number) => {
        if (isEditMode) {
            // In edit mode, show edit options
            setActiveHotspot(index === activeHotspot ? null : index);
        } else {
            // In view mode, show product preview
            setHoveredProduct(products[index]);
        }
    };

    const handleAddToCart = (product: any) => {
        try {
            console.log('Adding to cart:', product._id);
            const defaultSize = product.sizes && product.sizes.length > 0 ? product.sizes[0] : '';
            const defaultColor = product.colors && product.colors.length > 0 ? product.colors[0] : '';

            addItem(product, 1, defaultSize, defaultColor);
            openCart();
            showToast('Added to cart', 'success');
        } catch (error) {
            console.error('Error adding to cart:', error);
            showToast('Failed to add to cart', 'error');
        }
    };

    const handleWishlistToggle = async (product: any) => {
        if (!isAuthenticated) {
            showToast('Please login to add this item to wishlist', 'error');
            return;
        }

        try {
            if (isInWishlist(product._id)) {
                await removeFromWishlist(product._id);
                showToast('Removed from wishlist', 'success');
            } else {
                await addToWishlist(product._id);
                showToast('Added to wishlist', 'success');
            }
        } catch (error) {
            console.error('Wishlist error:', error);
        }
    };

    if (loading) {
        return (
            <div className="w-full py-12 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading selections...</p>
                </div>
            </div>
        );
    }

    return (
        <EditableWrapper
            type="background"
            sectionId={sectionId}
            elementPath="background"
            currentValue={background}
            isEditMode={isEditMode}
            onEdit={onEdit}
        >
            <div className="w-full py-12 px-4" style={getBackgroundStyle(background)}>
                <div className="w-full max-w-[1600px] mx-auto">
                    {/* Heading */}
                    <EditableWrapper
                        type="text"
                        sectionId={sectionId}
                        elementPath="content.heading"
                        currentValue={content?.heading || 'PRIME SELECTIONS'}
                        isEditMode={isEditMode}
                        onEdit={onEdit}
                    >
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-2xl md:text-4xl font-bold text-center mb-8 tracking-wide"
                        >
                            <span className="font-normal">PRIME</span>{' '}
                            <span className="font-bold">SELECTIONS</span>
                        </motion.h2>
                    </EditableWrapper>

                    {/* Main Image with Hotspots */}
                    <EditableWrapper
                        type="image"
                        sectionId={sectionId}
                        elementPath="content.mainImage"
                        currentValue={mainImage}
                        isEditMode={isEditMode}
                        onEdit={onEdit}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                            className="relative w-full max-w-[1600px] mx-auto rounded-2xl shadow-2xl z-20"
                            onClick={(e) => {
                                if (isEditMode && (content?.hotspots || []).length < 5) {
                                    // Get click position relative to image
                                    const rect = e.currentTarget.getBoundingClientRect();
                                    const x = ((e.clientX - rect.left) / rect.width) * 100;
                                    const y = ((e.clientY - rect.top) / rect.height) * 100;

                                    // Open property panel with pre-filled position
                                    onEdit({
                                        type: 'prime-selections-add-hotspot',
                                        sectionId,
                                        elementPath: 'content',
                                        currentValue: content,
                                        clickPosition: { x: Math.round(x), y: Math.round(y) }
                                    });
                                }
                            }}
                            style={{ cursor: isEditMode && (content?.hotspots || []).length < 5 ? 'crosshair' : 'default' }}
                        >
                            <div className="rounded-2xl overflow-hidden">
                                <img
                                    src={mainImage}
                                    alt="Prime Selections"
                                    className="w-full h-auto"
                                />
                            </div>

                            {/* Hotspot Indicators */}
                            {products.map((product, index) => {
                                // Smart positioning: Keep card in bounds
                                const isNearBottom = product.position.y > 60;
                                const isNearLeft = product.position.x < 20;
                                const isNearRight = product.position.x > 80;

                                let cardPositionClass = "";
                                let arrowPositionClass = "";
                                let initialY = 0;

                                // Vertical Position
                                if (isNearBottom) {
                                    cardPositionClass += "bottom-14 "; // Show above hotspot
                                    arrowPositionClass += "-bottom-2 border-r border-b "; // Arrow at bottom
                                    initialY = 10;
                                } else {
                                    cardPositionClass += "top-14 "; // Show below hotspot
                                    arrowPositionClass += "-top-2 border-l border-t "; // Arrow at top
                                    initialY = -10;
                                }

                                // Horizontal Position
                                if (isNearLeft) {
                                    cardPositionClass += "left-0 -translate-x-4 ";
                                    arrowPositionClass += "left-6 ";
                                } else if (isNearRight) {
                                    cardPositionClass += "right-0 translate-x-4 ";
                                    arrowPositionClass += "right-6 ";
                                } else {
                                    cardPositionClass += "left-1/2 -translate-x-1/2 ";
                                    arrowPositionClass += "left-1/2 -translate-x-1/2 ";
                                }

                                return (
                                    <div key={product._id} className={`absolute transition-all duration-300 ${hoveredProduct?._id === product._id ? 'z-50' : 'z-10'}`} style={{
                                        left: `${product.position.x}%`,
                                        top: `${product.position.y}%`,
                                        transform: 'translate(-50%, -50%)',
                                    }}>
                                        {/* Hotspot Button */}
                                        <motion.button
                                            initial={{ scale: 0, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ duration: 0.4, delay: 0.5 + index * 0.2 }}
                                            whileHover={{ scale: 1.2 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleHotspotClick(index)}
                                            onMouseEnter={() => {
                                                console.log('🖱️ Mouse enter on product:', product);
                                                setHoveredProduct(product);
                                            }}
                                            onMouseLeave={() => {
                                                console.log('🖱️ Mouse leave dot');
                                                // Don't clear immediately - let card handle it
                                            }}
                                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all duration-300 shadow-lg z-10 relative group ${isEditMode
                                                ? 'bg-blue-500 border-blue-600 hover:bg-blue-600'
                                                : 'bg-white border-black hover:bg-orange-500 hover:border-orange-500'
                                                }`}
                                        >
                                            {isEditMode ? (
                                                <Edit className="w-4 h-4 text-white" />
                                            ) : (
                                                <div className="w-3 h-3 bg-black group-hover:bg-white rounded-full animate-pulse"></div>
                                            )}
                                            <span className="absolute inset-0 rounded-full bg-orange-500 opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-500"></span>
                                        </motion.button>

                                        {/* Inline Product Preview Card (Shows on Hover) */}
                                        <AnimatePresence>
                                            {hoveredProduct?._id === product._id && (
                                                <motion.div
                                                    key="product-card"
                                                    initial={{ opacity: 0, scale: 0.8, y: initialY }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.8, y: initialY }}
                                                    transition={{ type: 'spring', damping: 20 }}
                                                    className={`absolute ${cardPositionClass} w-60 bg-white rounded-xl shadow-2xl p-3 z-[100] border border-gray-200 cursor-pointer hover:shadow-3xl transition-shadow`}
                                                    onMouseEnter={() => {
                                                        setHoveredProduct(product);
                                                    }}
                                                    onMouseLeave={() => {
                                                        setHoveredProduct(null);
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `/product/${product._id}`;
                                                    }}
                                                >
                                                    {/* Product Image */}
                                                    <div className="aspect-[3/4] rounded-lg overflow-hidden mb-2 bg-gray-100">
                                                        <img
                                                            src={product.images?.[0]?.url || product.images?.[0] || 'https://placehold.co/300x400'}
                                                            alt={product.name || 'Product'}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.currentTarget.src = 'https://placehold.co/300x400?text=No+Image';
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Product Info */}
                                                    <div className="space-y-1">
                                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                                                            {product.category || 'New Arrival'}
                                                        </p>
                                                        <h4 className="text-xs font-bold line-clamp-2 leading-tight">
                                                            {product.name || 'Product'}
                                                        </h4>
                                                        <p className="text-sm font-bold text-orange-600">
                                                            ₹{product.price?.toLocaleString() || '0'}
                                                        </p>

                                                        {/* Action Buttons */}
                                                        <div className="flex gap-2 pt-3">
                                                            {/* Add to Cart */}
                                                            <motion.button
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleAddToCart(product);
                                                                }}
                                                                className="flex-1 py-2 px-3 bg-black text-white text-xs font-medium hover:bg-gray-800 transition-colors rounded-lg flex items-center justify-center gap-1"
                                                                title="Add to Cart"
                                                            >
                                                                <ShoppingBag className="w-4 h-4" />
                                                                <span>Add to Cart</span>
                                                            </motion.button>

                                                            {/* Wishlist/Love */}
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleWishlistToggle(product);
                                                                }}
                                                                className={`w-10 h-10 border-2 rounded-lg flex items-center justify-center transition-colors ${isInWishlist(product._id)
                                                                    ? 'border-red-500 text-red-500 bg-red-50'
                                                                    : 'border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500'
                                                                    }`}
                                                                title={isInWishlist(product._id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                                            >
                                                                <Heart className={`w-4 h-4 ${isInWishlist(product._id) ? 'fill-current' : ''}`} />
                                                            </motion.button>
                                                        </div>

                                                        {/* Rating Stars */}
                                                        <div className="flex items-center gap-1 pt-2 border-t border-gray-100">
                                                            {[1, 2, 3, 4, 5].map((star) => (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-3 h-3 ${star <= (product.rating || 4) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                                                />
                                                            ))}
                                                            <span className="text-xs text-gray-500 ml-1">
                                                                ({product.reviewCount || 0})
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Arrow pointer */}
                                                    <div className={`absolute ${arrowPositionClass} w-4 h-4 bg-white border-gray-200 rotate-45`}></div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Edit Mode Controls */}
                                        {isEditMode && activeHotspot === index && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.8 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="absolute top-12 left-1/2 -translate-x-1/2 w-64 bg-white rounded-lg shadow-xl p-4 z-50 border-2 border-blue-500"
                                            >
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-xs font-medium text-gray-700">Product</label>
                                                        <p className="text-sm font-semibold truncate">{product.name}</p>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-xs text-gray-600">X Position</label>
                                                            <p className="text-sm font-mono">{product.position.x}%</p>
                                                        </div>
                                                        <div>
                                                            <label className="text-xs text-gray-600">Y Position</label>
                                                            <p className="text-sm font-mono">{product.position.y}%</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                // Handle edit hotspot (Change Product)
                                                                onEdit({
                                                                    type: 'prime-selections-add-hotspot', // Re-use the hotspot editor type
                                                                    sectionId,
                                                                    elementPath: 'content',
                                                                    currentValue: content,
                                                                    editIndex: index, // Pass index to indicate editing existing one
                                                                    clickPosition: product.position // Pass current position
                                                                });
                                                            }}
                                                            className="flex-1 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Change
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                // Handle delete hotspot
                                                                const newHotspots = content?.hotspots?.filter((_, i) => i !== index);
                                                                onEdit({
                                                                    type: 'array',
                                                                    sectionId,
                                                                    elementPath: 'content.hotspots',
                                                                    currentValue: newHotspots,
                                                                });
                                                                // Close overlay
                                                                setActiveHotspot(null);
                                                            }}
                                                            className="flex-1 py-2 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Remove
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Instruction overlay */}
                            {!isEditMode && products.length > 0 && !hoveredProduct && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 1.5, duration: 0.5 }}
                                    className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm"
                                >
                                    Tap or hover over the dots to see products
                                </motion.div>
                            )}
                        </motion.div>
                    </EditableWrapper>

                    {/* Edit Mode Helpers */}
                    {isEditMode && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                            <p className="text-sm text-blue-800">
                                <strong>Edit Mode:</strong> Click anywhere on the image above to add a hotspot at that position!
                            </p>
                            <p className="text-xs text-gray-600">
                                • Click on the image → Property panel opens with position pre-filled<br />
                                • Select a product → Hotspot appears instantly<br />
                                • Click existing blue dots to edit or remove them<br />
                                • Maximum 5 hotspots allowed
                            </p>
                            <div className="flex items-center gap-2 text-sm">
                                <div className="px-3 py-1 bg-white rounded border border-blue-300">
                                    Current: {(content?.hotspots || []).length}/5 hotspots
                                </div>
                                {(content?.hotspots || []).length >= 5 && (
                                    <span className="text-xs text-orange-600">Maximum reached</span>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </EditableWrapper>
    );
};
