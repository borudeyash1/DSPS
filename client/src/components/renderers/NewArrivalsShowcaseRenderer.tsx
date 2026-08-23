import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EditableWrapper } from '../editor/EditableWrapper';

interface NewArrivalsShowcaseProps {
    sectionId?: string;
    content?: {
        heading?: string;
        headingStyle?: any;
        products?: any[];
    };
    background?: any;
    isEditMode?: boolean;
    onEdit?: (element: any) => void;
}

const getBackgroundStyle = (bg: any) => {
    if (!bg || !bg.type) return {};
    const styles: any = {};
    if (bg.type === 'solid') {
        styles.backgroundColor = bg.color || '#ffffff';
    }
    return styles;
};

export const NewArrivalsShowcaseRenderer = ({
    sectionId = '',
    content,
    background,
    isEditMode = false,
    onEdit = () => { },
}: NewArrivalsShowcaseProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedProductIndex, setSelectedProductIndex] = useState(0);
    const navigate = useNavigate();

    const handleProductClick = (productId: string) => {
        if (productId) {
            navigate(`/product/${productId}`);
        }
    };

    // Get products from content (managed via admin)
    const currentProducts = content?.products || [];

    // Default products if none provided
    const defaultProducts = [
        {
            _id: '507f1f77bcf86cd799439015',
            name: 'Cotton Rich Oversized Printed T-Shirt',
            price: 999,
            images: [
                'https://placehold.co/400x500/667eea/ffffff?text=Product+1',
                'https://placehold.co/400x500/764ba2/ffffff?text=Product+1-2',
                'https://placehold.co/400x500/f093fb/ffffff?text=Product+1-3',
                'https://placehold.co/400x500/4facfe/ffffff?text=Product+1-4',
            ],
            badge: 'New'
        },
        {
            _id: '507f1f77bcf86cd799439016',
            name: '100% Cotton Woven Seven Pocket Cargo Joggers',
            price: 1819,
            images: [
                'https://placehold.co/400x500/764ba2/ffffff?text=Product+2',
                'https://placehold.co/400x500/667eea/ffffff?text=Product+2-2',
                'https://placehold.co/400x500/f093fb/ffffff?text=Product+2-3',
                'https://placehold.co/400x500/4facfe/ffffff?text=Product+2-4',
            ],
            badge: 'Bestseller'
        },
        {
            _id: '507f1f77bcf86cd799439017',
            name: '100% Cotton Textured Knit Shorts',
            price: 849,
            images: [
                'https://placehold.co/400x500/f093fb/ffffff?text=Product+3',
                'https://placehold.co/400x500/667eea/ffffff?text=Product+3-2',
                'https://placehold.co/400x500/764ba2/ffffff?text=Product+3-3',
                'https://placehold.co/400x500/4facfe/ffffff?text=Product+3-4',
            ],
        },
    ];

    const displayProducts = currentProducts.length > 0 ? currentProducts : defaultProducts;
    const currentProduct = displayProducts[selectedProductIndex] || displayProducts[0];

    // Handle both array of URLs and array of image objects {url, alt}
    const productImages = currentProduct?.images
        ? currentProduct.images.map((img: any) => typeof img === 'string' ? img : img.url)
        : [];

    const handlePrevProduct = () => {
        setSelectedProductIndex((prev) => (prev > 0 ? prev - 1 : displayProducts.length - 1));
        setSelectedImageIndex(0);
    };

    const handleNextProduct = () => {
        setSelectedProductIndex((prev) => (prev < displayProducts.length - 1 ? prev + 1 : 0));
        setSelectedImageIndex(0);
    };

    // Image transition variants
    const imageVariants = {
        enter: {
            opacity: 0,
            scale: 0.95,
        },
        center: {
            opacity: 1,
            scale: 1,
            transition: {
                duration: 0.3,
                ease: 'easeOut' as const,
            },
        },
        exit: {
            opacity: 0,
            scale: 1.05,
            transition: {
                duration: 0.2,
            },
        },
    };

    return (
        <EditableWrapper
            type="background"
            sectionId={sectionId}
            elementPath="background"
            currentValue={background}
            isEditMode={isEditMode}
            onEdit={onEdit}
        >
            <div className="w-full py-16 px-4" style={getBackgroundStyle(background)}>
                <div className="w-full max-w-[1600px] mx-auto">
                    {/* Header */}
                    <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 md:gap-0">
                        <EditableWrapper
                            type="text"
                            sectionId={sectionId}
                            elementPath="content.heading"
                            currentValue={content?.heading || 'NEW ARRIVALS'}
                            currentStyle={content?.headingStyle}
                            isEditMode={isEditMode}
                            onEdit={onEdit}
                        >
                            <h2
                                className="font-bold"
                                style={{
                                    fontSize: content?.headingStyle?.fontSize || 'clamp(2rem, 5vw, 4rem)',
                                    color: content?.headingStyle?.color || '#000000',
                                }}
                            >
                                {content?.heading || 'NEW ARRIVALS'}
                            </h2>
                        </EditableWrapper>

                        {/* Manage Products Button (Edit Mode) */}
                        {isEditMode && onEdit && (
                            <button
                                onClick={() => {
                                    onEdit({
                                        type: 'new-arrivals-products',
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

                    {/* Main Content - 3 Column Layout */}
                    <motion.div
                        key={selectedProductIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
                    >
                        {/* Left Column - Creative Circular Thumbnail Gallery */}
                        <div className="order-3 lg:order-1 lg:col-span-2 flex items-center justify-center hidden lg:flex">
                            <div className="relative w-full h-[500px]">
                                <h3 className="text-sm font-medium mb-4 text-center">Other Images</h3>
                                {/* Circular arrangement of thumbnails */}
                                {productImages.slice(0, 4).map((img: string, index: number) => {
                                    // Calculate position in a circular arc
                                    const angle = (index * 30) - 45; // Spread from -45° to +45°
                                    const radius = 80;
                                    const x = Math.sin((angle * Math.PI) / 180) * radius;
                                    const y = Math.cos((angle * Math.PI) / 180) * radius + 150;

                                    return (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedImageIndex(index)}
                                            className={`absolute w-20 h-24 rounded-lg overflow-hidden border-2 transition-all transform hover:scale-110 ${selectedImageIndex === index
                                                ? 'border-black scale-110 shadow-lg z-10'
                                                : 'border-gray-200 hover:border-gray-400'
                                                }`}
                                            style={{
                                                left: `calc(50% + ${x}px - 40px)`,
                                                top: `${y}px`,
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`${currentProduct?.name} ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Center Column - Large Main Image */}
                        <div className="order-1 lg:order-2 lg:col-span-5">
                            <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                <AnimatePresence mode="wait">
                                    <motion.img
                                        key={selectedImageIndex}
                                        src={productImages[selectedImageIndex]}
                                        alt={currentProduct?.name}
                                        className="w-full h-full object-cover cursor-pointer"
                                        variants={imageVariants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        onClick={() => handleProductClick(currentProduct?._id || currentProduct?.id)}
                                    />
                                </AnimatePresence>

                                {currentProduct?.badge && (
                                    <div className="absolute top-4 left-4 bg-black text-white px-4 py-2 text-sm font-semibold">
                                        {currentProduct.badge}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Product Carousel */}
                        <div className="order-2 lg:order-3 lg:col-span-5 flex flex-col">
                            {/* Manage Products Button (Edit Mode) */}
                            {isEditMode && onEdit && (
                                <button
                                    onClick={() => {
                                        onEdit({
                                            type: 'new-arrivals-products',
                                            sectionId,
                                            elementPath: 'content.products',
                                            currentValue: content?.products || [],
                                        });
                                    }}
                                    className="mb-4 bg-white text-black px-4 py-2 rounded shadow-lg font-bold hover:bg-gray-100 flex items-center justify-center gap-2 border-2 border-black"
                                >
                                    Manage Products
                                </button>
                            )}

                            {/* Product Carousel with Navigation */}
                            <div className="flex-1 flex flex-col">
                                {/* Navigation Arrows */}
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={handlePrevProduct}
                                        className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                                        disabled={displayProducts.length === 0}
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleNextProduct}
                                        className="p-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors"
                                        disabled={displayProducts.length === 0}
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Product Cards Grid */}
                                <div className="grid grid-cols-3 gap-4 flex-1">
                                    {displayProducts.slice(0, 3).map((product: any, index: number) => (
                                        <button
                                            key={product._id || index}
                                            onClick={() => {
                                                setSelectedProductIndex(index);
                                                setSelectedImageIndex(0);
                                            }}
                                            className={`flex flex - col border - 2 rounded - lg overflow - hidden transition - all ${selectedProductIndex === index
                                                ? 'border-black shadow-lg'
                                                : 'border-gray-200 hover:border-gray-400'
                                                } `}
                                        >
                                            <div className="aspect-[3/4] bg-gray-100">
                                                <img
                                                    src={product.images?.[0] || product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="p-3 text-left">
                                                <p className="text-sm font-medium truncate">{product.name}</p>
                                                <p className="text-lg font-bold">₹{product.price}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                {/* Selected Product Details */}
                                {currentProduct && (
                                    <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-gray-600">#{currentProduct._id?.toString().slice(-6).toUpperCase() || 'N/A'}</span>
                                            {currentProduct.badge && (
                                                <span className="bg-black text-white text-xs px-2 py-1 rounded">
                                                    {currentProduct.badge}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">{currentProduct.name}</h3>
                                        <p className="text-2xl font-bold mb-4">₹{currentProduct.price}</p>

                                        {currentProduct.material && (
                                            <div className="text-sm text-gray-600 mb-2">
                                                <span className="font-medium">{currentProduct.material}</span>
                                            </div>
                                        )}

                                        {/* Action Buttons */}
                                        <div className="flex gap-3 mt-4">
                                            <button
                                                onClick={() => handleProductClick(currentProduct?._id || currentProduct?.id)}
                                                className="flex-1 py-2 border-2 border-black text-black font-medium hover:bg-black hover:text-white transition-colors text-sm"
                                            >
                                                EXPLORE
                                            </button>
                                            <button
                                                onClick={() => handleProductClick(currentProduct?._id || currentProduct?.id)}
                                                className="flex-1 py-2 bg-black text-white font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm"
                                            >
                                                <ShoppingCart className="w-4 h-4" />
                                                VIEW DETAILS
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </EditableWrapper>
    );
};
