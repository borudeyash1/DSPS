import { create } from 'zustand';
import { Product } from '../types';
import { productService } from '../services';

interface ProductState {
    products: Product[];
    featuredProducts: Product[];
    currentProduct: Product | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        category?: string;
        subcategory?: string;
        minPrice?: number;
        maxPrice?: number;
        search?: string;
        sort?: string;
    };
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };

    // Actions
    fetchProducts: (params?: any) => Promise<void>;
    fetchFeaturedProducts: () => Promise<void>;
    fetchProductById: (id: string) => Promise<void>;
    setFilters: (filters: any) => void;
    clearFilters: () => void;
    setCurrentProduct: (product: Product | null) => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    featuredProducts: [],
    currentProduct: null,
    isLoading: false,
    error: null,
    filters: {},
    pagination: {
        page: 1,
        limit: 12,
        total: 0,
        pages: 0,
    },

    fetchProducts: async (params) => {
        set({ isLoading: true, error: null });
        try {
            const response = await productService.getProducts({
                ...get().filters,
                ...params,
            });

            if (response.success) {
                set({
                    products: response.data,
                    pagination: response.pagination || get().pagination,
                    isLoading: false,
                });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch products',
                isLoading: false,
            });
        }
    },

    fetchFeaturedProducts: async () => {
        try {
            const response = await productService.getFeaturedProducts();
            if (response.success) {
                set({ featuredProducts: response.data });
            }
        } catch (error: any) {
            console.error('Failed to fetch featured products:', error);
        }
    },

    fetchProductById: async (id) => {
        set({ isLoading: true, error: null });
        try {
            const response = await productService.getProductById(id);
            if (response.success) {
                set({ currentProduct: response.data, isLoading: false });
            }
        } catch (error: any) {
            set({
                error: error.response?.data?.message || 'Failed to fetch product',
                isLoading: false,
            });
        }
    },

    setFilters: (filters) => {
        set({ filters });
        get().fetchProducts();
    },

    clearFilters: () => {
        set({ filters: {} });
        get().fetchProducts();
    },

    setCurrentProduct: (product) => set({ currentProduct: product }),
}));
