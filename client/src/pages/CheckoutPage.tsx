import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { orderService } from '../services';
import axios from 'axios';
import { CreditCard, Wallet, Banknote, Smartphone, Loader2, AlertCircle } from 'lucide-react';
import PaymentOption from '../components/PaymentOption';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Security: Maximum input lengths
const MAX_LENGTHS = {
  STREET: 200,
  CITY: 100,
  STATE: 100,
  PINCODE: 10,
  COUNTRY: 100,
  COUPON_CODE: 50,
};

// Security: Sanitize input to prevent XSS
const sanitizeInput = (input: string, maxLength: number): string => {
  if (!input) return '';

  // Remove HTML tags and dangerous characters
  let sanitized = input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();

  // Enforce max length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

// Security: Validate pincode format
const validatePincode = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode);
};

interface Address {
  _id?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
}

interface PaymentSettings {
  codEnabled: boolean;
  codMinimumAmount: number;
  hdfcEnabled: boolean;
  acceptedPaymentMethods: string[];
}



const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { toasts, showToast, hideToast } = useToast();

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  });
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [error, setError] = useState('');
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('cod');

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const orderSuccess = useRef(false);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        const response = await axios.get(`${API_URL}/auth/addresses`, { withCredentials: true });
        if (response.data.success) {
          setSavedAddresses(response.data.data.addresses);

          // Auto-select default address if exists
          const defaultAddress = response.data.data.addresses.find((addr: Address) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress._id!);
            setShippingAddress({
              street: defaultAddress.street,
              city: defaultAddress.city,
              state: defaultAddress.state,
              pincode: defaultAddress.pincode,
              country: defaultAddress.country,
            });
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch addresses');
        const errorMsg = err.response?.data?.message || 'Failed to load saved addresses';
        showToast(errorMsg, 'error');
      }
    };

    if (isAuthenticated) {
      fetchAddresses();
    }
  }, [isAuthenticated]);

  // Fetch payment settings
  useEffect(() => {
    const fetchPaymentSettings = async () => {
      try {
        const response = await axios.get(`${API_URL}/orders/payment/settings`, { withCredentials: true });
        if (response.data.success) {
          setPaymentSettings(response.data.data);
        }
      } catch (error: any) {
        console.error('Failed to fetch payment settings:', error);
        const errorMsg = error.response?.data?.message || 'Failed to load payment settings';
        showToast(errorMsg, 'error');
      }
    };
    fetchPaymentSettings();
  }, []);

  // Auto-select payment method when settings or cart total changes
  useEffect(() => {
    if (!paymentSettings) return;

    const total = getCartTotal();
    const codAvailable = paymentSettings.codEnabled &&
      total >= paymentSettings.codMinimumAmount &&
      paymentSettings.acceptedPaymentMethods?.includes('cod');

    // Priority: First available HDFC method, else COD if available
    if (paymentSettings.hdfcEnabled) {
      // Select first available HDFC method
      if (paymentSettings.acceptedPaymentMethods?.includes('upi')) {
        setSelectedPaymentMethod('hdfc_upi');
      } else if (paymentSettings.acceptedPaymentMethods?.includes('card')) {
        setSelectedPaymentMethod('hdfc_card');
      } else if (paymentSettings.acceptedPaymentMethods?.includes('netbanking')) {
        setSelectedPaymentMethod('hdfc_netbanking');
      } else if (paymentSettings.acceptedPaymentMethods?.includes('wallet')) {
        setSelectedPaymentMethod('hdfc_wallet');
      } else if (codAvailable) {
        setSelectedPaymentMethod('cod');
      } else {
        setSelectedPaymentMethod('');
      }
    } else if (codAvailable) {
      setSelectedPaymentMethod('cod');
    } else {
      // No payment method available
      setSelectedPaymentMethod('');
    }
  }, [paymentSettings, items]);

  // Redirect if not authenticated
  if (!isAuthenticated) {
    navigate('/login?redirect=/checkout');
    return null;
  }

  // Redirect if cart is empty
  if (items.length === 0 && !orderSuccess.current) {
    navigate('/cart');
    return null;
  }

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address._id!);
    setShippingAddress({
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      country: address.country,
    });
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    // Sanitize coupon code
    const sanitizedCoupon = sanitizeInput(couponCode, MAX_LENGTHS.COUPON_CODE)
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, ''); // Only allow alphanumeric and hyphens

    if (!sanitizedCoupon) {
      setCouponError('Invalid coupon code format');
      return;
    }

    setCouponLoading(true);
    setCouponError('');

    try {
      const response = await axios.post(`${API_URL}/coupons/validate`, {
        code: sanitizedCoupon,
        orderAmount: getCartTotal()
      });

      if (response.data.success) {
        setAppliedCoupon({
          code: response.data.data.code,
          discountAmount: response.data.data.discountAmount
        });
        setCouponCode(''); // Clear input on success
        showToast(`Coupon ${response.data.data.code} applied! You saved ₹${response.data.data.discountAmount}`, 'success');
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Invalid coupon code';
      setCouponError(errorMsg);
      showToast(errorMsg, 'error');
      setAppliedCoupon(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };



  const finalizeOrder = async (method: string, paymentDetails?: any) => {
    try {
      const orderData = {
        items: items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
        })),
        shippingAddress,
        paymentMethod: method === 'cod' ? 'cod' as const : 'online' as const,
        paymentDetails,
        couponCode: appliedCoupon?.code,
        discountAmount: appliedCoupon?.discountAmount
      };

      const response = await orderService.createOrder(orderData);

      if (response.success) {
        // Check if it's an online payment with a redirect URL
        // Backend returns paymentUrl at root of response object, not inside response.data (which is the order)
        if (response.paymentUrl) {
          console.log('Redirecting to Payment Gateway:', response.paymentUrl);
          window.location.href = response.paymentUrl;
          return;
        }

        // Otherwise (COD), go to confirmation
        orderSuccess.current = true;
        clearCart();
        navigate(`/order-confirmation/${response.data.data._id}`);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to create order';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setIsPlacingOrder(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation - Check required fields
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.pincode) {
      const errorMsg = 'Please complete your shipping address';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }

    // Validate minimum lengths
    if (shippingAddress.street.length < 5) {
      const errorMsg = 'Street address must be at least 5 characters';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }

    if (shippingAddress.city.length < 2) {
      const errorMsg = 'City name must be at least 2 characters';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }

    if (shippingAddress.state.length < 2) {
      const errorMsg = 'State name must be at least 2 characters';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }

    // Validate pincode format
    if (!validatePincode(shippingAddress.pincode)) {
      const errorMsg = 'Please enter a valid 6-digit pincode';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }

    // Validate payment method selection
    if (!selectedPaymentMethod) {
      const errorMsg = 'Please select a payment method. Contact admin if no options are available.';
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }

    // Check if COD is selected but unavailable
    if (selectedPaymentMethod === 'cod' && !isCodAvailable()) {
      const errorMsg = getCodDisabledReason();
      setError(errorMsg);
      showToast(errorMsg, 'warning');
      return;
    }

    setIsPlacingOrder(true);

    if (selectedPaymentMethod === 'cod') {
      await finalizeOrder('cod');
    } else {
      // For online payments, we also call finalizeOrder ('createOrder' on backend)
      // The backend will generate the payment setup and return the URL
      await finalizeOrder('online');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedAddressId(null); // Deselect saved address when manually editing
    const { name, value } = e.target;

    // Sanitize input based on field type
    let sanitizedValue = value;

    switch (name) {
      case 'street':
        sanitizedValue = sanitizeInput(value, MAX_LENGTHS.STREET);
        break;
      case 'city':
        sanitizedValue = sanitizeInput(value, MAX_LENGTHS.CITY);
        break;
      case 'state':
        sanitizedValue = sanitizeInput(value, MAX_LENGTHS.STATE);
        break;
      case 'pincode':
        // Only allow digits for pincode
        sanitizedValue = value.replace(/\D/g, '').substring(0, MAX_LENGTHS.PINCODE);
        break;
      case 'country':
        sanitizedValue = sanitizeInput(value, MAX_LENGTHS.COUNTRY);
        break;
      default:
        sanitizedValue = sanitizeInput(value, 200);
    }

    setShippingAddress({
      ...shippingAddress,
      [name]: sanitizedValue,
    });
  };

  // Helper to check COD availability
  const isCodAvailable = () => {
    if (!paymentSettings) return true;
    if (!paymentSettings.codEnabled) return false;
    return getCartTotal() >= paymentSettings.codMinimumAmount;
  };

  const getCodDisabledReason = () => {
    if (!paymentSettings) return '';
    if (!paymentSettings.codEnabled) return 'Cash on Delivery is currently disabled';
    if (getCartTotal() < paymentSettings.codMinimumAmount)
      return `Minimum order amount for COD is ₹${paymentSettings.codMinimumAmount}`;
    return '';
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Address & Payment */}
        <div className="lg:col-span-2 space-y-8">

          {/* 1. Shipping Address Section */}
          <div className="bg-white border border-border p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Shipping Address
            </h2>

            {/* Saved Addresses */}
            {savedAddresses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Select from saved addresses:</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {savedAddresses.map((address) => (
                    <div
                      key={address._id}
                      onClick={() => handleSelectAddress(address)}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedAddressId === address._id
                        ? 'border-black ring-1 ring-black bg-gray-50'
                        : 'border-border hover:border-black/30'
                        }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          {address.isDefault && (
                            <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-800 text-xs font-medium rounded mb-2 border border-gray-200">
                              Default
                            </span>
                          )}
                          <p className="font-medium text-sm">{address.street}</p>
                          <p className="text-xs text-secondary mt-1">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                        </div>
                        {selectedAddressId === address._id && (
                          <div className="text-black">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-secondary mt-4 font-medium">OR ENTER NEW ADDRESS</p>
              </div>
            )}

            <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Street */}
              <div>
                <label htmlFor="street" className="block text-sm font-medium mb-2">Street Address</label>
                <input
                  type="text"
                  id="street"
                  name="street"
                  value={shippingAddress.street}
                  onChange={handleChange}
                  required
                  maxLength={MAX_LENGTHS.STREET}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                  placeholder="123 Main Street, Apartment 4B"
                />
              </div>

              {/* City & State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium mb-2">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    required
                    maxLength={MAX_LENGTHS.CITY}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                    placeholder="Mumbai"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-medium mb-2">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleChange}
                    required
                    maxLength={MAX_LENGTHS.STATE}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                    placeholder="Maharashtra"
                  />
                </div>
              </div>

              {/* Pincode & Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="pincode" className="block text-sm font-medium mb-2">Pincode</label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleChange}
                    required
                    pattern="[0-9]{6}"
                    maxLength={MAX_LENGTHS.PINCODE}
                    inputMode="numeric"
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-colors"
                    placeholder="400001"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-2">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    readOnly
                    className="w-full px-4 py-3 border border-border bg-gray-50 text-gray-500 rounded-lg cursor-not-allowed"
                  />
                </div>
              </div>
            </form>
          </div>

          {/* 2. Payment Method Section */}
          <div className="bg-white border border-border p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="bg-black text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Payment Method
            </h2>

            {!paymentSettings ? (
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Loading payment options...
              </div>
            ) : (
              <div className="space-y-3">
                {/* HDFC Options */}
                {paymentSettings.hdfcEnabled && (
                  <>
                    {paymentSettings.acceptedPaymentMethods?.includes('upi') && (
                      <PaymentOption
                        id="hdfc_upi"
                        name="UPI"
                        icon={Smartphone}
                        description="Google Pay, PhonePe, Paytm, BHIM"
                        selected={selectedPaymentMethod === 'hdfc_upi'}
                        onSelect={setSelectedPaymentMethod}
                        brands={['GPay', 'PhonePe', 'Paytm']}
                      />
                    )}
                    {paymentSettings.acceptedPaymentMethods?.includes('card') && (
                      <PaymentOption
                        id="hdfc_card"
                        name="Credit / Debit Card"
                        icon={CreditCard}
                        description="Visa, Mastercard, RuPay, Maestro"
                        selected={selectedPaymentMethod === 'hdfc_card'}
                        onSelect={setSelectedPaymentMethod}
                        brands={['Visa', 'Mastercard', 'RuPay']}
                      />
                    )}
                    {paymentSettings.acceptedPaymentMethods?.includes('netbanking') && (
                      <PaymentOption
                        id="hdfc_netbanking"
                        name="Net Banking"
                        icon={Banknote}
                        description="All major Indian banks supported"
                        selected={selectedPaymentMethod === 'hdfc_netbanking'}
                        onSelect={setSelectedPaymentMethod}
                      />
                    )}
                    {paymentSettings.acceptedPaymentMethods?.includes('wallet') && (
                      <PaymentOption
                        id="hdfc_wallet"
                        name="Wallets"
                        icon={Wallet}
                        description="Paytm, PhonePe, Freecharge, Mobikwik"
                        selected={selectedPaymentMethod === 'hdfc_wallet'}
                        onSelect={setSelectedPaymentMethod}
                      />
                    )}
                  </>
                )}

                {/* Cash on Delivery */}
                {paymentSettings.acceptedPaymentMethods?.includes('cod') && (
                  <PaymentOption
                    id="cod"
                    name="Cash on Delivery"
                    icon={Banknote}
                    description="Pay cash upon delivery"
                    selected={selectedPaymentMethod === 'cod'}
                    disabled={!isCodAvailable()}
                    disabledReason={getCodDisabledReason()}
                    onSelect={setSelectedPaymentMethod}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-border p-6 rounded-lg sticky top-24 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>

            {/* Items */}
            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={`${item.product._id}-${item.size}-${item.color}`} className="flex gap-3 text-sm">
                  <div className="w-14 h-14 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                    <img
                      src={(() => {
                        const product = item.product as any;
                        const matchingVariant = product.colorVariants?.find(
                          (cv: any) => cv.color?.toLowerCase() === item.color?.toLowerCase()
                        );

                        // Try front view of matching variant
                        if (matchingVariant?.images?.length > 0) {
                          const frontImage = matchingVariant.images.find((img: any) => img.view === 'front');
                          if (frontImage?.url) return frontImage.url;
                          if (matchingVariant.images[0]?.url) return matchingVariant.images[0].url;
                        }

                        // Fallback to first color variant
                        if (product.colorVariants?.[0]?.images?.length > 0) {
                          const firstImage = product.colorVariants[0].images.find((img: any) => img.view === 'front');
                          if (firstImage?.url) return firstImage.url;
                          if (product.colorVariants[0].images[0]?.url) return product.colorVariants[0].images[0].url;
                        }

                        // Fallback to regular images
                        return product.images?.[0]?.url || 'https://via.placeholder.com/100?text=Product';
                      })()}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product.name}</p>
                    <p className="text-xs text-secondary mt-0.5">
                      {item.size} | {item.color} | Qty: {item.quantity}
                    </p>
                    <p className="font-semibold mt-1">
                      ₹{((item.product.discountPrice || item.product.price) * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>



            {/* Coupon Section */}
            <div className="mb-6 border-b border-border pb-6">
              {!appliedCoupon ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Coupon Code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    maxLength={MAX_LENGTHS.COUPON_CODE}
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm uppercase font-mono focus:outline-none focus:border-black"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                  >
                    {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                  </button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-center">
                  <div>
                    <p className="text-green-800 font-medium text-sm flex items-center gap-1">
                      <span className="font-bold">{appliedCoupon.code}</span> applied
                    </p>
                    <p className="text-green-600 text-xs">
                      You saved ₹{appliedCoupon.discountAmount.toLocaleString()}
                    </p>
                  </div>
                  <button onClick={handleRemoveCoupon} className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <AlertCircle className="w-4 h-4 rotate-45" /> {/* Use X icon if imported, but AlertCircle rotate is a hack, better use lucide X if imported or text */}
                    {/* Wait, I should import X or just use text 'Remove' */}
                    <span className="text-xs font-bold">✕</span>
                  </button>
                </div>
              )}
              {couponError && <p className="text-red-500 text-xs mt-2">{couponError}</p>}
            </div>

            {/* Totals */}
            <div className="space-y-3 pt-2 text-sm">
              <div className="flex justify-between text-secondary">
                <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                <span>₹{getCartTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-secondary">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div className="flex justify-between font-bold text-lg border-t border-border pt-3 mt-2">
                <span>Total Amount</span>
                <span>₹{(getCartTotal() - (appliedCoupon?.discountAmount || 0)).toLocaleString()}</span>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm rounded mt-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={() => document.getElementById('checkout-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
              disabled={isPlacingOrder || !paymentSettings || !selectedPaymentMethod || (selectedPaymentMethod === 'cod' && !isCodAvailable())}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed mt-6 py-3.5 text-base shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              {isPlacingOrder ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                `Pay ₹${(getCartTotal() - (appliedCoupon?.discountAmount || 0)).toLocaleString()}`
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              {selectedPaymentMethod === 'cod' ? (
                '🔒 Secure checkout with Cash on Delivery'
              ) : (
                '🔒 Secure checkout powered by HDFC SmartGateway'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}
    </div>
  );
};

export default CheckoutPage;
