import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '../types';
import api from '../services/api';

interface Coupon {
    code: string;
    discountAmount: number;
    type: 'fixed' | 'percentage';
    value: number;
}

interface CartState {
    items: CartItem[];
    isCartOpen: boolean;
    coupon: Coupon | null;

    // Actions
    addItem: (product: Product, quantity: number, size: string, color: string) => void;
    removeItem: (productId: string, size: string, color: string) => void;
    updateQuantity: (productId: string, size: string, color: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getFinalTotal: () => number;
    getCartCount: () => number;
    openCart: () => void;
    closeCart: () => void;
    toggleCart: () => void;
    applyCoupon: (code: string) => Promise<boolean>;
    removeCoupon: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isCartOpen: false,
            coupon: null,

            addItem: (product, quantity, size, color) => {
                const items = get().items;
                const existingItemIndex = items.findIndex(
                    (item) =>
                        item.product._id === product._id &&
                        item.size === size &&
                        item.color === color
                );

                if (existingItemIndex > -1) {
                    // Update quantity if item exists
                    const newItems = [...items];
                    newItems[existingItemIndex].quantity += quantity;
                    set({ items: newItems });
                } else {
                    // Add new item
                    set({ items: [...items, { product, quantity, size, color }] });
                }
                
                // Re-validate coupon if exists
                const coupon = get().coupon;
                if (coupon) {
                    get().applyCoupon(coupon.code);
                }
            },

            removeItem: (productId, size, color) => {
                set({
                    items: get().items.filter(
                        (item) =>
                            !(
                                item.product._id === productId &&
                                item.size === size &&
                                item.color === color
                            )
                    ),
                });
                
                // Re-validate coupon if exists
                const coupon = get().coupon;
                if (coupon) {
                    get().applyCoupon(coupon.code);
                }
            },

            updateQuantity: (productId, size, color, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId, size, color);
                    return;
                }

                const items = get().items;
                const itemIndex = items.findIndex(
                    (item) =>
                        item.product._id === productId &&
                        item.size === size &&
                        item.color === color
                );

                if (itemIndex > -1) {
                    const newItems = [...items];
                    newItems[itemIndex].quantity = quantity;
                    set({ items: newItems });
                }
                
                // Re-validate coupon if exists
                const coupon = get().coupon;
                if (coupon) {
                    get().applyCoupon(coupon.code);
                }
            },

            clearCart: () => set({ items: [], coupon: null }),

            getCartTotal: () => {
                return get().items.reduce((total, item) => {
                    const price = item.product.discountPrice || item.product.price;
                    return total + price * item.quantity;
                }, 0);
            },
            
            getFinalTotal: () => {
                const subtotal = get().getCartTotal();
                const coupon = get().coupon;
                if (coupon) {
                    return Math.max(0, subtotal - coupon.discountAmount);
                }
                return subtotal;
            },

            getCartCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0);
            },
            openCart: () => set({ isCartOpen: true }),
            closeCart: () => set({ isCartOpen: false }),
            toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
            
            applyCoupon: async (code: string) => {
                try {
                    const orderAmount = get().getCartTotal();
                    const response = await api.post('/coupons/validate', { code, orderAmount });
                    
                    if (response.data.success) {
                        set({ coupon: response.data.data });
                        return true;
                    }
                    return false;
                } catch (error: any) {
                    console.error('Failed to apply coupon:', error);
                    // Optionally remove invalid coupon if it was previously set
                    set({ coupon: null });
                    throw error; 
                }
            },
            
            removeCoupon: () => set({ coupon: null })
        }),
        {
            name: 'cart-storage',
        }
    )
);
