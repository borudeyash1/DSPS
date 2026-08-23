import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface Product {
    _id: string;
    name: string;
    price: number;
    discountPrice?: number;
    images?: Array<{ url: string }>;
    colorVariants?: Array<{
        images: Array<{ view: string; url: string }>;
    }>;
}

interface FeaturedProductsProps {
    config: {
        productIds?: string[];
        showPrice?: boolean;
        columns?: number;
    };
}

const convertGoogleDriveUrl = (url: string): string => {
    if (!url) return url;
    const driveMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (driveMatch) {
        return `https://drive.google.com/thumbnail?id=${driveMatch[1]}&sz=w1000`;
    }
    return url;
};

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ config }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);

    useEffect(() => {
        fetchProducts();
    }, [config.productIds]);

    const fetchProducts = async () => {
        try {
            setLoading(true);

            if (config.productIds && config.productIds.length > 0) {
                const productPromises = config.productIds.map(id =>
                    axios.get(`${API_URL}/products/${id}`)
                );
                const responses = await Promise.all(productPromises);
                setProducts(responses.map(res => res.data.data).filter(Boolean));
            } else {
                const response = await axios.get(`${API_URL}/products?isFeatured=true&limit=8`);
                setProducts(response.data.data || []);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const getProductImage = (product: Product) => {
        if (product.colorVariants && product.colorVariants.length > 0) {
            const frontImage = product.colorVariants[0].images.find(img => img.view === 'front');
            if (frontImage) return convertGoogleDriveUrl(frontImage.url);
        }
        if (product.images && product.images.length > 0) {
            return convertGoogleDriveUrl(product.images[0].url);
        }
        return '';
    };

    const columns = config.columns || 4;
    const showPrice = config.showPrice !== false;

    const scroll = (direction: 'left' | 'right') => {
        const container = document.getElementById('featured-products-scroll');
        if (container) {
            const scrollAmount = 300;
            const newPosition = direction === 'left'
                ? scrollPosition - scrollAmount
                : scrollPosition + scrollAmount;

            container.scrollTo({ left: newPosition, behavior: 'smooth' });
            setScrollPosition(newPosition);
        }
    };

    if (loading) {
        return (
            <div className="container-custom py-16">
                <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-6`}>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="animate-pulse">
                            <div className="aspect-square bg-gray-200 rounded-lg mb-4" />
                            <div className="h-4 bg-gray-200 rounded mb-2" />
                            <div className="h-4 bg-gray-200 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return null;
    }

    return (
        <div className="container-custom py-16">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-bold">Featured Products</h2>

                {products.length > columns && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="p-2 border rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-2 border rounded-full hover:bg-gray-100 transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>

            <div
                id="featured-products-scroll"
                className="overflow-x-auto scrollbar-hide"
            >
                <div className={`grid grid-flow-col auto-cols-[250px] md:auto-cols-[${100 / columns}%] gap-6`}>
                    {products.map((product) => (
                        <Link
                            key={product._id}
                            to={`/product/${product._id}`}
                            className="group block"
                        >
                            {/* Image */}
                            <div className="aspect-square overflow-hidden rounded-lg mb-4 bg-gray-100">
                                {getProductImage(product) ? (
                                    <img
                                        src={getProductImage(product)}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No Image
                                    </div>
                                )}
                            </div>

                            {/* Name */}
                            <h3 className="font-medium mb-2 group-hover:text-gray-600 transition-colors line-clamp-2">
                                {product.name}
                            </h3>

                            {/* Price */}
                            {showPrice && (
                                <div className="flex items-center gap-2">
                                    {product.discountPrice ? (
                                        <>
                                            <span className="font-bold">₹{product.discountPrice}</span>
                                            <span className="text-sm text-gray-400 line-through">₹{product.price}</span>
                                        </>
                                    ) : (
                                        <span className="font-bold">₹{product.price}</span>
                                    )}
                                </div>
                            )}
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FeaturedProducts;
