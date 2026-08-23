import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Package,
    Truck,
    MapPin,
    Calendar,
    ArrowLeft,
    RefreshCw,
    Phone,
    Mail
} from 'lucide-react';
import api from '../services/api';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import { useAuthStore } from '../store/authStore';
import { Order } from '../types';

interface TrackingEvent {
    status: string;
    description: string;
    location: string;
    timestamp: string;
    icon: string;
}

interface TrackingData {
    trackingNumber: string;
    awbCode: string;
    courierName: string;
    currentStatus: string;
    estimatedDelivery: string;
    shippingAddress: any;
    events: TrackingEvent[];
}

const TrackOrderPage: React.FC = () => {
    const { trackingNumber } = useParams<{ trackingNumber: string }>();
    const navigate = useNavigate();
    const { toasts, showToast, hideToast } = useToast();
    const { isAuthenticated } = useAuthStore();
    const [tracking, setTracking] = useState<TrackingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTracking, setSearchTracking] = useState('');
    const [userOrders, setUserOrders] = useState<Order[]>([]);
    const [ordersLoading, setOrdersLoading] = useState(false);

    useEffect(() => {
        if (trackingNumber) {
            setSearchTracking(trackingNumber); // Sync input with URL
            fetchTracking(trackingNumber);
        } else {
            setLoading(false);
        }
    }, [trackingNumber]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchUserOrders();
        }
    }, [isAuthenticated]);

    const fetchUserOrders = async () => {
        try {
            setOrdersLoading(true);
            const response = await api.get('/orders');
            if (response.data.success || Array.isArray(response.data.data)) {
                // Handle both possible response structures
                const ordersData = response.data.data || [];
                setUserOrders(ordersData);
            }
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setOrdersLoading(false);
        }
    };

    const fetchTracking = async (number: string) => {
        // Double-check sanitization for URL params (in case of direct link access)
        const sanitizedNumber = number.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 50);
        
        if (!sanitizedNumber) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');
            setTracking(null); // Clear previous results while fetching
            
            // Use Shiprocket tracking endpoint
            const response = await api.get(`/shiprocket/track/${sanitizedNumber}`);
            
            if (response.data.success && response.data.data?.tracking_data) {
                const trackingData = response.data.data.tracking_data;
                
                // Transform Shiprocket data to our format
                const transformedData: TrackingData = {
                    trackingNumber: trackingData.awb_code || sanitizedNumber,
                    awbCode: trackingData.awb_code || 'N/A',
                    courierName: trackingData.shipment_track?.[0]?.courier_name || 'Unknown',
                    currentStatus: trackingData.shipment_track?.[0]?.current_status || 'Processing',
                    estimatedDelivery: trackingData.shipment_track?.[0]?.etd || new Date().toISOString(),
                    shippingAddress: {
                        fullName: trackingData.shipment_track?.[0]?.consignee_name || 'Customer',
                        street: trackingData.shipment_track?.[0]?.destination || '',
                        city: trackingData.shipment_track?.[0]?.destination || '',
                        state: '',
                        pincode: '',
                        country: 'India',
                        phone: ''
                    },
                    events: (trackingData.shipment_track_activities || []).map((activity: any) => ({
                        status: activity.activity || activity['sr-status-label'] || 'Update',
                        description: activity.location || activity.activity || 'Shipment update',
                        location: activity.location || 'In Transit',
                        timestamp: activity.date || activity['@timestamp'] || new Date().toISOString(),
                        icon: getActivityIcon(activity.activity || activity['sr-status-label'])
                    }))
                };
                
                setTracking(transformedData);
            } else {
                throw new Error('No tracking data found');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || 'Tracking number not found. Please check and try again.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            setTracking(null);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to get icon for activity
    const getActivityIcon = (activity: string): string => {
        const activityLower = (activity || '').toLowerCase();
        if (activityLower.includes('delivered')) return '✅';
        if (activityLower.includes('out for delivery')) return '🚚';
        if (activityLower.includes('transit') || activityLower.includes('dispatch')) return '📦';
        if (activityLower.includes('picked')) return '📤';
        if (activityLower.includes('booked') || activityLower.includes('manifest')) return '📋';
        return '📍';
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTracking.trim()) {
            navigate(`/track/${searchTracking.trim()}`);
        }
    };

    const getStatusProgress = (status: string) => {
        const statuses = ['pending', 'processing', 'shipped', 'delivered'];
        const index = statuses.indexOf(status);
        return ((index + 1) / statuses.length) * 100;
    };

    // Removed full-page loader to keep search box visible


    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50">
            {/* Header */}
            <div className="bg-white shadow-sm">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate('/')}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Track Your Order</h1>
                                <p className="text-gray-600">Real-time delivery tracking</p>
                            </div>
                        </div>
                        <Package className="w-12 h-12 text-orange-600" />
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Search Box */}
                {/* Search Box */}
                <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-100">
                    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative group">
                            <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-500 transition-colors" />
                            <input
                                type="text"
                                value={searchTracking}
                                onChange={(e) => {
                                    // SECURITY: Input Sanitization
                                    // 1. Limit length to prevent buffer overflow/DoS
                                    if (e.target.value.length > 50) return;

                                    // 2. Allow only safe characters (Alphanumeric and hyphens)
                                    // This prevents XSS, SQL Injection, and Command Injection by removing special chars
                                    const sanitizedVal = e.target.value.replace(/[^a-zA-Z0-9-]/g, '');
                                    
                                    setSearchTracking(sanitizedVal);
                                    if(error) setError('');
                                }}
                                placeholder="Enter Order ID or AWB (e.g., BOTAN-123)"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 transition-all font-medium text-lg placeholder-gray-400 tracking-wide"
                                maxLength={50}
                                autoComplete="off" // Prevent browser caching of sensitive tracking numbers
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!searchTracking.trim() || loading}
                            className="px-8 py-4 bg-orange-600 text-white rounded-xl hover:bg-orange-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold text-lg shadow-lg shadow-orange-200 min-w-[160px] flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    <span>Tracking...</span>
                                </>
                            ) : (
                                <span>Track Order</span>
                            )}
                        </button>
                    </form>
                    
                    {/* Error Message - cleaner integrated look */}
                    {error && (
                        <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 animate-fadeIn">
                            <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-500"/>
                            <p className="font-medium text-sm">{error}</p>
                        </div>
                    )}
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="py-12 flex flex-col items-center justify-center bg-white rounded-xl shadow-lg border border-gray-100 animate-fadeIn">
                        <div className="relative">
                            <RefreshCw className="w-16 h-16 animate-spin text-orange-200" />
                            <Package className="w-8 h-8 text-orange-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-gray-800">Locating your package...</h3>
                        <p className="text-gray-500 mt-2">Connecting to courier network</p>
                    </div>
                )}

                {/* Tracking Information */}
                {!loading && tracking && (
                    <div className="space-y-6">
                        {/* Status Overview */}
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-8 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-orange-100 text-sm mb-1">Tracking Number</p>
                                        <p className="text-2xl font-bold">{tracking.trackingNumber}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-orange-100 text-sm mb-1">Current Status</p>
                                        <p className="text-2xl font-bold capitalize">{tracking.currentStatus}</p>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-6">
                                    <div className="bg-orange-400 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-white h-full transition-all duration-500"
                                            style={{ width: `${getStatusProgress(tracking.currentStatus)}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between mt-2 text-sm">
                                        <span className="text-orange-100">Order Placed</span>
                                        <span className="text-orange-100">Delivered</span>
                                    </div>
                                </div>
                            </div>

                            {/* Shipment Details */}
                            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <Truck className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Courier Partner</p>
                                        <p className="font-semibold text-gray-900">{tracking.courierName}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-purple-100 rounded-lg">
                                        <Package className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">AWB Code</p>
                                        <p className="font-semibold text-gray-900">{tracking.awbCode}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <Calendar className="w-5 h-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                                        <p className="font-semibold text-gray-900">
                                            {new Date(tracking.estimatedDelivery).toLocaleDateString('en-IN', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tracking Timeline */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-orange-600" />
                                Tracking Timeline
                            </h2>

                            <div className="space-y-6">
                                {tracking.events.map((event, index) => (
                                    <div key={index} className="flex gap-4">
                                        {/* Timeline Line */}
                                        <div className="flex flex-col items-center">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${index === 0
                                                ? 'bg-orange-100 ring-4 ring-orange-200'
                                                : 'bg-gray-100'
                                                }`}>
                                                {event.icon}
                                            </div>
                                            {index < tracking.events.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 my-2" />
                                            )}
                                        </div>

                                        {/* Event Details */}
                                        <div className="flex-1 pb-6">
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <h3 className={`font-semibold text-lg ${index === 0 ? 'text-orange-600' : 'text-gray-900'
                                                        }`}>
                                                        {event.status}
                                                    </h3>
                                                    <p className="text-gray-600">{event.description}</p>
                                                </div>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(event.timestamp).toLocaleString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                                <MapPin className="w-4 h-4" />
                                                {event.location}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Address */}
                        <div className="bg-white rounded-lg shadow-lg p-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-orange-600" />
                                Delivery Address
                            </h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <p className="font-semibold text-gray-900 mb-2">
                                    {tracking.shippingAddress.fullName || 'Customer'}
                                </p>
                                <p className="text-gray-600">{tracking.shippingAddress.street}</p>
                                <p className="text-gray-600">
                                    {tracking.shippingAddress.city}, {tracking.shippingAddress.state} - {tracking.shippingAddress.pincode}
                                </p>
                                <p className="text-gray-600">{tracking.shippingAddress.country || 'India'}</p>
                                {tracking.shippingAddress.phone && (
                                    <p className="text-gray-600 flex items-center gap-2 mt-2">
                                        <Phone className="w-4 h-4" />
                                        {tracking.shippingAddress.phone}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Help Section */}
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                            <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                                <Mail className="w-5 h-5" />
                                Need Help?
                            </h3>
                            <p className="text-blue-800 mb-4">
                                If you have any questions about your delivery, please contact our support team.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <a
                                    href="mailto:botamapparels@gmail.com"
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Mail className="w-4 h-4" />
                                    botamapparels@gmail.com
                                </a>
                                <a
                                    href="tel:+911800XXXXXXX"
                                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    <Phone className="w-4 h-4" />
                                    +91 1800-XXX-XXXX
                                </a>
                            </div>
                        </div>
                    </div>
                )}



                {/* Your Orders Section */}
                <div className="mt-12 border-t border-gray-200 pt-12">
                     <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Package className="w-6 h-6 text-orange-600" />
                            Your Recent Orders
                    </h2>
                    
                    {!isAuthenticated ? (
                        <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-8 text-center bg-gradient-to-br from-orange-50 to-white">
                            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Package className="w-8 h-8 text-orange-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Login to view your orders</h3>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Sign in to your account to see all your recent orders, track shipments, and manage deliveries in one place.
                            </p>
                            <button
                                onClick={() => navigate('/login?redirect=/track-order')}
                                className="px-8 py-3 bg-white border-2 border-orange-600 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
                            >
                                Login Now
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {ordersLoading ? (
                                <div className="text-center py-12">
                                    <RefreshCw className="w-8 h-8 animate-spin text-orange-500 mx-auto" />
                                    <p className="mt-2 text-gray-500">Loading your orders...</p>
                                </div>
                            ) : userOrders.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                    <p className="text-gray-500">No orders found.</p>
                                    <button 
                                        onClick={() => navigate('/products')}
                                        className="mt-4 text-orange-600 font-medium hover:underline"
                                    >
                                        Start Shopping
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-4">
                                    {userOrders.map((order) => (
                                        <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 transition-all hover:shadow-md">
                                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                                {/* Left: Order Info & Items */}
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-3">
                                                         <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded text-gray-600">
                                                            #{order._id.slice(-6).toUpperCase()}
                                                         </span>
                                                         <span className="text-sm text-gray-500">
                                                            {new Date(order.createdAt).toLocaleDateString()}
                                                         </span>
                                                         <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                                                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                            'bg-blue-100 text-blue-700'
                                                         }`}>
                                                            {order.status}
                                                         </span>
                                                    </div>
                                                    
                                                    {/* Items Preview */}
                                                    <div className="flex flex-wrap gap-2">
                                                        {order.items.slice(0, 3).map((item, idx) => (
                                                            <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md border border-gray-100">
                                                                {item.image ? (
                                                                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                                                                ) : (
                                                                    <Package className="w-8 h-8 p-1 text-gray-400" />
                                                                )}
                                                                <div>
                                                                    <p className="text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                                                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                        {order.items.length > 3 && (
                                                            <div className="flex items-center justify-center bg-gray-50 px-3 rounded-md border border-gray-100 text-xs text-gray-500">
                                                                +{order.items.length - 3} more
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Right: Tracking Info */}
                                                <div className="flex flex-col items-end justify-center min-w-[200px] border-t md:border-t-0 md:border-l border-gray-100 md:pl-4 pt-4 md:pt-0">
                                                    {order.awbCode ? (
                                                        <>
                                                            <p className="text-xs text-gray-500 mb-1">Tracking ID (AWB)</p>
                                                            <p className="font-mono font-semibold text-gray-900 mb-2">{order.awbCode}</p>
                                                            <button
                                                                onClick={() => {
                                                                    setSearchTracking(order.awbCode!);
                                                                    navigate(`/track/${order.awbCode}`);
                                                                }}
                                                                className="w-full py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-200 transition-colors flex items-center justify-center gap-2"
                                                            >
                                                                <Truck className="w-4 h-4" />
                                                                Track Now
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <div className="text-right">
                                                            <p className="text-sm text-gray-500">Tracking not available</p>
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {order.status === 'delivered' ? 'Order delivered' : 'Not yet shipped'}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* No Tracking Number State */}
                {!trackingNumber && !error && (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center mt-8">
                        <Package className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Track Your Order</h2>
                        <p className="text-gray-600 mb-6">
                            Enter your tracking number above to see real-time delivery updates
                        </p>
                        <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
                            <h3 className="font-semibold text-gray-900 mb-3">Where to find tracking number?</h3>
                            <ul className="text-left text-gray-600 space-y-2">
                                <li>• Check your order confirmation email</li>
                                <li>• Visit "My Orders" in your account</li>
                                <li>• Look for SMS notification</li>
                            </ul>
                        </div>
                    </div>
                )}
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

export default TrackOrderPage;
