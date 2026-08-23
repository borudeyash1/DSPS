import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import {
    Package,
    Search,
    RefreshCw,
    Truck,
    Calendar,
    MapPin,
    Phone,
    Mail,
    ExternalLink,
    CheckCircle,
    XCircle,
    Clock,
    ChevronDown,
    ChevronUp,
    Box,
    Tag,
    DollarSign,
    MapPinned,
    Edit,
    Plus,
    Wallet,
    FileText
} from 'lucide-react';
import UpdateAddressModal from '../../components/admin/UpdateAddressModal';
import AddOrderModal from '../../components/admin/AddOrderModal';

interface ShiprocketOrder {
    id: number;
    channel_order_id: string;
    channel_created_at: string;
    created_at: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    customer_address_2?: string;
    customer_city: string;
    customer_state: string;
    customer_pincode: string;
    customer_country: string;
    billing_customer_name?: string;
    billing_last_name?: string;
    billing_address?: string;
    billing_city?: string;
    billing_pincode?: string;
    billing_state?: string;
    billing_country?: string;
    billing_email?: string;
    billing_phone?: string;
    products: Array<{
        name: string;
        sku: string;
        units: number;
        selling_price: number;
        discount?: number;
        tax?: number;
        hsn?: number;
    }>;
    total: number;
    sub_total?: number;
    payment_method: string;
    shipping_charges?: number;
    giftwrap_charges?: number;
    transaction_charges?: number;
    total_discount?: number;
    reseller_name?: string;
    company_name?: string;
    order_tag?: string;
    status: string;
    status_code: number;
    shiprocket_order_id?: number;
    shipment_id?: number;
    awb_code?: string;
    courier_name?: string;
    courier_company_id?: number;
    pickup_scheduled_date?: string;
    delivered_date?: string;
    etd?: string;
    tracking_url?: string;
    label_url?: string;
    length?: number;
    breadth?: number;
    height?: number;
    weight?: number;
    volumetric_weight?: number;
    comment?: string;
    pickup_location?: string;
    channel_name?: string;
    shipments?: Array<{
        id: number;
        awb: string;
        courier_name: string;
        status: string;
        current_status: string;
        etd: string;
        pickup_scheduled_date: string;
    }>;
}

type TabType = 'orders' | 'tracker' | 'pickup';

const AdminShiprocketDeliveryPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabType>('orders');
    const [orders, setOrders] = useState<ShiprocketOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
    const [isUpdateAddressModalOpen, setIsUpdateAddressModalOpen] = useState(false);
    const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState<ShiprocketOrder | null>(null);
    const [isAddOrderModalOpen, setIsAddOrderModalOpen] = useState(false);
    
    // Tracking states
    const [trackingAwb, setTrackingAwb] = useState('');
    const [trackingData, setTrackingData] = useState<any>(null);
    const [trackingLoading, setTrackingLoading] = useState(false);
    const [trackingError, setTrackingError] = useState('');

    // Wallet balance state
    const [walletBalance, setWalletBalance] = useState<number | null>(null);
    const [walletLoading, setWalletLoading] = useState(false);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
            fetchWalletBalance();
        }
    }, [activeTab, statusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const response = await adminApi.get(
                '/shiprocket/orders',
                {
                    params: {
                        page: 1,
                        perPage: 100
                    }
                }
            );
            
            const shiprocketOrders = response.data.data?.data || [];
            setOrders(shiprocketOrders);
        } catch (error) {
            console.error('Failed to fetch Shiprocket orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWalletBalance = async () => {
        try {
            setWalletLoading(true);
            const response = await adminApi.get(
                '/shiprocket/wallet-balance'
            );
            
            console.log('Wallet API Response:', response.data);
            
            if (response.data.success && response.data.data) {
                // The API returns: { data: { data: { balance_amount: '434.76' } } }
                const walletData = response.data.data.data || response.data.data;
                const balanceStr = walletData?.balance_amount || 
                                  walletData?.usable_balance || 
                                  walletData?.balance || 
                                  '0';
                
                // Convert string to number
                const balance = parseFloat(balanceStr);
                
                console.log('Extracted balance:', balance);
                setWalletBalance(balance);
            }
        } catch (error) {
            console.error('Failed to fetch wallet balance:', error);
        } finally {
            setWalletLoading(false);
        }
    };

    const toggleOrderExpansion = (orderId: number) => {
        const newExpanded = new Set(expandedOrders);
        if (newExpanded.has(orderId)) {
            newExpanded.delete(orderId);
        } else {
            newExpanded.add(orderId);
        }
        setExpandedOrders(newExpanded);
    };

    const handleEditAddress = (order: ShiprocketOrder) => {
        setSelectedOrderForUpdate(order);
        setIsUpdateAddressModalOpen(true);
    };

    const handleAddressUpdateSuccess = () => {
        fetchOrders(); // Refresh orders after update
    };

    const handleTrackShipment = async () => {
        if (!trackingAwb.trim()) return;

        try {
            setTrackingLoading(true);
            setTrackingError('');
            setTrackingData(null);

            const response = await adminApi.get(
                `/shiprocket/track/${trackingAwb.trim()}`
            );

            if (response.data.success && response.data.data?.tracking_data) {
                setTrackingData(response.data.data.tracking_data);
            } else {
                setTrackingError('No tracking data found for this AWB code');
            }
        } catch (error: any) {
            console.error('Failed to track shipment:', error);
            setTrackingError(
                error.response?.data?.message || 
                'Failed to track shipment. Please check the AWB code and try again.'
            );
        } finally {
            setTrackingLoading(false);
        }
    };

    const getStatusBadge = (statusCode?: number) => {
        const statusConfig: { [key: number]: { bg: string; text: string; icon: any; label: string } } = {
            1: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock, label: 'NEW' },
            4: { bg: 'bg-purple-100', text: 'text-purple-800', icon: Calendar, label: 'PICKUP SCHEDULED' },
            51: { bg: 'bg-indigo-100', text: 'text-indigo-800', icon: Truck, label: 'PICKED UP' },
            6: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Truck, label: 'SHIPPED' },
            20: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Truck, label: 'IN TRANSIT' },
            19: { bg: 'bg-orange-100', text: 'text-orange-800', icon: Truck, label: 'OUT FOR DELIVERY' },
            7: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle, label: 'DELIVERED' },
            15: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'RTO INITIATED' },
            16: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle, label: 'RTO DELIVERED' },
            5: { bg: 'bg-gray-100', text: 'text-gray-800', icon: XCircle, label: 'CANCELLED' },
        };

        const config = statusConfig[statusCode || 1] || statusConfig[1];
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
                <Icon className="w-3.5 h-3.5" />
                {config.label}
            </span>
        );
    };

    const filteredOrders = orders.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        return (
            order.channel_order_id?.toLowerCase().includes(searchLower) ||
            order.customer_name?.toLowerCase().includes(searchLower) ||
            order.awb_code?.toLowerCase().includes(searchLower) ||
            order.shiprocket_order_id?.toString().includes(searchLower)
        );
    });

    const stats = {
        total: orders.length,
        new: orders.filter(o => o.status_code === 1 || !o.awb_code).length,
        inTransit: orders.filter(o => [6, 19, 20].includes(o.status_code || 0)).length,
        delivered: orders.filter(o => o.status_code === 7).length,
        rto: orders.filter(o => [15, 16].includes(o.status_code || 0)).length,
    };

    const tabs = [
        { id: 'orders' as TabType, label: 'Orders', icon: Package, count: stats.total },
        { id: 'tracker' as TabType, label: 'Track Shipments', icon: MapPinned, count: 0 },
        { id: 'pickup' as TabType, label: 'Pickup Requests', icon: Truck, count: stats.new },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <Package className="w-8 h-8 text-orange-600" />
                                Shiprocket Delivery Management
                            </h1>
                            <p className="text-gray-600 mt-1">Track and manage all shipments via Shiprocket</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Wallet Balance */}
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg px-4 py-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-500 p-2 rounded-lg">
                                        <Wallet className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-green-600 font-medium">Wallet Balance</p>
                                        {walletLoading ? (
                                            <div className="flex items-center gap-2">
                                                <RefreshCw className="w-4 h-4 animate-spin text-green-600" />
                                                <p className="text-sm text-green-700">Loading...</p>
                                            </div>
                                        ) : walletBalance !== null ? (
                                            <p className="text-xl font-bold text-green-700">
                                                ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </p>
                                        ) : (
                                            <p className="text-sm text-gray-500">N/A</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setIsAddOrderModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Order
                                </button>
                                <button
                                    onClick={fetchOrders}
                                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                                >
                                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                                    Refresh
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-b border-gray-200">
                        <nav className="flex gap-1">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            flex items-center gap-2 px-6 py-3 border-b-2 font-medium text-sm transition-colors
                                            ${isActive 
                                                ? 'border-orange-600 text-orange-600' 
                                                : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                                            }
                                        `}
                                    >
                                        <Icon className="w-4 h-4" />
                                        {tab.label}
                                        {tab.count > 0 && (
                                            <span className={`
                                                px-2 py-0.5 rounded-full text-xs font-semibold
                                                ${isActive 
                                                    ? 'bg-orange-100 text-orange-700' 
                                                    : 'bg-gray-100 text-gray-600'
                                                }
                                            `}>
                                                {tab.count}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-8 py-6">
                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-5 gap-4 mb-6">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                                        <p className="text-2xl font-bold text-blue-900 mt-1">{stats.total}</p>
                                    </div>
                                    <Package className="w-8 h-8 text-blue-400" />
                                </div>
                            </div>

                            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-purple-600 font-medium">New / Pending</p>
                                        <p className="text-2xl font-bold text-purple-900 mt-1">{stats.new}</p>
                                    </div>
                                    <Clock className="w-8 h-8 text-purple-400" />
                                </div>
                            </div>

                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-yellow-600 font-medium">In Transit</p>
                                        <p className="text-2xl font-bold text-yellow-900 mt-1">{stats.inTransit}</p>
                                    </div>
                                    <Truck className="w-8 h-8 text-yellow-400" />
                                </div>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-green-600 font-medium">Delivered</p>
                                        <p className="text-2xl font-bold text-green-900 mt-1">{stats.delivered}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-400" />
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-red-600 font-medium">RTO</p>
                                        <p className="text-2xl font-bold text-red-900 mt-1">{stats.rto}</p>
                                    </div>
                                    <XCircle className="w-8 h-8 text-red-400" />
                                </div>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by Order ID, Customer, AWB, Shiprocket ID..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            >
                                <option value="all">All Status</option>
                                <option value="1">New</option>
                                <option value="4">Pickup Scheduled</option>
                                <option value="20">In Transit</option>
                                <option value="19">Out for Delivery</option>
                                <option value="7">Delivered</option>
                                <option value="15">RTO</option>
                            </select>
                        </div>

                        {/* Orders List */}
                        {loading ? (
                            <div className="flex items-center justify-center py-20">
                                <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
                            </div>
                        ) : filteredOrders.length === 0 ? (
                            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shiprocket Orders Found</h3>
                                <p className="text-gray-600">Orders with Shiprocket shipments will appear here</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredOrders.map((order) => {
                                    const isExpanded = expandedOrders.has(order.id);
                                    
                                    return (
                                        <div key={order.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                            {/* Main Order Row */}
                                            <div className="p-6">
                                                <div className="grid grid-cols-7 gap-4 items-center">
                                                    {/* Order Details */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Order Details</p>
                                                        <p className="font-bold text-blue-600 hover:underline cursor-pointer break-all">
                                                            {order.channel_order_id || `#${order.id}`}
                                                        </p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                                day: '2-digit',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })} | {new Date(order.created_at).toLocaleTimeString('en-IN', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                        {order.channel_name && (
                                                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                                                                <Box className="w-3 h-3" />
                                                                {order.channel_name}
                                                            </p>
                                                        )}
                                                        {order.order_tag && (
                                                            <p className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded mt-1 inline-flex items-center gap-1">
                                                                <Tag className="w-3 h-3" />
                                                                {order.order_tag}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Customer Details */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Customer Details</p>
                                                        <p className="font-medium text-gray-900">{order.customer_name}</p>
                                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                            <Phone className="w-3 h-3" />
                                                            {order.customer_phone}
                                                        </p>
                                                    </div>

                                                    {/* Payment */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Payment</p>
                                                        <p className="font-bold text-gray-900">₹{order.total}</p>
                                                        <p className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${
                                                            order.payment_method === 'COD' 
                                                                ? 'bg-orange-100 text-orange-700' 
                                                                : 'bg-green-100 text-green-700'
                                                        }`}>
                                                            {order.payment_method}
                                                        </p>
                                                    </div>

                                                    {/* Pickup/RTO Addresses */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Pickup / RTO Addresses</p>
                                                        <p className="text-sm text-gray-900">{order.pickup_location || 'Primary'}</p>
                                                    </div>

                                                    {/* Shipping Details */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Shipping Details</p>
                                                        <p className="text-sm text-gray-900">
                                                            {order.shipments?.[0]?.courier_name || order.courier_name || 'DTDC Air 500gm'}
                                                        </p>
                                                        {(() => {
                                                            // Check multiple possible AWB sources
                                                            const awb = order.awb_code || 
                                                                       order.shipments?.[0]?.awb || 
                                                                       (order as any).awb;
                                                            
                                                            return awb ? (
                                                                <>
                                                                    <p className="text-xs text-gray-500 mt-1">AWB #</p>
                                                                    <p className="text-xs font-mono font-semibold text-blue-600">{awb}</p>
                                                                </>
                                                            ) : (
                                                                <p className="text-xs text-gray-400 mt-1">AWB # Not Generated</p>
                                                            );
                                                        })()}
                                                        {(() => {
                                                            const etd = order.etd || order.shipments?.[0]?.etd;
                                                            return etd && (
                                                                <p className="text-xs text-gray-500 mt-1">
                                                                    On {new Date(etd).toLocaleDateString('en-IN', {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    })}
                                                                </p>
                                                            );
                                                        })()}
                                                        {(() => {
                                                            const pickupDate = order.pickup_scheduled_date || order.shipments?.[0]?.pickup_scheduled_date;
                                                            return pickupDate && (
                                                                <p className="text-xs text-gray-500">
                                                                    Pickup Date: {new Date(pickupDate).toLocaleDateString('en-IN', {
                                                                        day: '2-digit',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    })}
                                                                </p>
                                                            );
                                                        })()}
                                                    </div>

                                                    {/* Status */}
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Status</p>
                                                        {getStatusBadge(order.status_code)}
                                                        {order.delivered_date && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                On {new Date(order.delivered_date).toLocaleDateString('en-IN')}
                                                            </p>
                                                        )}
                                                    </div>

                                                    {/* Action */}
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => toggleOrderExpansion(order.id)}
                                                            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                                            title="View Details"
                                                        >
                                                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                                        </button>
                                                        
                                                        {order.label_url && (
                                                            <a
                                                                href={order.label_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                                title="Download Label"
                                                            >
                                                                <FileText className="w-5 h-5" />
                                                            </a>
                                                        )}

                                                        {order.tracking_url && (
                                                            <a
                                                                href={order.tracking_url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                title="Track Shipment"
                                                            >
                                                                <ExternalLink className="w-5 h-5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Details */}
                                            {isExpanded && (
                                                <div className="border-t border-gray-200 bg-gray-50 p-6">
                                                    <div className="grid grid-cols-3 gap-6">
                                                        {/* Package Details */}
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                <Box className="w-4 h-4" />
                                                                Package Details
                                                            </h4>
                                                            <div className="space-y-2 text-sm">
                                                                {order.weight && (
                                                                    <p className="flex justify-between">
                                                                        <span className="text-gray-600">Weight:</span>
                                                                        <span className="font-medium">{order.weight} kg</span>
                                                                    </p>
                                                                )}
                                                                {order.length && order.breadth && order.height && (
                                                                    <p className="flex justify-between">
                                                                        <span className="text-gray-600">Dimensions:</span>
                                                                        <span className="font-medium">{order.length} × {order.breadth} × {order.height} cm</span>
                                                                    </p>
                                                                )}
                                                                {order.volumetric_weight && (
                                                                    <p className="flex justify-between">
                                                                        <span className="text-gray-600">Volumetric Weight:</span>
                                                                        <span className="font-medium">{order.volumetric_weight} kg</span>
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Products */}
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                <Package className="w-4 h-4" />
                                                                Products ({order.products?.length || 0})
                                                            </h4>
                                                            <div className="space-y-2">
                                                                {order.products?.map((product, idx) => (
                                                                    <div key={idx} className="text-sm bg-white p-2 rounded border border-gray-200">
                                                                        <p className="font-medium text-gray-900">{product.name}</p>
                                                                        <p className="text-gray-500 text-xs">SKU: {product.sku}</p>
                                                                        <p className="text-gray-600 text-xs">
                                                                            Qty: {product.units} × ₹{product.selling_price}
                                                                        </p>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Shipping Address */}
                                                        <div>
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                                                                    <MapPin className="w-4 h-4" />
                                                                    Shipping Address
                                                                </h4>
                                                                <button
                                                                    onClick={() => handleEditAddress(order)}
                                                                    className="flex items-center gap-1 px-2 py-1 text-xs text-orange-600 hover:bg-orange-50 rounded transition-colors"
                                                                    title="Edit Address"
                                                                >
                                                                    <Edit className="w-3 h-3" />
                                                                    Edit
                                                                </button>
                                                            </div>
                                                            <div className="text-sm text-gray-700 space-y-1">
                                                                <p className="font-medium">{order.customer_name}</p>
                                                                <p>{order.customer_address}</p>
                                                                {order.customer_address_2 && <p>{order.customer_address_2}</p>}
                                                                <p>{order.customer_city}, {order.customer_state} - {order.customer_pincode}</p>
                                                                <p>{order.customer_country}</p>
                                                                <p className="flex items-center gap-1 text-gray-600 mt-2">
                                                                    <Phone className="w-3 h-3" />
                                                                    {order.customer_phone}
                                                                </p>
                                                                <p className="flex items-center gap-1 text-gray-600">
                                                                    <Mail className="w-3 h-3" />
                                                                    {order.customer_email}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Order Summary */}
                                                        <div className="col-span-3 mt-4 pt-4 border-t border-gray-300">
                                                            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                                                <DollarSign className="w-4 h-4" />
                                                                Order Summary
                                                            </h4>
                                                            <div className="grid grid-cols-4 gap-4 text-sm">
                                                                <div>
                                                                    <p className="text-gray-600">Sub Total:</p>
                                                                    <p className="font-medium">₹{order.sub_total || order.total}</p>
                                                                </div>
                                                                {order.shipping_charges !== undefined && (
                                                                    <div>
                                                                        <p className="text-gray-600">Shipping:</p>
                                                                        <p className="font-medium">₹{order.shipping_charges}</p>
                                                                    </div>
                                                                )}
                                                                {order.total_discount !== undefined && order.total_discount > 0 && (
                                                                    <div>
                                                                        <p className="text-gray-600">Discount:</p>
                                                                        <p className="font-medium text-green-600">-₹{order.total_discount}</p>
                                                                    </div>
                                                                )}
                                                                <div>
                                                                    <p className="text-gray-600">Total:</p>
                                                                    <p className="font-bold text-lg">₹{order.total}</p>
                                                                </div>
                                                            </div>
                                                            {order.comment && (
                                                                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                                                                    <p className="text-xs text-gray-600 mb-1">Comment:</p>
                                                                    <p className="text-sm text-gray-800">{order.comment}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}


                {/* Tracker Tab */}
                {activeTab === 'tracker' && (
                    <div className="space-y-6">
                        {/* Search Section */}
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Track Your Shipment</h3>
                            <p className="text-sm text-gray-600 mb-4">Enter AWB code or Shipment ID to track your shipment</p>
                            
                            <div className="flex gap-3">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Enter AWB Code (e.g., 788830567028)"
                                        value={trackingAwb}
                                        onChange={(e) => setTrackingAwb(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleTrackShipment()}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                                <button
                                    onClick={handleTrackShipment}
                                    disabled={trackingLoading || !trackingAwb.trim()}
                                    className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {trackingLoading ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Tracking...
                                        </>
                                    ) : (
                                        <>
                                            <MapPinned className="w-5 h-5" />
                                            Track Shipment
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Tracking Results */}
                        {trackingData && (
                            <div className="space-y-6">
                                {/* Shipment Summary */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">Shipment Details</h3>
                                            <p className="text-sm text-gray-500 mt-1">AWB: {trackingData.shipment_track?.[0]?.awb_code}</p>
                                        </div>
                                        {trackingData.shipment_track?.[0]?.current_status && (
                                            <div>
                                                {getStatusBadge(trackingData.shipment_status)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Courier</p>
                                            <p className="font-semibold text-gray-900">{trackingData.shipment_track?.[0]?.courier_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Origin</p>
                                            <p className="font-semibold text-gray-900">{trackingData.shipment_track?.[0]?.origin || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Destination</p>
                                            <p className="font-semibold text-gray-900">{trackingData.shipment_track?.[0]?.destination || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Weight</p>
                                            <p className="font-semibold text-gray-900">{trackingData.shipment_track?.[0]?.weight || 'N/A'} kg</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Pickup Date</p>
                                            <p className="font-semibold text-gray-900">
                                                {trackingData.shipment_track?.[0]?.pickup_date 
                                                    ? new Date(trackingData.shipment_track[0].pickup_date).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : 'N/A'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Delivered Date</p>
                                            <p className="font-semibold text-gray-900">
                                                {trackingData.shipment_track?.[0]?.delivered_date 
                                                    ? new Date(trackingData.shipment_track[0].delivered_date).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : 'In Transit'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Expected Delivery</p>
                                            <p className="font-semibold text-gray-900">
                                                {trackingData.etd 
                                                    ? new Date(trackingData.etd).toLocaleDateString('en-IN', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })
                                                    : 'N/A'
                                                }
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Packages</p>
                                            <p className="font-semibold text-gray-900">{trackingData.shipment_track?.[0]?.packages || 1}</p>
                                        </div>
                                    </div>

                                    {trackingData.track_url && (
                                        <div className="mt-6 pt-6 border-t border-gray-200">
                                            <a
                                                href={trackingData.track_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                                Track on Shiprocket Website
                                            </a>
                                        </div>
                                    )}
                                </div>

                                {/* Tracking Timeline */}
                                <div className="bg-white rounded-lg border border-gray-200 p-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Tracking History</h3>
                                    
                                    {trackingData.shipment_track_activities && trackingData.shipment_track_activities.length > 0 ? (
                                        <div className="relative">
                                            {/* Timeline Line */}
                                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                                            
                                            {/* Timeline Items */}
                                            <div className="space-y-6">
                                                {trackingData.shipment_track_activities.map((activity: any, index: number) => {
                                                    const isLatest = index === 0;
                                                    const isDelivered = activity['sr-status'] === '7';
                                                    
                                                    return (
                                                        <div key={index} className="relative flex gap-4">
                                                            {/* Timeline Dot */}
                                                            <div className={`
                                                                relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                                                                ${isDelivered 
                                                                    ? 'bg-green-500' 
                                                                    : isLatest 
                                                                        ? 'bg-orange-500' 
                                                                        : 'bg-gray-300'
                                                                }
                                                            `}>
                                                                {isDelivered ? (
                                                                    <CheckCircle className="w-5 h-5 text-white" />
                                                                ) : isLatest ? (
                                                                    <Truck className="w-4 h-4 text-white" />
                                                                ) : (
                                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                                )}
                                                            </div>

                                                            {/* Activity Content */}
                                                            <div className="flex-1 pb-6">
                                                                <div className={`
                                                                    p-4 rounded-lg border-2
                                                                    ${isLatest 
                                                                        ? 'bg-orange-50 border-orange-200' 
                                                                        : 'bg-gray-50 border-gray-200'
                                                                    }
                                                                `}>
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div>
                                                                            <p className={`
                                                                                font-semibold
                                                                                ${isDelivered 
                                                                                    ? 'text-green-700' 
                                                                                    : isLatest 
                                                                                        ? 'text-orange-700' 
                                                                                        : 'text-gray-900'
                                                                                }
                                                                            `}>
                                                                                {activity['sr-status-label'] || activity.status}
                                                                            </p>
                                                                            <p className="text-sm text-gray-600 mt-1">{activity.activity}</p>
                                                                        </div>
                                                                        {isLatest && (
                                                                            <span className="px-2 py-1 bg-orange-600 text-white text-xs font-semibold rounded">
                                                                                Latest
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                                                                        <div className="flex items-center gap-1">
                                                                            <Calendar className="w-3 h-3" />
                                                                            {new Date(activity.date).toLocaleDateString('en-IN', {
                                                                                day: '2-digit',
                                                                                month: 'short',
                                                                                year: 'numeric'
                                                                            })}
                                                                        </div>
                                                                        <div className="flex items-center gap-1">
                                                                            <Clock className="w-3 h-3" />
                                                                            {new Date(activity.date).toLocaleTimeString('en-IN', {
                                                                                hour: '2-digit',
                                                                                minute: '2-digit'
                                                                            })}
                                                                        </div>
                                                                        {activity.location && (
                                                                            <div className="flex items-center gap-1">
                                                                                <MapPin className="w-3 h-3" />
                                                                                {activity.location}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <MapPinned className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>No tracking history available</p>
                                        </div>
                                    )}
                                </div>

                                {/* POD Section */}
                                {trackingData.shipment_track?.[0]?.pod === 'Available' && trackingData.shipment_track?.[0]?.pod_status && (
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Proof of Delivery (POD)</h3>
                                        <a
                                            href={trackingData.shipment_track[0].pod_status}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            View POD Document
                                        </a>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* No Results */}
                        {trackingError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                                <h3 className="text-lg font-semibold text-red-900 mb-2">Tracking Failed</h3>
                                <p className="text-red-700">{trackingError}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pickup Tab */}
                {activeTab === 'pickup' && (
                    <div className="space-y-6">
                        <div className="bg-white rounded-lg border border-gray-200 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-orange-600" />
                                        Pickup Requests
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">Orders that need pickup scheduling</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-orange-600">{stats.new}</p>
                                    <p className="text-xs text-gray-500">Pending Pickups</p>
                                </div>
                            </div>

                            {/* Orders needing pickup */}
                            {loading ? (
                                <div className="flex items-center justify-center py-12">
                                    <RefreshCw className="w-8 h-8 animate-spin text-orange-600" />
                                </div>
                            ) : orders.filter(o => !o.awb_code || o.status_code === 1).length === 0 ? (
                                <div className="text-center py-12">
                                    <CheckCircle className="w-16 h-16 text-green-300 mx-auto mb-4" />
                                    <h4 className="text-lg font-semibold text-gray-900 mb-2">All Pickups Scheduled!</h4>
                                    <p className="text-gray-600">No orders are waiting for pickup scheduling</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.filter(o => !o.awb_code || o.status_code === 1).map((order) => (
                                        <div key={order.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                            <div className="grid grid-cols-5 gap-4 items-center">
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Order ID</p>
                                                    <p className="font-semibold text-blue-600">{order.channel_order_id || `#${order.id}`}</p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {new Date(order.created_at).toLocaleDateString('en-IN', {
                                                            day: '2-digit',
                                                            month: 'short',
                                                            year: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Customer</p>
                                                    <p className="font-medium text-gray-900">{order.customer_name}</p>
                                                    <p className="text-xs text-gray-500">{order.customer_phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Location</p>
                                                    <p className="text-sm text-gray-900">{order.customer_city}, {order.customer_state}</p>
                                                    <p className="text-xs text-gray-500">{order.customer_pincode}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                                                    <p className="font-bold text-gray-900">₹{order.total}</p>
                                                    <p className={`text-xs mt-1 px-2 py-0.5 rounded inline-block ${
                                                        order.payment_method === 'COD' 
                                                            ? 'bg-orange-100 text-orange-700' 
                                                            : 'bg-green-100 text-green-700'
                                                    }`}>
                                                        {order.payment_method}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    {order.awb_code ? (
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">AWB Generated</p>
                                                            <p className="text-xs font-mono font-semibold text-green-600">{order.awb_code}</p>
                                                            {getStatusBadge(order.status_code)}
                                                        </div>
                                                    ) : (
                                                        <div>
                                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                                <Clock className="w-3.5 h-3.5" />
                                                                Awaiting Pickup
                                                            </span>
                                                            <p className="text-xs text-gray-500 mt-2">AWB not generated</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Info Card */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-500 p-2 rounded-lg">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-900 mb-1">About Pickup Requests</h4>
                                    <p className="text-sm text-blue-700">
                                        Orders shown here are waiting for AWB generation and pickup scheduling. 
                                        Once an AWB is assigned, the pickup will be automatically scheduled with the courier partner.
                                        The system handles this automatically when orders are placed.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Update Address Modal */}
            {selectedOrderForUpdate && (
                <UpdateAddressModal
                    isOpen={isUpdateAddressModalOpen}
                    onClose={() => {
                        setIsUpdateAddressModalOpen(false);
                        setSelectedOrderForUpdate(null);
                    }}
                    order={selectedOrderForUpdate}
                    onSuccess={handleAddressUpdateSuccess}
                />
            )}

            {/* Add Order Modal */}
            <AddOrderModal
                isOpen={isAddOrderModalOpen}
                onClose={() => setIsAddOrderModalOpen(false)}
                onSuccess={handleAddressUpdateSuccess}
            />
        </div>
    );
};

export default AdminShiprocketDeliveryPage;
