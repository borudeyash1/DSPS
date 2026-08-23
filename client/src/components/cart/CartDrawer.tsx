import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Loader2, Ticket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useToastStore } from '../../store/toastStore';
import { useWishlistStore } from '../../store/wishlistStore';

export const CartDrawer = () => {
    const {
        isCartOpen,
        closeCart,
        items,
        removeItem,
        updateQuantity,
        getCartTotal,
        clearCart,
        coupon,
        applyCoupon,
        removeCoupon,
        getFinalTotal
    } = useCartStore();
    const { showToast } = useToastStore();
    const { addToWishlist } = useWishlistStore();
    const navigate = useNavigate();
    const drawerRef = useRef<HTMLDivElement>(null);
    const [showCouponInput, setShowCouponInput] = useState(false);
    const [couponCode, setCouponCode] = useState('');
    const [isApplying, setIsApplying] = useState(false);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
                closeCart();
            }
        };

        if (isCartOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isCartOpen, closeCart]);

    const handleCheckout = () => {
        closeCart();
        navigate('/checkout');
    };

    const handleDeleteAll = () => {
        if (window.confirm('Are you sure you want to remove all items from your bag?')) {
            clearCart();
            showToast('All items removed from cart', 'info');
        }
    };

    const handleMoveAllToWishlist = async () => {
        try {
            let successCount = 0;
            let failCount = 0;

            // Add all items to wishlist
            for (const item of items) {
                try {
                    await addToWishlist(item.product._id!);
                    successCount++;
                } catch (error) {
                    // Continue even if some items fail
                    console.error('Failed to add item to wishlist:', error);
                    failCount++;
                }
            }

            // Show appropriate message based on results
            if (successCount > 0 && failCount === 0) {
                showToast(`All ${successCount} item(s) added to wishlist`, 'success');
            } else if (successCount > 0 && failCount > 0) {
                showToast(`${successCount} item(s) added to wishlist, ${failCount} failed`, 'info');
            } else {
                showToast('Failed to add items to wishlist', 'error');
            }
        } catch (error) {
            showToast('Failed to add items to wishlist', 'error');
        }
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            showToast('Please enter a coupon code', 'error');
            return;
        }

        setIsApplying(true);
        try {
            const success = await applyCoupon(couponCode);
            if (success) {
                showToast(`Coupon "${couponCode}" applied successfully!`, 'success');
                setShowCouponInput(false);
                setCouponCode('');
            } else {
                showToast('Invalid coupon code', 'error');
            }
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Failed to apply coupon';
            showToast(msg, 'error');
        } finally {
            setIsApplying(false);
        }
    };

    const handleRemoveCoupon = () => {
        removeCoupon();
        showToast('Coupon removed', 'info');
    };



    return (
        <AnimatePresence>
            {isCartOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-[1000] backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        ref={drawerRef}
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[1001] flex flex-col rounded-l-[30px] overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-gray-200 bg-white">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900">Items in my bag</h2>
                                <button
                                    onClick={closeCart}
                                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-gray-500 text-sm">
                                    <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <span>Items added - {items.length}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleDeleteAll}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        title="Remove all items"
                                    >
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={handleMoveAllToWishlist}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                        title="Move all to wishlist"
                                    >
                                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {items.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-gray-500">
                                    <ShoppingBag className="w-12 h-12 opacity-20" />
                                    <p>Your bag is empty.</p>
                                    <button
                                        onClick={closeCart}
                                        className="text-black font-semibold hover:underline"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {items.map((item) => (
                                        <motion.div
                                            layout
                                            key={`${item.product._id}-${item.size}-${item.color}`}
                                            className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex gap-4">
                                                {/* Checkbox */}
                                                <div className="flex-shrink-0 pt-1">
                                                    <div className="w-5 h-5 rounded border-2 border-gray-300 bg-gray-100 flex items-center justify-center">
                                                        <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </div>
                                                </div>

                                                {/* Image */}
                                                <button
                                                    onClick={() => {
                                                        closeCart();
                                                        navigate(`/product/${item.product._id}`);
                                                    }}
                                                    className="w-24 h-28 flex-shrink-0 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 hover:border-gray-300 transition-colors cursor-pointer"
                                                >
                                                    <img
                                                        src={(() => {
                                                            const product = item.product as any;

                                                            const matchingVariant = product.colorVariants?.find(
                                                                (cv: any) => cv.color?.toLowerCase() === item.color?.toLowerCase()
                                                            );

                                                            if (matchingVariant?.images?.length > 0) {
                                                                const frontImage = matchingVariant.images.find((img: any) => img.view === 'front');
                                                                if (frontImage?.url) return frontImage.url;
                                                                if (matchingVariant.images[0]?.url) return matchingVariant.images[0].url;
                                                            }

                                                            if (product.colorVariants?.[0]?.images?.length > 0) {
                                                                const firstImage = product.colorVariants[0].images.find((img: any) => img.view === 'front');
                                                                if (firstImage?.url) return firstImage.url;
                                                                if (product.colorVariants[0].images[0]?.url) return product.colorVariants[0].images[0].url;
                                                            }

                                                            if (product.images?.[0]?.url) {
                                                                return product.images[0].url;
                                                            }

                                                            return 'https://via.placeholder.com/150?text=No+Image';
                                                        })()}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </button>

                                                {/* Info */}
                                                <div className="flex-1 flex flex-col">
                                                    <div className="flex justify-between items-start gap-2 mb-3">
                                                        <button
                                                            onClick={() => {
                                                                closeCart();
                                                                navigate(`/product/${item.product._id}`);
                                                            }}
                                                            className="font-medium text-sm line-clamp-2 leading-snug hover:underline text-left text-gray-900"
                                                        >
                                                            {item.product.name}
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                removeItem(item.product._id!, item.size, item.color);
                                                                showToast('Item removed from cart', 'info');
                                                            }}
                                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>

                                                    {/* Size and Qty Dropdowns */}
                                                    <div className="flex gap-2 mb-3">
                                                        <div className="relative">
                                                            <select
                                                                value={item.size}
                                                                disabled
                                                                className="appearance-none border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm bg-gray-50 cursor-not-allowed text-gray-700"
                                                            >
                                                                <option value={item.size}>Size: {item.size}</option>
                                                            </select>
                                                            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                        <div className="relative">
                                                            <select
                                                                value={item.quantity}
                                                                onChange={(e) => updateQuantity(item.product._id!, item.size, item.color, parseInt(e.target.value))}
                                                                className="appearance-none border border-gray-300 rounded-md px-3 py-1.5 pr-8 text-sm bg-white cursor-pointer hover:border-gray-400 transition-colors"
                                                            >
                                                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                                                                    <option key={num} value={num}>Qty: {num}</option>
                                                                ))}
                                                            </select>
                                                            <svg className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </div>
                                                    </div>

                                                    {/* Price and Style */}
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-gray-900 text-lg">
                                                            ₹{((item.product.discountPrice || item.product.price) * item.quantity).toFixed(2)}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            Style: #{item.product._id?.slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}

                                    {/* Coupon Code Section */}
                                    {coupon ? (
                                        <div className="border border-green-200 bg-green-50 rounded-xl p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                                    <Ticket className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-green-800 text-sm">Coupon Applied</p>
                                                    <p className="text-xs text-green-700 font-mono mt-0.5">{coupon.code} (-₹{coupon.discountAmount.toFixed(2)})</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={handleRemoveCoupon}
                                                className="p-2 hover:bg-green-200 rounded-full text-green-700 transition-colors"
                                                title="Remove coupon"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ) : showCouponInput ? (
                                        <div className="border border-gray-200 rounded-xl p-4 bg-white">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Ticket className="w-5 h-5 text-gray-600" />
                                                <span className="font-medium text-gray-900">Apply Coupon Code</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={couponCode}
                                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                    placeholder="Enter coupon code"
                                                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-400"
                                                    disabled={isApplying}
                                                />
                                                <button
                                                    onClick={handleApplyCoupon}
                                                    disabled={isApplying}
                                                    className="px-6 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                                                >
                                                    {isApplying ? (
                                                        <>
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        </>
                                                    ) : 'APPLY'}
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => setShowCouponInput(false)}
                                                className="text-xs text-gray-500 hover:text-gray-700 mt-2"
                                                disabled={isApplying}
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            onClick={() => setShowCouponInput(true)}
                                            className="border border-gray-200 rounded-xl p-4 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Ticket className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                                                <span className="font-medium text-gray-900">Gift Card/ Gift Voucher</span>
                                            </div>
                                            <button className="px-6 py-2 bg-gray-800 text-white text-sm font-semibold rounded-lg hover:bg-gray-900 transition-colors">
                                                ADD
                                            </button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer - Order Details */}
                        {items.length > 0 && (
                            <div className="border-t border-gray-200 bg-white">
                                <div className="p-6">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">Order Details</h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Subtotal</span>
                                            <span className="font-semibold text-gray-900">₹{getCartTotal().toFixed(2)}</span>
                                        </div>
                                        {coupon && (
                                            <div className="flex justify-between text-sm text-green-600">
                                                <span className="flex items-center gap-1">
                                                    <Ticket className="w-3 h-3" />
                                                    Discount ({coupon.code})
                                                </span>
                                                <span className="font-semibold">-₹{coupon.discountAmount.toFixed(2)}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="border border-gray-200 rounded-xl p-4 flex items-center justify-between bg-gray-50">
                                        <div>
                                            <div className="text-2xl font-bold text-gray-900">₹{getFinalTotal().toFixed(2)}</div>
                                            <div className="text-xs text-gray-500">(Incl. Of All Taxes)</div>
                                        </div>
                                        <button
                                            onClick={handleCheckout}
                                            className="px-8 py-3 bg-gray-800 text-white font-bold text-sm rounded-lg hover:bg-gray-900 transition-colors uppercase tracking-wide"
                                        >
                                            PLACE ORDER
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
