import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { EditableWrapper } from '../editor/EditableWrapper';
import { useNavigate } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface ProductCarouselProps {
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
  gridSettings?: {
    itemsPerRow?: {
      mobile?: number;
      tablet?: number;
      desktop?: number;
    };
    gap?: string;
  };
  products?: any[];
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

export const ProductCarouselRenderer = ({
  sectionId = '',
  content,
  background,
  carouselSettings,
  gridSettings,
  products = [],
  isEditMode = false,
  onEdit = () => { },
}: ProductCarouselProps) => {
  const navigate = useNavigate();

  // Prioritize content.products (saved data), then products prop, then fallback to dummy data
  const mockProducts = content?.products && content.products.length > 0
    ? content.products
    : products.length > 0
      ? products
      : [
        { id: 1, name: 'French Terry Sweatshirt', price: '₹1,899', image: 'https://placehold.co/300x400/667eea/ffffff?text=Product+1' },
        { id: 2, name: 'Ultra Warm Thermal Set', price: '₹2,499', image: 'https://placehold.co/300x400/764ba2/ffffff?text=Product+2' },
        { id: 3, name: 'All Weather Jacket', price: '₹3,299', image: 'https://placehold.co/300x400/f093fb/ffffff?text=Product+3' },
        { id: 4, name: 'Comfort Joggers', price: '₹1,599', image: 'https://placehold.co/300x400/4facfe/ffffff?text=Product+4' },
        { id: 5, name: 'Premium Hoodie', price: '₹2,199', image: 'https://placehold.co/300x400/667eea/ffffff?text=Product+5' },
        { id: 6, name: 'Winter Collection', price: '₹2,899', image: 'https://placehold.co/300x400/764ba2/ffffff?text=Product+6' },
      ];

  const settings = {
    autoPlay: carouselSettings?.autoPlay ?? false,
    interval: carouselSettings?.interval ?? 5000,
    showArrows: carouselSettings?.showArrows ?? true,
    showDots: carouselSettings?.showDots ?? true,
  };

  const itemsPerView = {
    mobile: gridSettings?.itemsPerRow?.mobile ?? 1,
    tablet: gridSettings?.itemsPerRow?.tablet ?? 2,
    desktop: gridSettings?.itemsPerRow?.desktop ?? 3,
  };



  const handleProductClick = (product: any) => {
    if (isEditMode) return;
    const productId = product.dbId || product._id || product.id;
    if (productId) {
      navigate(`/product/${productId}`);
    }
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
        <div className="max-w-7xl mx-auto">
          {content?.heading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
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
                  style={{
                    fontSize: content.headingStyle?.fontSize || 'clamp(1.5rem, 5vw, 2.5rem)',
                    fontWeight: content.headingStyle?.fontWeight || 'bold',
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
                  <p className="text-lg text-gray-600 mt-2">{content.subheading}</p>
                </EditableWrapper>
              )}
            </motion.div>
          )}

          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            navigation={settings.showArrows}
            pagination={settings.showDots ? { clickable: true } : false}
            autoplay={settings.autoPlay ? { delay: settings.interval } : false}
            spaceBetween={parseInt(gridSettings?.gap || '24')}
            breakpoints={{
              320: { slidesPerView: itemsPerView.mobile },
              768: { slidesPerView: itemsPerView.tablet },
              1024: { slidesPerView: itemsPerView.desktop },
            }}
            className="pb-12"
          >
            {mockProducts.map((product, index) => (
              <SwiperSlide key={product.id || product._id || index}>
                <motion.div
                  whileHover={{ y: -8 }}
                  className="bg-gray-50 rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow cursor-pointer group"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <EditableWrapper
                      type="product"
                      sectionId={sectionId}
                      elementPath="content.products"
                      currentValue={product}
                      allProducts={mockProducts}
                      productIndex={index}
                      isEditMode={isEditMode}
                      onEdit={onEdit}
                    >
                      <img
                        src={product.image || (product.images && product.images[0]?.url)}
                        alt={product.name}
                        onClick={() => handleProductClick(product)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </EditableWrapper>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-2" onClick={() => handleProductClick(product)}>{product.name}</h3>
                    <p className="text-xl font-bold text-primary">{product.price}</p>
                    <button
                      onClick={() => handleProductClick(product)}
                      className="mt-3 w-full py-2 bg-black text-white hover:bg-gray-800 transition-colors"
                    >
                      EXPLORE NOW
                    </button>
                  </div>
                </motion.div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </EditableWrapper>
  );
};
