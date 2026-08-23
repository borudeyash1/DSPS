import { motion } from 'framer-motion';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay } from 'swiper/modules';
import { JockeyProductCard } from '../ui/JockeyProductCard';
import { EditableWrapper } from '../editor/EditableWrapper';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Added icons
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface SplitHeroCarouselProps {
    sectionId?: string;
    content?: {
        heading?: string;
        headingStyle?: any;
        subheading?: string;
        subheadingStyle?: any;
        backgroundImage?: string;
        products?: any[];
    };
    background?: any;
    settings?: {
        parallaxSpeed?: number;
        autoPlay?: boolean;
        interval?: number;
        showArrows?: boolean;
        showDots?: boolean;
        itemsPerView?: number;
    };
    isEditMode?: boolean;
    onEdit?: (element: any) => void;
    isPreview?: boolean;
}

const getBackgroundStyle = (bg: any) => {
    if (!bg || !bg.type) return {};
    const styles: any = {};
    if (bg.type === 'solid') {
        styles.backgroundColor = bg.color || '#ffffff';
    } else if (bg.type === 'gradient') {
        const stops = bg.stops?.map((s: any) => `${s.color} ${s.position}%`).join(', ') || '';
        if (bg.gradientType === 'linear') {
            styles.background = `linear-gradient(${bg.direction || 90}deg, ${stops})`;
        } else {
            styles.background = `radial-gradient(circle, ${stops})`;
        }
    } else if (bg.type === 'image') {
        styles.backgroundImage = `url(${bg.imageUrl})`;
        styles.backgroundSize = bg.size || 'cover';
        styles.backgroundPosition = bg.position || 'center';
        styles.backgroundRepeat = bg.repeat || 'no-repeat';
    }
    return styles;
};

export const SplitHeroCarouselRenderer = ({
    sectionId = '',
    content,
    background,
    settings,
    isEditMode = false,
    onEdit = () => { },
    isPreview = false,
}: SplitHeroCarouselProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const topSwiperRef = useRef<any>(null);
    const bottomSwiperRef = useRef<any>(null);
    
    const navigate = useNavigate();

    const currentProducts = content?.products || [];

    // Default products if none provided
    const defaultProducts = [
        { 
            _id: '1', 
            name: 'Cotton Rich Oversized Printed T-Shirt', 
            price: 999, 
            description: 'Comfortable oversized t-shirt',
            category: 'Men',
            images: [{ url: 'https://placehold.co/400x500/667eea/ffffff?text=Product+1' }],
            badge: 'New',
            sizes: ['S', 'M', 'L', 'XL'],
            colors: ['Blue'],
            stock: 10
        },
        { 
            _id: '2', 
            name: '100% Cotton Woven Seven Pocket Cargo Joggers', 
            price: 1819, 
            description: 'Stylish cargo joggers',
            category: 'Men',
            images: [{ url: 'https://placehold.co/400x500/764ba2/ffffff?text=Product+2' }],
            badge: 'Bestseller',
            sizes: ['30', '32', '34', '36'],
            colors: ['Purple'],
            stock: 15
        },
        { 
            _id: '3', 
            name: '100% Cotton Textured Knit Shorts', 
            price: 1049, 
            description: 'Textured knit shorts',
            category: 'Men',
            discountPrice: 849, 
            images: [{ url: 'https://placehold.co/400x500/f093fb/ffffff?text=Product+3' }],
            sizes: ['S', 'M', 'L'],
            colors: ['Pink'],
            stock: 20
        },
    ];

    const displayProducts = currentProducts.length > 0 ? currentProducts : defaultProducts;

    const carouselSettings = {
        autoPlay: settings?.autoPlay ?? false,
        interval: settings?.interval ?? 5000,
        showArrows: settings?.showArrows ?? true,
        showDots: settings?.showDots ?? true,
        itemsPerView: settings?.itemsPerView ?? 3,
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
            <div
                ref={containerRef}
                className="relative w-full min-h-screen overflow-hidden"
                style={getBackgroundStyle(background)}
            >
                {/* Split Screen Layout */}
                <div className="flex flex-col lg:flex-row min-h-screen">
                    {/* Left Side - Background Image */}
                    <div
                        className="relative w-full lg:w-1/2 min-h-[50vh] lg:min-h-full overflow-hidden"
                    >
                        <EditableWrapper
                            type="image"
                            sectionId={sectionId}
                            elementPath="content.backgroundImage"
                            currentValue={content?.backgroundImage || 'https://placehold.co/1920x1080/333333/ffffff?text=Background'}
                            isEditMode={isEditMode}
                            onEdit={onEdit}
                            className="absolute inset-0 w-full h-full"
                        >
                            <img
                                src={content?.backgroundImage || 'https://placehold.co/1920x1080/333333/ffffff?text=Background'}
                                alt="Hero Background"
                                className="w-full h-full object-cover"
                            />
                        </EditableWrapper>

                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

                        {/* Edit Background Image Button */}
                        {isEditMode && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit({
                                        type: 'image',
                                        sectionId,
                                        elementPath: 'content.backgroundImage',
                                        currentValue: content?.backgroundImage || '',
                                    });
                                }}
                                className="absolute top-4 right-4 z-50 bg-white text-black px-4 py-2 rounded shadow-lg font-bold hover:bg-gray-100 flex items-center gap-2"
                            >
                                Upload Background
                            </button>
                        )}

                        {/* Heading */}
                        <div className="absolute inset-0 flex items-center justify-center lg:justify-start p-8 lg:p-16 text-center lg:text-left">
                            <EditableWrapper
                                type="text"
                                sectionId={sectionId}
                                elementPath="content.heading"
                                currentValue={content?.heading || 'COOL CODED CASUALS'}
                                currentStyle={content?.headingStyle}
                                isEditMode={isEditMode}
                                onEdit={onEdit}
                            >
                                <motion.h1
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.8, delay: 0.2 }}
                                    className="font-black leading-tight"
                                    style={{
                                        fontSize: content?.headingStyle?.fontSize || 'clamp(2rem, 8vw, 6rem)',
                                        color: content?.headingStyle?.color || '#FFD700',
                                        fontWeight: content?.headingStyle?.fontWeight || 900,
                                        textTransform: 'uppercase',
                                        letterSpacing: '-0.02em',
                                    }}
                                >
                                    {content?.heading || 'COOL CODED\nCASUALS'}
                                </motion.h1>
                            </EditableWrapper>
                        </div>
                    </div>

                    {/* Right Side - Product Carousel */}
                    <div className="relative w-full lg:w-1/2 bg-white flex flex-col">
                        {/* Manage Products Button */}
                        {isEditMode && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit({
                                        type: 'split-hero-products',
                                        sectionId,
                                        elementPath: 'content.products',
                                        currentValue: content?.products || [],
                                    });
                                }}
                                className="absolute top-4 right-4 z-50 bg-white text-black px-4 py-2 rounded shadow-lg font-bold hover:bg-gray-100 flex items-center gap-2"
                            >
                                Manage Products
                            </button>
                        )}

                        {/* Product Carousel */}
                        <div className="flex-1 px-4 lg:px-8 pb-8 pt-8 flex flex-col gap-8 h-full relative group">
                            {/* Top Row - Left to Right (Standard) */}
                            <motion.div
                                initial={{ opacity: 0, x: 50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5 }}
                                className="h-1/2 min-h-0"
                            >
                                {isPreview ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 h-full content-start overflow-hidden">
                                        {displayProducts.slice(0, 3).map((product, index) => (
                                            <div key={product._id || index} className="pointer-events-none">
                                                <JockeyProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Swiper
                                        onSwiper={(swiper) => {
                                            topSwiperRef.current = swiper;
                                        }}
                                        modules={[Pagination, Autoplay]} // Removed Navigation module as we control it manually
                                        spaceBetween={20}
                                        slidesPerView={1}
                                        breakpoints={{
                                            640: { slidesPerView: 2 },
                                            1024: { slidesPerView: carouselSettings.itemsPerView },
                                        }}
                                        pagination={false} 
                                        autoplay={carouselSettings.autoPlay ? {
                                            delay: carouselSettings.interval,
                                            disableOnInteraction: false,
                                            reverseDirection: false
                                        } : false}
                                        loop={true}
                                        observer={true}
                                        observeParents={true}
                                        className="h-full"
                                    >
                                        {displayProducts.map((product, index) => (
                                            <SwiperSlide key={`top-${product._id || index}`} className='p-2 pb-8'>
                                                 <JockeyProductCard 
                                                    product={product} 
                                                    onClick={() => {
                                                        const productId = product._id || product.id;
                                                        if (productId) {
                                                            if (isEditMode) {
                                                                navigate(`/my-admin/products?edit=${productId}`);
                                                            } else {
                                                                navigate(`/product/${productId}`);
                                                            }
                                                        }
                                                    }}
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                )}
                            </motion.div>

                            {/* Bottom Row - Right to Left (Reverse) */}
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="h-1/2 min-h-0"
                            >
                                {isPreview ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 h-full content-start overflow-hidden">
                                        {displayProducts.slice(0, 3).reverse().map((product, index) => (
                                            <div key={product._id || index} className="pointer-events-none">
                                                <JockeyProductCard product={product} />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Swiper
                                        onSwiper={(swiper) => {
                                            bottomSwiperRef.current = swiper;
                                        }}
                                        modules={[Pagination, Autoplay]}
                                        spaceBetween={20}
                                        slidesPerView={1}
                                        breakpoints={{
                                            640: { slidesPerView: 2 },
                                            1024: { slidesPerView: carouselSettings.itemsPerView },
                                        }}
                                        pagination={false}
                                        autoplay={carouselSettings.autoPlay ? {
                                            delay: carouselSettings.interval,
                                            disableOnInteraction: false,
                                            reverseDirection: true 
                                        } : false}
                                        loop={true}
                                        observer={true}
                                        observeParents={true}
                                        className="h-full"
                                    >
                                        {[...displayProducts].reverse().map((product, index) => (
                                            <SwiperSlide key={`bottom-${product._id || index}`} className='p-2 pb-8'>
                                                 <JockeyProductCard 
                                                    product={product} 
                                                    onClick={() => {
                                                        const productId = product._id || product.id;
                                                        if (productId) {
                                                            if (isEditMode) {
                                                                navigate(`/my-admin/products?edit=${productId}`);
                                                            } else {
                                                                navigate(`/product/${productId}`);
                                                            }
                                                        }
                                                    }}
                                                />
                                            </SwiperSlide>
                                        ))}
                                    </Swiper>
                                )}
                            </motion.div>

                            {/* Shared Navigation Buttons - Centered between rows */}
                            {!isPreview && carouselSettings.showArrows && (
                                <>
                                    <button 
                                        onClick={() => {
                                            topSwiperRef.current?.slidePrev();
                                            bottomSwiperRef.current?.slideNext();
                                        }}
                                        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur-sm shadow-xl rounded-full flex items-center justify-center text-gray-800 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-gray-100"
                                    >
                                        <ChevronLeft className="w-6 h-6" />
                                    </button>
                                    <button 
                                        onClick={() => {
                                            // Right Arrow
                                            topSwiperRef.current?.slideNext();
                                            bottomSwiperRef.current?.slidePrev();
                                        }}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 w-12 h-12 bg-white/90 backdrop-blur-sm shadow-xl rounded-full flex items-center justify-center text-gray-800 hover:bg-black hover:text-white transition-all opacity-0 group-hover:opacity-100 border border-gray-100"
                                    >
                                        <ChevronRight className="w-6 h-6" />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </EditableWrapper>
    );
};
