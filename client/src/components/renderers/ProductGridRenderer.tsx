import { motion } from 'framer-motion';
import { Heart, ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { useWishlistStore } from '../../store/wishlistStore';
import { useAuthStore } from '../../store/authStore';
import { useToast } from '../../hooks/useToast';
import { EditableWrapper } from '../editor/EditableWrapper';

interface ProductGridProps {
  sectionId?: string;
  content?: {
    heading?: string;
    headingStyle?: any;
    subheading?: string;
    subheadingStyle?: any;
    products?: any[];
  };
  background?: any;
  gridSettings?: {
    columns?: number;
    gap?: string;
    itemsPerRow?: {
      mobile?: number;
      tablet?: number;
      desktop?: number;
    };
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

export const ProductGridRenderer = ({
  sectionId = '',
  content,
  background,
  gridSettings,
  products = [],
  isEditMode = false,
  onEdit = () => { },
}: ProductGridProps) => {
  const { addItem, openCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  const handleAddToCart = (product: any) => {
    try {
      // Logic to handle default size/color if needed, or open modal. ProductGrid usually just adds.
      addItem(product, 1, product.sizes?.[0] || '', product.colors?.[0] || '');
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
  // Prioritize content.products (saved data), then products prop, then fallback to dummy data
  const mockProducts = content?.products && content.products.length > 0
    ? content.products
    : products.length > 0
      ? products
      : [
        { id: 1, name: 'Super Combed Cotton Rich Fleece', price: '₹1,899', originalPrice: '₹2,499', image: 'https://placehold.co/300x400/667eea/ffffff?text=Product+1', badge: 'Bestseller' },
        { id: 2, name: 'Super Combed Cotton Rich Fleece Joggers', price: '₹1,899', image: 'https://placehold.co/300x400/764ba2/ffffff?text=Product+2', badge: 'Bestseller' },
        { id: 3, name: 'Ultra Warmth Full Sleeve Thermal Top', price: '₹1,309', image: 'https://placehold.co/300x400/f093fb/ffffff?text=Product+3', badge: 'Bestseller' },
        { id: 4, name: 'Microfiber Fabric Relaxed Fit Raglan', price: '₹1,649', image: 'https://placehold.co/300x400/4facfe/ffffff?text=Product+4', badge: 'Bestseller' },
        { id: 5, name: 'Premium Hoodie Collection', price: '₹2,199', image: 'https://placehold.co/300x400/667eea/ffffff?text=Product+5' },
        { id: 6, name: 'Winter Essentials Pack', price: '₹2,899', image: 'https://placehold.co/300x400/764ba2/ffffff?text=Product+6' },
        { id: 7, name: 'Comfort Joggers Set', price: '₹1,599', image: 'https://placehold.co/300x400/f093fb/ffffff?text=Product+7' },
        { id: 8, name: 'All Weather Jacket', price: '₹3,299', image: 'https://placehold.co/300x400/4facfe/ffffff?text=Product+8' },
      ];

  const itemsPerRow = {
    mobile: gridSettings?.itemsPerRow?.mobile ?? 2,
    tablet: gridSettings?.itemsPerRow?.tablet ?? 3,
    desktop: gridSettings?.itemsPerRow?.desktop ?? 4,
  };

  const gap = gridSettings?.gap || '24px';

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
              className="mb-12"
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
                    fontSize: content.headingStyle?.fontSize || 'clamp(1.5rem, 4vw, 2.5rem)',
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

          <div
            className="grid product-grid-custom"
            style={{
              gridTemplateColumns: `repeat(${itemsPerRow.mobile}, minmax(0, 1fr))`,
              gap: gap,
            }}
          >
            {mockProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  {product.badge && (
                    <div className="absolute top-3 left-3 z-10 bg-black text-white text-xs px-3 py-1 font-semibold">
                      {product.badge}
                    </div>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle(product);
                    }}
                    className={`absolute top-3 right-3 z-10 p-2 rounded-full transition-opacity hover:bg-red-50 ${isInWishlist(product.id || product._id) ? 'bg-red-50 text-red-500 opacity-100' : 'bg-white text-gray-400 opacity-0 group-hover:opacity-100'}`}
                  >
                    <Heart className={`w-5 h-5 ${isInWishlist(product.id || product._id) ? 'fill-current' : ''}`} />
                  </button>
                  <EditableWrapper
                    type="image"
                    sectionId={sectionId}
                    elementPath={`products[${index}].image`}
                    currentValue={product.image}
                    isEditMode={isEditMode}
                    onEdit={onEdit}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </EditableWrapper>
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-sm mb-2 line-clamp-2 min-h-[40px]">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg font-bold">{product.price}</span>
                    {product.originalPrice && (
                      <span className="text-sm text-gray-400 line-through">
                        {product.originalPrice}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                    className="w-full py-2.5 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    ADD TO BAG
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          <style>{`
            @media (min-width: 768px) {
              .product-grid-custom {
                grid-template-columns: repeat(${itemsPerRow.tablet}, minmax(0, 1fr)) !important;
              }
            }
            @media (min-width: 1024px) {
              .product-grid-custom {
                grid-template-columns: repeat(${itemsPerRow.desktop}, minmax(0, 1fr)) !important;
              }
            }
          `}</style>
        </div>
      </div>
    </EditableWrapper>
  );
};
