import React, { useState, useEffect } from 'react';
import {
    Package,
    Truck,
    CheckCircle,
    XCircle,
    Clock,
    Search,
    Send,
    Filter
} from 'lucide-react';
import adminApi from '../../services/adminApi';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

interface Order {
    _id: string;
    items: any[];
    totalAmount: number;
    status: string;
    paymentMethod: string;
    paymentStatus: string;
    trackingNumber?: string;
    awbCode?: string;
    courierName?: string;
    shippingAddress: any;
    createdAt: string;
    user: {
        fullName: string;
        email: string;
    };
}

const AdminMockDeliveryPage: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
    const [otpModalOpen, setOtpModalOpen] = useState(false);
    const [otpInput, setOtpInput] = useState('');
    const [pendingDeliveryId, setPendingDeliveryId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const { toasts, showToast, hideToast } = useToast();

    // Initial fetch handled by the searchTerm/statusFilter effect below
    // useEffect(() => {
    //     fetchOrders();
    // }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchOrders();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter !== 'all') params.append('status', statusFilter);

            const response = await adminApi.get(`/delivery/tracking/mock-all?${params.toString()}`);
            setOrders(response.data.data);
            setFilteredOrders(response.data.data);
        } catch (error: any) {
            console.error('Error fetching orders:', error);
            showToast('Failed to fetch orders', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Client-side filtering removed in favor of backend filtering

    const initiateDelivery = async (orderId: string) => {
        try {
            setActionLoading(orderId);
            const response = await adminApi.post('/delivery/initiate', { orderId });

            if (response.data.success) {
                showToast(`Delivery initiated! Tracking: ${response.data.data.trackingNumber}`, 'success');
                fetchOrders();
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to initiate delivery', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const updateStatus = async (orderId: string, status: string, otp?: string) => {
        try {
            setActionLoading(orderId);
            // Use delivery endpoint which allows regular admins and handles state updates
            const response = await adminApi.post('/delivery/update-status', {
                orderId,
                status,
                otp // Pass OTP if present
            });

            if (response.data.success) {
                showToast(`Order updated to: ${status}`, 'success');
                fetchOrders();
                setOtpModalOpen(false);
                setOtpInput('');
                setPendingDeliveryId(null);
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to update status', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeliverClick = async (order: Order) => {
        if (order.paymentMethod === 'online' || (order.paymentMethod as any) === 'prepaid') { // Check payment method

            // Ask for confirmation to send OTP
            if (window.confirm("Do you want to send the OTP for delivery confirmation?")) {
                try {
                    setActionLoading(order._id);
                    // Call API to generate and send OTP
                    await adminApi.post('/delivery/generate-otp', { orderId: order._id });

                    setPendingDeliveryId(order._id);
                    setOtpModalOpen(true);
                } catch (error) {
                    console.error("Failed to send OTP:", error);
                    showToast("Failed to send OTP. Please check server logs.", 'error');
                } finally {
                    setActionLoading(null);
                }
            }

        } else {
            updateStatus(order._id, 'delivered');
        }
    };

    const confirmOtpDelivery = () => {
        console.log('Verifying Delivery with OTP:', { pendingDeliveryId, otpInput });
        if (pendingDeliveryId && otpInput) {
            updateStatus(pendingDeliveryId, 'delivered', otpInput);
        } else {
            showToast("Please enter OTP", 'warning');
        }
    };

    const bulkUpdateStatus = async (status: string) => {
        if (selectedOrders.length === 0) {
            showToast('Please select orders first', 'warning');
            return;
        }

        try {
            setActionLoading('bulk');
            const response = await adminApi.post('/delivery/bulk-update', {
                orderIds: selectedOrders,
                status
            });

            if (response.data.success) {
                showToast(`${response.data.data.updatedCount} orders updated to: ${status}`, 'success');
                setSelectedOrders([]);
                fetchOrders();
            }
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to bulk update', 'error');
        } finally {
            setActionLoading(null);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            processing: 'bg-blue-100 text-blue-800 border-blue-300',
            shipped: 'bg-purple-100 text-purple-800 border-purple-300',
            out_for_delivery: 'bg-orange-100 text-orange-800 border-orange-300',
            delivered: 'bg-green-100 text-green-800 border-green-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300'
        };
        return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
    };

    const getStatusIcon = (status: string) => {
        const icons: Record<string, React.ReactNode> = {
            pending: <Clock className="w-4 h-4" />,
            processing: <Package className="w-4 h-4" />,
            shipped: <Truck className="w-4 h-4" />,
            out_for_delivery: <Truck className="w-4 h-4" />, // Same icon or maybe a running person?
            delivered: <CheckCircle className="w-4 h-4" />,
            cancelled: <XCircle className="w-4 h-4" />
        };
        return icons[status] || <Clock className="w-4 h-4" />;
    };

    const toggleOrderSelection = (orderId: string) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filteredOrders.map(order => order._id));
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6 animate-pulse">
                <div className="mb-8">
                    <div className="h-8 w-64 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-96 bg-gray-200 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
                <div className="h-16 bg-gray-200 rounded-lg mb-6"></div>
                <div className="h-96 bg-white rounded-lg p-4">
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-12 bg-gray-100 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 relative">
            {/* OTP Modal */}
            {otpModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                        <h3 className="text-xl font-bold mb-4">Enter Delivery OTP</h3>
                        <p className="text-sm text-gray-500 mb-4">Ask the customer for the OTP sent to their email.</p>
                        <input
                            type="text"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            className="w-full border border-gray-300 rounded p-2 mb-4 text-center text-2xl tracking-widest"
                            placeholder="Checking..."
                            maxLength={6}
                        />
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => { setOtpModalOpen(false); setOtpInput(''); }}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmOtpDelivery}
                                disabled={otpInput.length < 6}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                Verify & Deliver
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Management</h1>
                <p className="text-gray-600">Manage and track all shipments with real-time Shiprocket integration</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-6">
                {['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'].map(status => {
                    const count = orders.filter(o => o.status === status).length;
                    const isActive = statusFilter === status;
                    return (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
                            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left w-full ${getStatusColor(status)} ${isActive ? 'ring-2 ring-offset-2 ring-orange-500 shadow-md transform scale-[1.02]' : 'hover:shadow-sm opacity-80 hover:opacity-100'}`}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium capitalize">{status.replace(/_/g, ' ')}</p>
                                    <p className="text-xl font-bold">{count}</p>
                                </div>
                                {getStatusIcon(status)}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Filters and Actions */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by Order ID, Customer, Tracking..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none bg-white"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="out_for_delivery">Out For Delivery</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Bulk Actions */}
                    {selectedOrders.length > 0 && (
                        <div className="flex gap-2">
                            <button
                                onClick={() => bulkUpdateStatus('processing')}
                                disabled={actionLoading === 'bulk'}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Package className="w-4 h-4" />
                                Process ({selectedOrders.length})
                            </button>
                            <button
                                onClick={() => bulkUpdateStatus('shipped')}
                                disabled={actionLoading === 'bulk'}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Truck className="w-4 h-4" />
                                Ship ({selectedOrders.length})
                            </button>
                            <button
                                onClick={() => bulkUpdateStatus('out_for_delivery')}
                                disabled={actionLoading === 'bulk'}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <Truck className="w-4 h-4" />
                                Out ({selectedOrders.length})
                            </button>
                            <button
                                onClick={() => bulkUpdateStatus('delivered')}
                                disabled={actionLoading === 'bulk'}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Deliver ({selectedOrders.length})
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-4 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={toggleSelectAll}
                                        className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                    />
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Order</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tracking</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredOrders.map((order) => (
                                <tr key={order._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.includes(order._id)}
                                            onChange={() => toggleOrderSelection(order._id)}
                                            className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                        />
                                    </td>
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{order.user?.fullName || 'N/A'}</p>
                                            <p className="text-sm text-gray-500">{order.user?.email || 'N/A'}</p>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            {order.status.replace(/_/g, ' ').charAt(0).toUpperCase() + order.status.replace(/_/g, ' ').slice(1)}
                                        </span>
                                        {/* Show Shiprocket status if available */}
                                        {(order as any).shiprocketStatus && (
                                            <p className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                SR: {(order as any).shiprocketStatus}
                                            </p>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        {order.trackingNumber ? (
                                            <div className="text-sm">
                                                <p className="font-medium text-gray-900">{order.trackingNumber}</p>
                                                {order.awbCode && (
                                                    <p className="text-gray-500 flex items-center gap-1">
                                                        AWB: {order.awbCode}
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                                                            Shiprocket
                                                        </span>
                                                    </p>
                                                )}
                                                {order.courierName && (
                                                    <p className="text-gray-500">{order.courierName}</p>
                                                )}
                                                {/* Show estimated delivery date */}
                                                {(order as any).estimatedDeliveryDate && (
                                                    <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                        ETA: {new Date((order as any).estimatedDeliveryDate).toLocaleDateString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short'
                                                        })}
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-sm text-gray-400">Not initiated</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-4">
                                        <p className="font-semibold text-gray-900">
                                            ₹{order.totalAmount.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500 uppercase">{order.paymentMethod === 'online' ? 'Prepaid' : 'COD'}</p>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex justify-end gap-2">
                                            {!order.trackingNumber && order.status !== 'cancelled' && (
                                                <button
                                                    onClick={() => initiateDelivery(order._id)}
                                                    disabled={actionLoading === order._id}
                                                    className="px-3 py-1 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm flex items-center gap-1"
                                                >
                                                    <Send className="w-3 h-3" />
                                                    Initiate
                                                </button>
                                            )}

                                            {order.trackingNumber && order.status === 'processing' && (
                                                <button
                                                    onClick={() => updateStatus(order._id, 'shipped')}
                                                    disabled={actionLoading === order._id}
                                                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm flex items-center gap-1"
                                                >
                                                    <Truck className="w-3 h-3" />
                                                    Ship
                                                </button>
                                            )}

                                            {order.status === 'shipped' && (
                                                <button
                                                    onClick={() => updateStatus(order._id, 'out_for_delivery')}
                                                    disabled={actionLoading === order._id}
                                                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center gap-1"
                                                >
                                                    <Truck className="w-3 h-3" />
                                                    Out
                                                </button>
                                            )}

                                            {order.status === 'out_for_delivery' && (
                                                <button
                                                    onClick={() => handleDeliverClick(order)}
                                                    disabled={actionLoading === order._id}
                                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm flex items-center gap-1"
                                                >
                                                    <CheckCircle className="w-3 h-3" />
                                                    Deliver
                                                </button>
                                            )}

                                            {order.status === 'delivered' && (
                                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                                                    ✓ Complete
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No orders found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Help Section */}
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">💡 Quick Guide</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• <strong>Initiate:</strong> Generate tracking number and create Shiprocket shipment</li>
                    <li>• <strong>Status Updates:</strong> Synced automatically with Shiprocket API</li>
                    <li>• <strong>Bulk Actions:</strong> Select multiple orders and update status together</li>
                    <li>• <strong>Tracking:</strong> Real-time tracking with AWB codes and courier information</li>
                </ul>
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

export default AdminMockDeliveryPage;
