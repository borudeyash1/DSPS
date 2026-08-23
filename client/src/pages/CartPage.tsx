import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Trash2, Plus, Minus } from 'lucide-react';

import { useToastStore } from '../store/toastStore';
import { CreditCard, Wallet, Banknote, Smartphone } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface PaymentSettings {
  codEnabled: boolean;
  hdfcEnabled: boolean;
  acceptedPaymentMethods: string[];
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CartPage = () => {
  const navigate = useNavigate();
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { showToast } = useToastStore();

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [paymentSettingsLoading, setPaymentSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders/payment/settings`, { withCredentials: true });
        if (response.data.success) {
          setPaymentSettings(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch payment settings:', error);
      } finally {
        setPaymentSettingsLoading(false);
      }
    };
    fetchPaymentSettings();
  }, []);

  const handleCheckout = () => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className="container-custom py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
        <p className="text-secondary mb-8">Add some products to get started</p>
        <Link to="/" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.product._id}-${item.size}-${item.color}`}
              className="bg-white border border-border rounded-lg p-4 flex gap-4"
            >
              {/* Product Image */}
              <Link
                to={`/product/${item.product._id}`}
                className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg overflow-hidden"
              >
                <img
                  src={(() => {
                    const product = item.product as any;

                    // Find the color variant matching the selected color
                    const matchingVariant = product.colorVariants?.find(
                      (cv: any) => cv.color?.toLowerCase() === item.color?.toLowerCase()
                    );

                    // colorVariants[].images is an ARRAY of {view, url} objects
                    if (matchingVariant?.images?.length > 0) {
                      // Try to find front view first
                      const frontImage = matchingVariant.images.find((img: any) => img.view === 'front');
                      if (frontImage?.url) return frontImage.url;

                      // Fallback to first image in the array
                      if (matchingVariant.images[0]?.url) return matchingVariant.images[0].url;
                    }

                    // Fallback to first color variant
                    if (product.colorVariants?.[0]?.images?.length > 0) {
                      const firstImage = product.colorVariants[0].images.find((img: any) => img.view === 'front');
                      if (firstImage?.url) return firstImage.url;
                      if (product.colorVariants[0].images[0]?.url) return product.colorVariants[0].images[0].url;
                    }

                    // Fallback to regular images array
                    if (product.images?.[0]?.url) {
                      return product.images[0].url;
                    }

                    return 'https://via.placeholder.com/200?text=Product';
                  })()}
                  alt={item.product.name}
                  className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                />
              </Link>

              {/* Product Info */}
              <div className="flex-1">
                <Link
                  to={`/product/${item.product._id}`}
                  className="font-semibold hover:text-accent transition-colors line-clamp-1"
                >
                  {item.product.name}
                </Link>
                <p className="text-sm text-secondary mt-1">
                  Size: {item.size} | Color: {item.color}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {item.product.discountPrice ? (
                    <>
                      <span className="font-bold">₹{item.product.discountPrice}</span>
                      <span className="text-sm text-secondary line-through">
                        ₹{item.product.price}
                      </span>
                    </>
                  ) : (
                    <span className="font-bold">₹{item.product.price}</span>
                  )}
                </div>
              </div>

              {/* Quantity Controls */}
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => {
                    removeItem(item.product._id!, item.size, item.color);
                    showToast('Item removed from cart', 'info');
                  }}
                  className="text-accent hover:text-red-700 transition-colors"
                  aria-label="Remove item"
                >
                  <Trash2 className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.product._id, item.size, item.color, item.quantity - 1)
                    }
                    className="w-8 h-8 border border-border rounded-md hover:bg-muted transition-colors flex items-center justify-center"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-medium w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.product._id, item.size, item.color, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.product.stock}
                    className="w-8 h-8 border border-border rounded-md hover:bg-muted transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                <p className="font-semibold mt-2">
                  ₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          ))}

          {/* Clear Cart */}
          <button
            onClick={() => {
              clearCart();
              showToast('Cart cleared', 'info');
            }}
            className="text-sm text-accent hover:underline"
          >
            Clear Cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border rounded-lg p-6 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-secondary">
                <span>Subtotal ({items.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
                <span>₹{getCartTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{getCartTotal().toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full btn-primary mb-4"
            >
              {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
            </button>

            <Link
              to="/"
              className="block text-center text-sm text-accent hover:underline"
            >
              Continue Shopping
            </Link>

            {/* Payment Info */}
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-sm text-secondary mb-3">We accept:</p>
              <div className="flex flex-wrap gap-2">
                {paymentSettingsLoading ? (
                  <div className="flex gap-2">
                    <div className="h-8 w-12 bg-gray-100 animate-pulse rounded"></div>
                    <div className="h-8 w-12 bg-gray-100 animate-pulse rounded"></div>
                  </div>
                ) : (
                  <>
                    {(paymentSettings?.acceptedPaymentMethods?.includes('card') || (paymentSettings?.hdfcEnabled && paymentSettings?.acceptedPaymentMethods?.includes('card'))) && (
                      <div className="px-3 py-1.5 border border-border rounded text-xs font-medium flex items-center gap-1.5" title="Credit/Debit Cards">
                        <CreditCard size={14} /> Cards
                      </div>
                    )}

                    {(paymentSettings?.acceptedPaymentMethods?.includes('upi') || (paymentSettings?.hdfcEnabled && paymentSettings?.acceptedPaymentMethods?.includes('upi'))) && (
                      <div className="px-3 py-1.5 border border-border rounded text-xs font-medium flex items-center gap-1.5" title="UPI">
                        <Smartphone size={14} /> UPI
                      </div>
                    )}

                    {(paymentSettings?.acceptedPaymentMethods?.includes('netbanking') || (paymentSettings?.hdfcEnabled && paymentSettings?.acceptedPaymentMethods?.includes('netbanking'))) && (
                      <div className="px-3 py-1.5 border border-border rounded text-xs font-medium flex items-center gap-1.5" title="Net Banking">
                        <Banknote size={14} /> NetBanking
                      </div>
                    )}

                    {(paymentSettings?.acceptedPaymentMethods?.includes('wallet') || (paymentSettings?.hdfcEnabled && paymentSettings?.acceptedPaymentMethods?.includes('wallet'))) && (
                      <div className="px-3 py-1.5 border border-border rounded text-xs font-medium flex items-center gap-1.5" title="Wallets">
                        <Wallet size={14} /> Wallets
                      </div>
                    )}

                    {paymentSettings?.codEnabled && paymentSettings?.acceptedPaymentMethods?.includes('cod') && (
                      <div className="px-3 py-1.5 border border-border rounded text-xs font-medium flex items-center gap-1.5" title="Cash on Delivery">
                        <Banknote size={14} /> COD
                      </div>
                    )}

                    {(!paymentSettings?.acceptedPaymentMethods || paymentSettings?.acceptedPaymentMethods.length === 0) && (
                      <span className="text-xs text-secondary">No payment methods available</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
