import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface FeaturedProduct {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images?: Array<{ url: string }>;
    colorVariants?: Array<{
        images: Array<{ view: string; url: string }>;
    }>;
}

interface MegaMenuProps {
    category: string;
    subcategories: Array<{
        name: string;
        slug: string;
        items: Array<{ name: string; slug: string }>;
    }>;
    isOpen: boolean;
    onClose: () => void;
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

const MegaMenu: React.FC<MegaMenuProps> = ({ category, subcategories, isOpen, onClose }) => {
    const [featuredProducts, setFeaturedProducts] = useState<FeaturedProduct[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && category) {
            fetchFeaturedProducts();
        }
    }, [isOpen, category]);

    const fetchFeaturedProducts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${API_URL}/products?category=${category.toLowerCase()}&isFeatured=true&limit=6&sort=-createdAt`
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

    if (!isOpen) return null;

    return (
        <div
            className="absolute left-0 right-0 top-full z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            onMouseLeave={onClose}
        >
            <div className="bg-white shadow-2xl border-t border-gray-100">
                <div className="container mx-auto px-6 py-8">
                    <div className="grid grid-cols-12 gap-8">
                        {/* LEFT SIDE - Category Links (60%) */}
                        <div className="col-span-7">
                            <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                                {subcategories.map((subcategory) => (
                                    <div key={subcategory.slug} className="space-y-3">
                                        {/* Subcategory Header */}
                                        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider pb-2 border-b border-gray-200">
                                            {subcategory.name}
                                        </h3>

                                        {/* Items List */}
                                        <ul className="space-y-2">
                                            {subcategory.items.map((item) => (
                                                <li key={item.slug}>
                                                    <Link
                                                        to={`/products?category=${category.toLowerCase()}&subcategory=${subcategory.slug}&type=${item.slug}`}
                                                        onClick={onClose}
                                                        className="text-sm text-gray-600 hover:text-orange-600 hover:underline transition-colors block"
                                                    >
                                                        {item.name}
                                                    </Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* RIGHT SIDE - Featured Products Grid (40%) */}
                        <div className="col-span-5">
                            {loading ? (
                                <div className="grid grid-cols-3 gap-3">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="aspect-square bg-gray-100 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : featuredProducts.length > 0 ? (
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4">
                                        Our Special Offerings
                                    </h3>
                                    <div className="grid grid-cols-3 gap-3">
                                        {featuredProducts.slice(0, 6).map((product) => (
                                            <Link
                                                key={product._id}
                                                to={`/product/${product._id}`}
                                                onClick={onClose}
                                                className="group block rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-white border border-gray-200 hover:shadow-lg transition-all duration-300"
                                            >
                                                {/* Product Image */}
                                                <div className="aspect-square overflow-hidden bg-gray-100">
                                                    {getProductImage(product) ? (
                                                        <img
                                                            src={getProductImage(product)}
                                                            alt={product.name}
                                                            loading="lazy"
                                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Product Info */}
                                                <div className="p-2">
                                                    <h4 className="text-xs font-medium text-gray-900 line-clamp-1 mb-1">
                                                        {product.name}
                                                    </h4>
                                                    <div className="flex items-center gap-1">
                                                        {product.discountPrice ? (
                                                            <>
                                                                <span className="text-sm font-bold text-gray-900">₹{product.discountPrice}</span>
                                                                <span className="text-xs text-gray-400 line-through">₹{product.price}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>

                                    {/* Trending Collections Section */}
                                    {featuredProducts.length >= 3 && (
                                        <div className="mt-6">
                                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                                                Trending Collections
                                            </h3>
                                            <div className="grid grid-cols-3 gap-3">
                                                {featuredProducts.slice(0, 3).map((product, index) => {
                                                    const colors = ['from-pink-400 to-pink-500', 'from-blue-400 to-blue-500', 'from-orange-400 to-orange-500'];
                                                    const labels = ['RELAX', 'ATHLEISURE', 'CASUALS'];

                                                    return (
                                                        <Link
                                                            key={product._id}
                                                            to={`/product/${product._id}`}
                                                            onClick={onClose}
                                                            className="group block relative rounded-lg overflow-hidden aspect-square"
                                                        >
                                                            <div className={`absolute inset-0 bg-gradient-to-br ${colors[index]} opacity-90 group-hover:opacity-100 transition-opacity`} />
                                                            {getProductImage(product) && (
                                                                <img
                                                                    src={getProductImage(product)}
                                                                    alt={product.name}
                                                                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
                                                                />
                                                            )}
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <span className="text-white font-bold text-sm tracking-wider">
                                                                    {labels[index]}
                                                                </span>
                                                            </div>
                                                        </Link>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
                                    <svg className="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <p className="text-sm">No Featured Products</p>
                                    <p className="text-xs mt-1">Mark products as featured in admin panel</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MegaMenu;
