import { create } from 'zustand';
import api from '../services/api';
import { Product } from '../types';

interface WishlistState {
    wishlist: Product[];
    loading: boolean;
    error: string;
    fetchWishlist: () => Promise<void>;
    addToWishlist: (productId: string) => Promise<void>;
    removeFromWishlist: (productId: string) => Promise<void>;
    clearWishlist: () => Promise<void>;
    isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    wishlist: [],
    loading: false,
    error: '',

    fetchWishlist: async () => {
        set({ loading: true, error: '' });
        try {
            const response = await api.get('/wishlist');
            // Backend returns { data: { wishlist: [...] } }
            set({ wishlist: response.data.data.wishlist || [], loading: false });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to fetch wishlist', loading: false, wishlist: [] });
        }
    },

    addToWishlist: async (productId: string) => {
        try {
            console.log('Adding to wishlist, productId:', productId);
            const response = await api.post('/wishlist', { productId });
            console.log('Add to wishlist response:', response.data);
            // Refresh wishlist
            await get().fetchWishlist();
        } catch (error: any) {
            console.error('Add to wishlist error:', error.response?.data);
            const errorMessage = error.response?.data?.message || 'Failed to add to wishlist';
            set({ error: errorMessage });
            
            // Don't throw error if product is already in wishlist
            if (errorMessage === 'Product already in wishlist') {
                // Refresh wishlist to sync state
                await get().fetchWishlist();
                return;
            }
            throw error;
        }
    },

    removeFromWishlist: async (productId: string) => {
        try {
            await api.delete(`/wishlist/${productId}`);
            // Remove from local state
            set(state => ({
                wishlist: state.wishlist.filter(item => item._id !== productId)
            }));
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to remove from wishlist' });
            throw error;
        }
    },

    clearWishlist: async () => {
        try {
            await api.delete('/wishlist');
            set({ wishlist: [] });
        } catch (error: any) {
            set({ error: error.response?.data?.message || 'Failed to clear wishlist' });
        }
    },

    isInWishlist: (productId: string) => {
        return get().wishlist.some(item => item._id === productId);
    }
}));
