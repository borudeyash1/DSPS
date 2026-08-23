import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useCategoryStore } from '../store/categoryStore';
import { ChevronDown } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FeaturedProduct {
  _id: string;
  name: string;
  price: number;
  discountPrice?: number;
  images: Array<{ url: string; view?: string }>;
  colorVariants: Array<{ images: Array<{ url: string; view?: string }> }>;
}

interface MegaMenuProps {
  category: string;
  label: string;
}

// Helper to convert Google Drive URLs
const convertGoogleDriveUrl = (url: string): string => {
  if (!url) return url;
  const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    const fileId = driveMatch[1];
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
  }
  return url;
};

interface MegaMenuProps {
  category: string;
  label: string;
}


const MegaMenu = ({ category, label }: MegaMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { hierarchy, fetchHierarchy } = useCategoryStore();
  const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (Object.keys(hierarchy).length === 0) {
      console.log('Fetching hierarchy from MegaMenu...');
      fetchHierarchy();
    }
  }, [hierarchy, fetchHierarchy]);

  useEffect(() => {
    if (isOpen && category) {
      fetchFeaturedProducts();
    }
  }, [isOpen, category]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 150);
  };

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      // Fetch more products to populate list
      const response = await axios.get(
        `${API_URL}/products?category=${category.toLowerCase()}&limit=20&sort=-createdAt`
      );

      if (response.data.data && response.data.data.length > 0) {
        setFeaturedProducts(response.data.data);
      } else {
        setFeaturedProducts([]);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Get product image
  const getProductImage = (product: FeaturedProduct) => {
    if (!product) return '';

    // Try color variants first
    if (product.colorVariants && product.colorVariants.length > 0) {
      const frontImage = product.colorVariants[0].images.find(img => img.view === 'front');
      if (frontImage) return convertGoogleDriveUrl(frontImage.url);
    }

    // Fallback to regular images
    if (product.images && product.images.length > 0) {
      return convertGoogleDriveUrl(product.images[0].url);
    }

    return '';
  };

  // Case-insensitive lookup for specific category
  const categoryKey = Object.keys(hierarchy).find(
    k => k.toLowerCase() === category.toLowerCase()
  ) || category;

  const categoryData = hierarchy[categoryKey] || {};
  const hasSubcategories = Object.keys(categoryData).length > 0;

  // Format display name (capitalize first letter of each word)
  const formatName = (str: string) => {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div
      className="h-full flex items-center"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative flex items-center h-full">
        {/* Hover Bridge */}
        <div className="absolute top-full left-0 w-full h-8 bg-transparent z-40" />

        {/* Category Link */}
        <Link
          to={`/products/${category}`}
          className="flex items-center gap-1 text-base font-bold uppercase tracking-wider text-gray-800 hover:text-black py-2 decoration-2 underline-offset-4 hover:underline transition-all duration-300"
        >
          {label}
          {hasSubcategories && <ChevronDown className="w-4 h-4" />}
        </Link>
      </div>

      {/* Mega Menu Dropdown - 3 Column Layout */}
      {isOpen && hasSubcategories && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50">
          <div
            className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 transition-all duration-300 ease-out max-h-[80vh] overflow-y-auto custom-scrollbar"
            style={{
              animation: 'slideDown 0.3s ease-out',
              width: 'max-content',
              maxWidth: 'min(1400px, calc(100vw - 2rem))',
              minWidth: 'min(1000px, calc(100vw - 2rem))'
            }}
          >
            <div className="px-8 py-8">
              <div className="grid grid-cols-12 gap-8">
                
                {/* LEFT SIDE - Subcategories, List & Trending (Spans 8) */}
                <div className="col-span-8 border-r border-gray-100 pr-8">
                  <div className="flex flex-col h-full justify-between">
                    
                    {/* Top Section: Categories & Popular List */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                      {/* Subcategories List */}
                      <div className="space-y-6">
                        {Object.entries(categoryData).map(([subcategory, types]) => (
                          <div key={subcategory} className="space-y-3">
                            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-200">
                              {formatName(subcategory)}
                            </h3>
                            <ul className="space-y-2">
                              {(types as string[]).map((type: string) => (
                                <li key={type}>
                                  <Link
                                    to={`/products/${category}/${subcategory}/${type}`}
                                    className="text-sm text-gray-600 hover:text-orange-600 hover:underline transition-colors block"
                                    onClick={() => setIsOpen(false)}
                                  >
                                    {formatName(type)}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Product Names List (Filling Whitespace) */}
                      <div className="space-y-4">
                         <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-200">
                            {(category.toLowerCase() === 'men' || category.toLowerCase() === 'mens') 
                               ? 'Formal Shirts' 
                               : `Popular in ${formatName(category)}`}
                         </h3>
                         <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                            {loading ? (
                              <div className="space-y-2">
                                {[1,2,3,4,5].map(i => <div key={i} className="h-4 bg-gray-100 rounded w-3/4 animate-pulse"></div>)}
                              </div>
                            ) : (
                               featuredProducts.length > 0 ? (
                                 featuredProducts.slice(0, 15).map(product => (
                                   <Link 
                                     key={product._id}
                                     to={`/product/${product._id}`}
                                     className="block text-sm text-gray-500 hover:text-primary truncate transition-colors"
                                     onClick={() => setIsOpen(false)}
                                     title={product.name}
                                   >
                                     {product.name}
                                   </Link>
                                 ))
                               ) : (
                                 <p className="text-xs text-gray-400 italic">No products available</p>
                               )
                            )}
                              <Link to={`/products/${category}`} className="block text-sm font-medium text-primary hover:underline pt-2">
                                  View All Products &rarr;
                              </Link>
                         </div>
                      </div>
                    </div>

                    {/* Trending Collections hidden as per request */}

                  </div>
                </div>

                {/* RIGHT SIDE - Special Offerings (Spans 4) */}
                <div className="col-span-4 pl-4">
                  <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                    Our Special Offerings
                  </h3>
                  {loading ? (
                    <div className="grid grid-cols-2 gap-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-[3/4] bg-gray-100 rounded-lg animate-pulse" />
                      ))}
                    </div>
                  ) : featuredProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {featuredProducts.slice(0, 4).map((product) => (
                        <Link
                          key={product._id}
                          to={`/product/${product._id}`}
                          className="group block rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg transition-all duration-300"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className="aspect-[3/4] overflow-hidden bg-gray-100 relative">
                            {getProductImage(product) ? (
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                loading="lazy"
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-gray-300 text-xs">No Image</span>
                              </div>
                            )}
                          </div>
                          <div className="p-2">
                            <h4 className="text-xs font-medium text-gray-900 line-clamp-1 mb-1">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-bold text-gray-900">₹{product.discountPrice || product.price}</span>
                                {product.discountPrice && <span className="text-xs text-gray-400 line-through">₹{product.price}</span>}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-8">
                      <p>No special offerings</p>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MegaMenu;
