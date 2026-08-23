import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { EditableWrapper } from '../editor/EditableWrapper';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ColossalCarouselProps {
    sectionId?: string;
    content?: {
        heading?: string;
        headingStyle?: any;
        subheading?: string;
        subheadingStyle?: any;
        products?: any[];
    };
    background?: any;
    carouselSettings?: {
        autoPlay?: boolean;
        interval?: number;
        showArrows?: boolean;
        showDots?: boolean;
    };
    isEditMode?: boolean;
    onEdit?: (element: any) => void;
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

export const ColossalCarouselRenderer = ({
    sectionId = '',
    content,
    background,
    carouselSettings,
    isEditMode = false,
    onEdit = () => { },
}: ColossalCarouselProps) => {
    const navigate = useNavigate();

    // Mock data based on the screenshots provided by user
    const defaultProducts = [
        {
            id: 1,
            name: 'ESSENTIAL JOGGERS',
            subtext: 'Soft and ready for the season.',
            image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80',
            link: '/products/joggers'
        },
        {
            id: 2,
            name: 'SEAMLESS FIT SHAPEWEAR',
            subtext: 'Shaping that moves with you.',
            image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
            link: '/products/shapewear'
        },
        {
            id: 3,
            name: 'FLEX MOTION TRACK PANT',
            subtext: 'Sleek form, free movement.',
            image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80',
            link: '/products/track-pants'
        }
    ];

    const displayProducts = content?.products && content.products.length > 0
        ? content.products
        : defaultProducts;

    const settings = {
        autoPlay: carouselSettings?.autoPlay ?? false,
        interval: carouselSettings?.interval ?? 5000,
        showArrows: carouselSettings?.showArrows ?? true,
        showDots: carouselSettings?.showDots ?? true,
    };

    const handleProductClick = (product: any) => {
        if (isEditMode) return;
        if (product.link) navigate(product.link);
        else if (product.dbId || product._id) navigate(`/product/${product.dbId || product._id}`);
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
                <div className="max-w-[1600px] mx-auto">
                    {content?.heading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <EditableWrapper
                                type="text"
                                sectionId={sectionId}
                                elementPath="content.heading"
                                currentValue={content.heading}
                                currentStyle={content.headingStyle}
                                isEditMode={isEditMode}
                                onEdit={onEdit}
                            >
                                <h2
                                    className="uppercase tracking-wider mb-3"
                                    style={{
                                        fontSize: content.headingStyle?.fontSize || 'clamp(1.5rem, 5vw, 2.5rem)',
                                        fontWeight: content.headingStyle?.fontWeight || '800',
                                        color: content.headingStyle?.color || '#000000',
                                    }}
                                >
                                    {content.heading}
                                </h2>
                            </EditableWrapper>
                            {content.subheading && (
                                <EditableWrapper
                                    type="text"
                                    sectionId={sectionId}
                                    elementPath="content.subheading"
                                    currentValue={content.subheading}
                                    currentStyle={content.subheadingStyle}
                                    isEditMode={isEditMode}
                                    onEdit={onEdit}
                                >
                                    <p className="text-xl text-gray-600 font-medium">{content.subheading}</p>
                                </EditableWrapper>
                            )}
                        </motion.div>
                    )}

                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        navigation={settings.showArrows}
                        pagination={settings.showDots ? { clickable: true } : false}
                        autoplay={settings.autoPlay ? { delay: settings.interval } : false}
                        spaceBetween={30}
                        centeredSlides={true}
                        loop={true}
                        breakpoints={{
                            320: { slidesPerView: 1.2, spaceBetween: 20 },
                            768: { slidesPerView: 2, spaceBetween: 30 },
                            1024: { slidesPerView: 2.5, spaceBetween: 40 },
                        }}
                        className="colossal-swiper pb-16 !overflow-visible"
                    >
                        {displayProducts.map((product, index) => (
                            <SwiperSlide key={index} className="transition-all duration-300">
                                {({ isActive }) => (
                                    <motion.div
                                        className={`relative rounded-3xl overflow-hidden shadow-xl cursor-pointer h-[500px] group transition-all duration-500 ${isActive ? 'scale-100 opacity-100 ring-4 ring-white/50' : 'scale-95 opacity-70 blur-[1px]'}`}
                                        onClick={() => handleProductClick(product)}
                                    >
                                        <EditableWrapper
                                            type="product"
                                            sectionId={sectionId}
                                            elementPath="content.products"
                                            currentValue={product}
                                            allProducts={displayProducts}
                                            productIndex={index}
                                            isEditMode={isEditMode}
                                            onEdit={onEdit}
                                        >
                                            <div className="absolute inset-0 bg-gray-200">
                                                <img
                                                    src={product.image || product.url || 'https://placehold.co/800x600'}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                            </div>

                                            {/* Text Overlay */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                                            <div className="absolute top-1/2 left-1/2 md:left-8 transform -translate-x-1/2 md:translate-x-0 -translate-y-1/2 w-[90%] md:max-w-[60%] z-10 text-center md:text-left">
                                                <h3 className="text-3xl md:text-5xl font-black text-black leading-tight mb-2 tracking-tight uppercase"
                                                    style={{ textShadow: '2px 2px 0px rgba(255,255,255,0.2)' }}>
                                                    {product.name}
                                                </h3>
                                                <p className="text-xl text-black font-medium mb-8">
                                                    {product.subtext || product.description}
                                                </p>

                                                <button className="px-8 py-3 border-2 border-black text-black text-sm font-bold uppercase tracking-widest hover:bg-black hover:text-white transition-all duration-300">
                                                    Explore Now
                                                </button>
                                            </div>
                                        </EditableWrapper>
                                    </motion.div>
                                )}
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </EditableWrapper>
    );
};
