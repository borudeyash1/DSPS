import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import { ChevronLeft, ChevronRight, Plus, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EditableWrapper } from '../editor/EditableWrapper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Product {
    id: string | number;
    name: string;
    image: string;
    color: string;
    colorCode: string; // Hex code for filtering logic
    gender: 'men' | 'women';
    link?: string;
    price?: number | string;
    category?: string;
}


interface SlideIntoColorsProps {
    sectionId?: string;
    content?: {
        heading?: string;
        products?: {
            men: Product[];
            women: Product[];
        };
    };
    background?: any;
    isEditMode?: boolean;
    onEdit?: (element: any) => void;
}

export const SlideIntoColorsRenderer = ({
    sectionId = '',
    content,
    background,
    isEditMode = false,
    onEdit = () => { },
}: SlideIntoColorsProps) => {
    const [activeTab, setActiveTab] = useState<'men' | 'women'>('men');
    const [sliderValue, setSliderValue] = useState(50);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const navigate = useNavigate();

    const handleProductClick = (productId: string | number) => {
        if (productId) {
            navigate(`/product/${productId}`);
        }
    };

    // Mock Data if content is missing
    const defaultProducts: { men: Product[], women: Product[] } = {
        men: [
            { id: 1, name: 'Super Combed Cotton Rich Elastane Stretch', image: 'https://images.unsplash.com/photo-1516257984-b1b4d8c9230c?w=500&q=80', color: 'Black', colorCode: '#000000', gender: 'men' },
            { id: 2, name: 'Cotton Blend Graphic Print T-Shirt', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&q=80', color: 'Black Printed', colorCode: '#1a1a1a', gender: 'men' },
            { id: 3, name: 'Microfiber Fabric Solid Half Sleeve', image: 'https://images.unsplash.com/photo-1503341455253-b2e72333dbdb?w=500&q=80', color: 'Charcoal', colorCode: '#36454F', gender: 'men' },
            { id: 4, name: 'Microfiber Mesh Elastane Stretch', image: 'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?w=500&q=80', color: 'Navy', colorCode: '#000080', gender: 'men' },
            { id: 5, name: 'Performance T-Shirt Red', image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=500&q=80', color: 'Red', colorCode: '#FF0000', gender: 'men' },
            { id: 6, name: 'Comfort Fit Blue', image: 'https://images.unsplash.com/photo-1586363777729-14e509f0c3d7?w=500&q=80', color: 'Blue', colorCode: '#0000FF', gender: 'men' },
        ],
        women: [
            { id: 7, name: 'Cotton Elastane Leggings', image: 'https://images.unsplash.com/photo-1506619216599-9d16d0903dfd?w=500&q=80', color: 'Black', colorCode: '#000000', gender: 'women' },
            { id: 8, name: 'Seamless Sports Bra', image: 'https://images.unsplash.com/photo-1571945153227-a5009f834d8e?w=500&q=80', color: 'Pink', colorCode: '#FFC0CB', gender: 'women' },
            { id: 9, name: 'Running Shorts', image: 'https://images.unsplash.com/photo-1548663595-f968e595a630?w=500&q=80', color: 'Blue', colorCode: '#0000FF', gender: 'women' },
            { id: 10, name: 'Tank Top', image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=500&q=80', color: 'White', colorCode: '#FFFFFF', gender: 'women' },
        ]
    };

    // Helper functions for color logic
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    };

    const getSliderColor = (value: number) => {
        // Updated Gradient stops: White -> Yellow -> Red -> Blue -> Black
        const white = { r: 255, g: 255, b: 255 }; // #ffffff
        const yellow = { r: 234, g: 179, b: 8 };  // #eab308
        const red = { r: 220, g: 38, b: 38 };     // #dc2626
        const blue = { r: 30, g: 58, b: 138 };    // #1e3a8a
        const black = { r: 0, g: 0, b: 0 };       // #000000

        let start, end, t;
        if (value <= 25) {
            start = white;
            end = yellow;
            t = value / 25;
        } else if (value <= 50) {
            start = yellow;
            end = red;
            t = (value - 25) / 25;
        } else if (value <= 75) {
            start = red;
            end = blue;
            t = (value - 50) / 25;
        } else {
            start = blue;
            end = black;
            t = (value - 75) / 25;
        }

        return {
            r: Math.round(start.r + (end.r - start.r) * t),
            g: Math.round(start.g + (end.g - start.g) * t),
            b: Math.round(start.b + (end.b - start.b) * t)
        };
    };

    const getColorDistance = (c1: { r: number, g: number, b: number }, c2: { r: number, g: number, b: number }) => {
        return Math.sqrt(Math.pow(c1.r - c2.r, 2) + Math.pow(c1.g - c2.g, 2) + Math.pow(c1.b - c2.b, 2));
    };

    const products = content?.products || defaultProducts;
    const allTabProducts = products[activeTab] || [];

    useEffect(() => {
        // Safe access to products
        const currentProducts = products && products[activeTab] ? products[activeTab] : [];

        // In Edit Mode, we show raw products to preserve index order for editing
        if (isEditMode) {
            setFilteredProducts(currentProducts);
            return;
        }

        let sortedProducts = [...currentProducts];

        // Filter/Sort logic
        if (sortedProducts.length > 0) {
            const targetColor = getSliderColor(sliderValue);
            const MAX_DISTANCE = 200; // Increased threshold for better inclusion

            // Calculate distance for each product
            const productsWithDist = sortedProducts.map(p => {
                const rgb = hexToRgb(p.colorCode || '#000000');
                const dist = getColorDistance(targetColor, rgb);
                return { product: p, dist };
            });

            // Filter products that are "near" the color
            const filtered = productsWithDist.filter(item => item.dist < MAX_DISTANCE);

            // Sort by distance to show closest matches first
            filtered.sort((a, b) => a.dist - b.dist);

            sortedProducts = filtered.map(item => item.product);
        }

        setFilteredProducts(sortedProducts);
    }, [activeTab, products, sliderValue, isEditMode]);

    return (
        <EditableWrapper
            type="background"
            sectionId={sectionId}
            elementPath="background"
            currentValue={background}
            isEditMode={isEditMode}
            onEdit={onEdit}
        >
            <div className="w-full py-16 px-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 text-gray-900">
                <div className="w-full max-w-[1600px] mx-auto">
                    {/* Header & Toggle */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                        <EditableWrapper
                            type="text"
                            sectionId={sectionId}
                            elementPath="content.heading"
                            currentValue={content?.heading || 'SLIDE INTO YOUR COLORS'}
                            isEditMode={isEditMode}
                            onEdit={onEdit}
                        >
                            <motion.h2
                                initial={{ opacity: 0, y: -20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6 }}
                                className="text-3xl md:text-4xl font-extrabold uppercase tracking-wide"
                            >
                                {content?.heading || 'SLIDE INTO YOUR COLORS'}
                            </motion.h2>
                        </EditableWrapper>

                        {/* Toggle Switch */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            <div className="inline-flex bg-white p-1 rounded-full shadow-lg border border-gray-200">
                                <button
                                    onClick={() => setActiveTab('men')}
                                    className={`relative px-8 py-3 rounded-full font-bold text-sm tracking-wider transition-all duration-300 ${activeTab === 'men'
                                        ? 'text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {activeTab === 'men' && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-xl" />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <span className="text-xl">👔</span>
                                        MEN
                                    </span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('women')}
                                    className={`relative px-8 py-3 rounded-full font-bold text-sm tracking-wider transition-all duration-300 ${activeTab === 'women'
                                        ? 'text-white'
                                        : 'text-gray-600 hover:text-gray-900'
                                        }`}
                                >
                                    {activeTab === 'women' && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-xl" />
                                    )}
                                    <span className="relative z-10 flex items-center gap-2">
                                        <span className="text-xl">👗</span>
                                        WOMEN
                                    </span>
                                </button>
                            </div>
                        </motion.div>
                    </div>

                    {/* Carousel */}
                    <motion.div
                        layout
                        className="relative group px-4 md:px-12 min-h-[400px] md:min-h-[500px] flex items-center"
                    >
                        {(filteredProducts.length > 0 || isEditMode) ? (
                            <>
                                <AnimatePresence mode='wait'>
                                    <Swiper
                                        key={activeTab} // Force re-render on tab change for clean transition
                                        modules={[Navigation, Autoplay]}
                                        spaceBetween={24}
                                        slidesPerView={1}
                                        navigation={{
                                            nextEl: '.swiper-button-next-custom',
                                            prevEl: '.swiper-button-prev-custom',
                                        }}
                                        breakpoints={{
                                            640: { slidesPerView: 2 },
                                            768: { slidesPerView: 3 },
                                            1024: { slidesPerView: 4 },
                                        }}
                                        className="w-full pb-12"
                                    >
                                        {(filteredProducts || []).map((product, index) => {
                                            // Find real index in the full list to prevent data loss on edit
                                            const realIndex = allTabProducts.findIndex(p => p.id === product.id);
                                            return (
                                                <SwiperSlide key={product.id || index}>
                                                    <EditableWrapper
                                                        type="product"
                                                        sectionId={sectionId}
                                                        elementPath={`content.products.${activeTab}`}
                                                        currentValue={product}
                                                        allProducts={allTabProducts}
                                                        productIndex={realIndex === -1 ? index : realIndex}
                                                        isEditMode={isEditMode}
                                                        onEdit={onEdit}
                                                    >
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.9 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.9 }}
                                                            transition={{ duration: 0.4 }}
                                                            className="bg-white rounded-xl overflow-hidden group/card cursor-pointer transform transition-transform hover:-translate-y-2 duration-300 h-full flex flex-col"
                                                            onClick={() => handleProductClick(product.id)}
                                                        >
                                                            <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                                                                <img
                                                                    src={product.image}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
                                                                />
                                                                {/* Overlay Add to Cart */}
                                                                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover/card:translate-y-0 transition-transform duration-300 bg-gradient-to-t from-black/80 to-transparent">
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            handleProductClick(product.id);
                                                                        }}
                                                                        className="w-full py-2 bg-white text-black font-semibold text-sm rounded shadow-lg hover:bg-gray-100 flex items-center justify-center gap-2"
                                                                    >
                                                                        <ShoppingBag size={16} />
                                                                        View Details
                                                                    </button>
                                                                </div>
                                                            </div>
                                                            <div className="p-4 bg-white flex-1 flex flex-col justify-between text-left shadow-md">
                                                                <div>
                                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">{product.category || 'Apparel'}</p>
                                                                    <h3 className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2 min-h-[40px]">
                                                                        {product.name}
                                                                    </h3>
                                                                </div>
                                                                <div className="mt-2 flex items-center justify-between border-t border-gray-200 pt-3">
                                                                    <div className="text-gray-900 font-bold">
                                                                        {product.price ? `₹${product.price}` : '₹999'}
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <div className="w-3 h-3 rounded-full border border-gray-400" style={{ backgroundColor: product.colorCode }}></div>
                                                                        <span className="text-xs text-gray-600 capitalize">{product.color}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    </EditableWrapper>
                                                </SwiperSlide>
                                            );
                                        })}

                                        {isEditMode && (
                                            <SwiperSlide key="add-new-card">
                                                <EditableWrapper
                                                    type="product"
                                                    sectionId={sectionId}
                                                    elementPath={`content.products.${activeTab}`}
                                                    currentValue={{ name: 'New Product' }} // Placeholder
                                                    allProducts={allTabProducts}
                                                    productIndex={allTabProducts.length}
                                                    isEditMode={isEditMode}
                                                    onEdit={onEdit}
                                                >
                                                    <div className="h-full min-h-[300px] bg-white rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400 transition-colors cursor-pointer group shadow-md">
                                                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center mb-4 group-hover:bg-gray-300 transition-colors">
                                                            <Plus size={24} />
                                                        </div>
                                                        <span className="font-medium">Add Product</span>
                                                    </div>
                                                </EditableWrapper>
                                            </SwiperSlide>
                                        )}
                                    </Swiper>
                                </AnimatePresence>

                                {/* Custom Navigation Buttons */}
                                <button className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border-2 border-gray-300 bg-white hidden md:flex items-center justify-center text-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-700 transition-all shadow-lg">
                                    <ChevronRight size={20} />
                                </button>
                                <button className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full border-2 border-gray-300 bg-white hidden md:flex items-center justify-center text-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-700 transition-all shadow-lg">
                                    <ChevronLeft size={20} />
                                </button>
                            </>
                        ) : (
                            <div className="w-full text-center py-10">
                                <p className="text-gray-600 text-lg mb-2">No products match this color.</p>
                                <p className="text-gray-500 text-sm">Try sliding to a different shade.</p>
                            </div>
                        )}
                    </motion.div>

                    {/* Color Slider */}
                    <div className="mt-12 max-w-2xl mx-auto relative px-8">
                        {/* Selected Color Text Bubble */}
                        <div
                            className="absolute -top-10 -translate-x-1/2 px-3 py-1 bg-gray-800 rounded text-xs font-bold text-white mb-2 transition-all duration-75 shadow-lg"
                            style={{ left: `${sliderValue}%` }}
                        >
                            Select Color
                            <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
                        </div>

                        {/* Gradient Bar */}
                        <div
                            className="h-3 w-full rounded-full relative cursor-pointer shadow-md"
                            style={{ background: 'linear-gradient(to right, #ffffff, #eab308, #dc2626, #1e3a8a, #000000)' }}
                        >
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={sliderValue}
                                onChange={(e) => setSliderValue(Number(e.target.value))}
                                className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
                            />
                            {/* Thumb */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-4 border-gray-800 rounded-full shadow-xl pointer-events-none z-10 transition-all duration-75"
                                style={{ left: `calc(${sliderValue}% - 12px)` }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </EditableWrapper>
    );
};
