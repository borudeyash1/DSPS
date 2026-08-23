import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EditableWrapper } from '../editor/EditableWrapper';
import axios from 'axios';

interface EssentialsCategoryGridProps {
    sectionId?: string;
    content?: {
        heading?: string;
        selectedCategories?: string[]; // Category IDs to display
        selectedBannerProducts?: string[]; // Product IDs for banners
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

export const EssentialsCategoryGridRenderer = ({
    sectionId = '',
    content,
    background,
    isEditMode = false,
    onEdit = () => { },
}: EssentialsCategoryGridProps) => {
    const [categories, setCategories] = useState<any[]>([]);
    const [bannerProducts, setBannerProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch categories and products
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // Fetch categories
                const categoriesResponse = await axios.get(`${import.meta.env.VITE_API_URL}/categories`);
                const allCategories = categoriesResponse.data;

                // Filter selected categories or use first 6
                let displayCategories = allCategories;
                if (content?.selectedCategories && content.selectedCategories.length > 0) {
                    displayCategories = allCategories.filter((cat: any) =>
                        content.selectedCategories?.includes(cat._id)
                    );
                }
                setCategories((displayCategories || []).slice(0, 6));

                // Fetch products for banners
                const productsResponse = await axios.get(`${import.meta.env.VITE_API_URL}/products`, {
                    params: {
                        limit: 10,
                        isActive: true,
                        sort: '-createdAt',
                    },
                });

                // Filter selected products or use first 2
                const productsData = productsResponse.data.data?.products || productsResponse.data.products || [];
                let displayProducts = productsData;
                if (content?.selectedBannerProducts && content.selectedBannerProducts.length > 0) {
                    displayProducts = productsData.filter((prod: any) =>
                        content.selectedBannerProducts?.includes(prod._id)
                    );
                }
                setBannerProducts(displayProducts.slice(0, 2));
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [content?.selectedCategories, content?.selectedBannerProducts]);

    if (loading) {
        return (
            <div className="w-full py-12 px-4 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading essentials...</p>
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
                <div className="max-w-7xl mx-auto">
                    {/* Heading */}
                    <EditableWrapper
                        type="text"
                        sectionId={sectionId}
                        elementPath="content.heading"
                        currentValue={content?.heading || 'ESSENTIALS MADE AMAZING'}
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
                            <span className="font-normal">ESSENTIALS</span>{' '}
                            <span className="font-bold">MADE AMAZING</span>
                        </motion.h2>
                    </EditableWrapper>

                    {/* Category Grid (Top Row) */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        {categories.map((category, index) => (
                            <motion.div
                                key={category._id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: index * 0.1 }}
                                className="group cursor-pointer"
                                onClick={() => {
                                    if (!isEditMode) {
                                        window.location.href = `/products/${category.slug}`;
                                    }
                                }}
                            >
                                <div className="aspect-[4/5] rounded-2xl overflow-hidden mb-2 bg-gradient-to-br from-purple-100 to-blue-100 relative">
                                    {category.image ? (
                                        <img
                                            src={category.image}
                                            alt={category.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <span className="text-4xl">📦</span>
                                        </div>
                                    )}
                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                </div>
                                <p className="text-center text-sm font-medium group-hover:text-orange-600 transition-colors">
                                    {category.name}
                                </p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Banner Grid (Bottom Row) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {bannerProducts.map((product, index) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.3 + index * 0.2 }}
                                className="relative rounded-2xl overflow-hidden group cursor-pointer h-[300px]"
                                onClick={() => {
                                    if (!isEditMode) {
                                        window.location.href = `/product/${product._id}`;
                                    }
                                }}
                            >
                                <img
                                    src={product.images?.[0] || 'https://placehold.co/400x300'}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex flex-col justify-center px-8">
                                    <motion.h3
                                        initial={{ x: -20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.5 + index * 0.2 }}
                                        className="text-white text-4xl font-bold mb-2"
                                    >
                                        {product.name.toUpperCase().substring(0, 20)}
                                    </motion.h3>
                                    <motion.p
                                        initial={{ x: -20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.6 + index * 0.2 }}
                                        className="text-white text-sm mb-4"
                                    >
                                        {product.description?.substring(0, 50) || 'Premium Quality Products'}
                                    </motion.p>
                                    <motion.button
                                        initial={{ x: -20, opacity: 0 }}
                                        whileInView={{ x: 0, opacity: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.5, delay: 0.7 + index * 0.2 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="w-fit px-6 py-2 border-2 border-white text-white hover:bg-white hover:text-black transition-all duration-300"
                                    >
                                        EXPLORE NOW
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Edit Mode Helpers */}
                    {isEditMode && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-800">
                                <strong>Edit Mode:</strong> Click on the section to select categories and banner products in the property panel.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </EditableWrapper>
    );
};

