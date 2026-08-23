import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService } from '../services';
import { Order } from '../types';
import { CheckCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_URL.replace('/api', '');

// Helper function to get full image URL
// Handles both legacy relative paths and new full URLs
const getImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) return 'https://via.placeholder.com/100?text=Product';

  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's a relative path starting with /, prepend SERVER_URL
  if (imagePath.startsWith('/')) {
    return `${SERVER_URL}${imagePath}`;
  }

  // Otherwise, assume it needs /uploads/ prefix
  return `${SERVER_URL}/uploads/${imagePath}`;
};

const OrderConfirmationPage = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toasts, showToast, hideToast } = useToast();


  useEffect(() => {
    if (id) {
      fetchOrder(id);
    }
  }, [id]);

  useEffect(() => {
    if (order) {
      // Fire confetti
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        });
      }, 250);
    }
  }, [order]);

  const fetchOrder = async (orderId: string) => {
    try {
      const response = await orderService.getOrderById(orderId);
      if (response.success) {
        console.log('📦 Order data received:', response.data);
        console.log('📦 Order items:', response.data.items);
        response.data.items.forEach((item: any, i: number) => {
          console.log(`  Item ${i}: ${item.name}, image: "${item.image}"`);
        });
        setOrder(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
      showToast('Failed to load order details', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for AWB code if not available immediately
  useEffect(() => {
    if (!order || order.awbCode) return; // Don't poll if no order or AWB already exists

    if (order.shiprocketOrderId && !order.awbCode) {
      console.log('🔄 AWB not available yet, starting polling...');

      let pollCount = 0;
      const maxPolls = 12; // Poll for 2 minutes (12 * 10 seconds)

      const pollInterval = setInterval(async () => {
        pollCount++;
        console.log(`🔄 Polling for AWB (attempt ${pollCount}/${maxPolls})...`);

        try {
          const response = await orderService.getOrderById(id!);
          if (response.success && response.data.awbCode) {
            console.log('✅ AWB code received:', response.data.awbCode);
            setOrder(response.data);
            clearInterval(pollInterval);
            showToast('Tracking number is now available!', 'success');
          } else if (pollCount >= maxPolls) {
            console.log('⏱️ Polling timeout - AWB not generated yet');
            clearInterval(pollInterval);
          }
        } catch (error) {
          console.error('Error polling for AWB:', error);
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
          }
        }
      }, 10000); // Poll every 10 seconds

      return () => clearInterval(pollInterval);
    }
  }, [order?.awbCode, order?.shiprocketOrderId, id]);


  if (isLoading) {
    return (
      <div className="container-custom py-20 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-20 text-center">
        <p className="text-secondary mb-4">Order not found</p>
        <Link to="/" className="btn-primary">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
      <div className="container-custom">
        {/* Success Message */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200 animate-bounce-slow">
            <CheckCircle className="w-14 h-14 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Order Placed Successfully!
          </h1>
          <p className="text-gray-600 mb-3 text-lg">Thank you for your order</p>
          <div className="inline-block bg-gray-100 px-6 py-3 rounded-full">
            <p className="text-sm text-gray-600">
              Order ID: <span className="font-mono font-semibold text-gray-900">{order._id}</span>
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Shipping Address */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
            </div>
            <div className="text-sm text-gray-600 space-y-2 leading-relaxed">
              <p className="font-medium text-gray-900">{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state}</p>
              <p>{order.shippingAddress.pincode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Order Information</h2>
            </div>
            <div className="text-sm space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Order Date:</span>
                <span className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Payment Method:</span>
                <span className="font-semibold text-gray-900">Cash on Delivery</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-600">Status:</span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 capitalize">
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-200 pt-4 mt-4">
                <span className="font-bold text-gray-900 text-base">Total Amount:</span>
                <span className="font-bold text-2xl text-gray-900">₹{order.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>


          {/* Payment Receipt Details */}
          {order.paymentDetails && order.paymentMethod === 'online' && (
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Payment Receipt</h2>
              </div>
              <div className="text-sm space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono font-medium text-gray-900">{order.paymentDetails.paymentId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Gateway Ref:</span>
                  <span className="font-mono font-medium text-gray-900">{order.paymentDetails.orderId || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Payment Date:</span>
                  <span className="font-medium text-gray-900">
                    {order.paymentDetails.paidAt ? new Date(order.paymentDetails.paidAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Payment Status:</span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800 uppercase">
                    {order.paymentStatus}
                  </span>
                </div>
              </div>
            </div>
          )}


          {/* Shipping/Tracking Info */}
          {(order.awbCode || order.shiprocketOrderId) && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">📦 Shipping Information</h2>
              </div>

              {order.awbCode ? (
                <div className="space-y-4">
                  <div className="bg-white rounded-xl p-4 border border-blue-200">
                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Tracking Number (AWB)</p>
                    <p className="text-2xl font-mono font-bold text-blue-600">{order.awbCode}</p>
                  </div>

                  {order.courierName && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Courier Partner:</span>
                      <span className="font-semibold text-gray-900">{order.courierName}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-600">Expected Delivery:</span>
                    <span className="font-semibold text-gray-900">
                      {order.estimatedDeliveryDate ? (
                        new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })
                      ) : (
                        (() => {
                          const deliveryDate = new Date(order.createdAt);
                          deliveryDate.setDate(deliveryDate.getDate() + 5);
                          return deliveryDate.toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          }) + ' (estimated)';
                        })()
                      )}
                    </span>
                  </div>

                  {order.pickupScheduledDate && (
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">Pickup Scheduled:</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(order.pickupScheduledDate).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}

                  <div className="flex gap-2 mt-4 flex-wrap">
                    {order.courierTrackingUrl && (
                      <a
                        href={order.courierTrackingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
                      >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Track Your Shipment
                      </a>
                    )}


                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="inline-flex items-center gap-2 text-gray-600">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Generating tracking number...</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Your shipment is being processed. Tracking details will be available shortly.</p>
                </div>
              )}
            </div>
          )}
        </div>


        {/* Order Items */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
            </div>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-5 pb-5 border-b border-gray-100 last:border-0 last:pb-0 hover:bg-gray-50 -mx-4 px-4 py-3 rounded-xl transition-colors duration-200">
                  <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100?text=Product';
                      }}
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <p className="font-semibold text-gray-900 mb-2 text-base">{item.name}</p>
                    <div className="flex gap-4 text-sm text-gray-600 mb-2">
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">Size:</span> {item.size}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">Color:</span> {item.color}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <span className="font-medium">Qty:</span> {item.quantity}
                      </span>
                    </div>
                    <p className="font-bold text-gray-900 text-lg">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="max-w-4xl mx-auto mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/orders"
            className="inline-flex items-center justify-center px-8 py-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 transform"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            View My Orders
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105 transform"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            Continue Shopping
          </Link>
        </div>
      </div>


      {/* Toast Notifications */}
      {
        toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={() => hideToast(toast.id)}
          />
        ))
      }
    </div >
  );
};

export default OrderConfirmationPage;
