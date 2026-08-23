import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import { joinUserRoom, getSocket } from '../services/socket';
import { Package, Calendar, MapPin, CreditCard, FileText, X } from 'lucide-react';
import { ReviewModal } from '../components/ReviewModal';
import InvoiceModal from '../components/InvoiceModal';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';

interface OrderItem {
  product: {
    _id: string;
    name: string;
  } | string; // Can be populated object or just ID
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
  isReviewed?: boolean;
  reviewId?: string;
}

interface Order {
  _id: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  trackingNumber?: string;
  // Shiprocket fields
  shiprocketOrderId?: number;
  shiprocketShipmentId?: number;
  awbCode?: string;
  courierName?: string;
  shiprocketStatus?: string;
  estimatedDeliveryDate?: string;
  courierTrackingUrl?: string;
  pickupScheduledDate?: string;
  labelUrl?: string;
  createdAt: string;
}

const OrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const { toasts, showToast, hideToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewModal, setReviewModal] = useState({
    isOpen: false,
    productId: '',
    productName: '',
    orderId: '',
  });
  const [invoiceModal, setInvoiceModal] = useState({
    isOpen: false,
    order: null as Order | null,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/orders');
      return;
    }
    fetchOrders();

    // Setup Socket
    if (user) {
      joinUserRoom(user._id);
      const socket = getSocket();

      const handleUpdate = (data: any) => {
        console.log('🔔 User Socket update received, refreshing data...', data);
        fetchOrders();
      };

      socket.on('order_updated', handleUpdate);

      return () => {
        socket.off('order_updated', handleUpdate);
      };
    }
  }, [isAuthenticated, navigate, user]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders');
      setOrders(response.data.data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      const errorMsg = err.response?.data?.message || 'Failed to fetch orders';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      // Refresh orders list
      fetchOrders();
      showToast('Order cancelled successfully!', 'success');
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      const errorMsg = err.response?.data?.message || 'Failed to cancel order';
      showToast(errorMsg, 'error');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      out_for_delivery: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  const canCancelOrder = (status: string) => {
    return ['pending', 'processing', 'shipped'].includes(status);
  };

  if (loading) {
    return (
      <div className="container-custom py-8">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
          <button
            onClick={() => navigate('/products')}
            className="btn-primary"
          >
            Browse Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="font-mono text-sm">{order._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <p className="font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="font-bold text-lg">₹{order.totalAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="px-6 py-4">
                <h3 className="font-semibold mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row gap-4">
                      <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.size && `Size: ${item.size}`}
                          {item.size && item.color && ' | '}
                          {item.color && `Color: ${item.color}`}
                        </p>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <div className="sm:text-right flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start w-full sm:w-auto border-t sm:border-t-0 border-gray-100 pt-3 sm:pt-0 mt-3 sm:mt-0">
                        <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString()}</p>

                        {/* Review Button - Only show for delivered orders that haven't been reviewed */}
                        {order.status === 'delivered' && !item.isReviewed && (
                          <button
                            onClick={() => {
                              const productId = typeof item.product === 'string'
                                ? item.product
                                : item.product._id;
                              setReviewModal({
                                isOpen: true,
                                productId: productId,
                                productName: item.name,
                                orderId: order._id,
                              });
                            }}
                            className="mt-0 sm:mt-2 px-3 py-1.5 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 transition-colors"
                          >
                            ⭐ Write Review
                          </button>
                        )}

                        {/* Already Reviewed Badge */}
                        {order.status === 'delivered' && item.isReviewed && (
                          <span className="mt-0 sm:mt-2 inline-block px-3 py-1.5 bg-green-100 text-green-700 text-sm rounded">
                            ✓ Reviewed
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <h4 className="font-semibold">Shipping Address</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      {order.shippingAddress.street}<br />
                      {order.shippingAddress.city}, {order.shippingAddress.state}<br />
                      {order.shippingAddress.pincode}, {order.shippingAddress.country}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="w-4 h-4 text-gray-400" />
                      <h4 className="font-semibold">Payment & Tracking</h4>
                    </div>
                    <p className="text-sm text-gray-700">
                      Method: <span className="uppercase font-medium">{order.paymentMethod}</span><br />
                      Status: <span className="capitalize font-medium">{order.paymentStatus}</span>
                    </p>
                    
                    {/* Shiprocket Tracking Information */}
                    {order.awbCode && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Tracking Number (AWB)</p>
                        <p className="text-lg font-mono font-bold text-blue-600 mb-2">{order.awbCode}</p>
                        
                        {order.courierName && (
                          <p className="text-sm text-gray-700 mb-1">
                            <span className="font-medium">Courier:</span> {order.courierName}
                          </p>
                        )}
                        
                        {order.estimatedDeliveryDate && (
                          <p className="text-sm text-gray-700 mb-3">
                            <span className="font-medium">Expected:</span>{' '}
                            {new Date(order.estimatedDeliveryDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                        
                        {order.pickupScheduledDate && (
                          <p className="text-sm text-gray-700 mb-3">
                            <span className="font-medium">Pickup Scheduled:</span>{' '}
                            {new Date(order.pickupScheduledDate).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </p>
                        )}
                        
                        <div className="flex gap-2 flex-wrap">
                          {order.courierTrackingUrl && (
                            <a
                              href={order.courierTrackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                              Track Shipment
                            </a>
                          )}
                          

                        </div>
                      </div>
                    )}
                    
                    {/* Show processing message if no AWB yet but shipment created */}
                    {!order.awbCode && order.shiprocketOrderId && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800 text-sm">
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <span>Generating tracking number...</span>
                        </div>
                      </div>
                    )}
                    
                    {order.trackingNumber && !order.awbCode && (
                      <p className="text-sm text-gray-700 mt-2">
                        Tracking: <span className="font-mono">{order.trackingNumber}</span>
                      </p>
                    )}

                    {/* View Invoice Button */}
                    {(order.paymentStatus === 'completed' ||
                      (order.paymentMethod === 'cod' && order.status !== 'pending' && order.status !== 'cancelled')) && (
                        <button
                          onClick={() => setInvoiceModal({ isOpen: true, order })}
                          className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 text-sm font-medium"
                        >
                          <FileText className="w-4 h-4" />
                          View Invoice
                        </button>
                      )}

                    {/* Cancel Order Button */}
                    {canCancelOrder(order.status) && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={() => setReviewModal({ ...reviewModal, isOpen: false })}
        productId={reviewModal.productId}
        productName={reviewModal.productName}
        orderId={reviewModal.orderId}
        onSuccess={() => {
          // Refresh orders to show review was submitted
          fetchOrders();
          setReviewModal({ ...reviewModal, isOpen: false });
        }}
      />

      {/* Invoice Modal */}
      {invoiceModal.isOpen && invoiceModal.order && user && (
        <InvoiceModal
          isOpen={invoiceModal.isOpen}
          onClose={() => setInvoiceModal({ isOpen: false, order: null })}
          order={invoiceModal.order}
          user={user}
        />
      )}

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

export default OrdersPage;
