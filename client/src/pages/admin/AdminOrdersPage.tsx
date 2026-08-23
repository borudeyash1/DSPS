import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { Search, Package, CheckCircle, XCircle, Clock, Truck, ChevronLeft, ChevronRight } from 'lucide-react';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';


interface Order {
  _id: string;
  user?: {
    fullName: string;
    email: string;
    phone?: string;
  };
  items: Array<{
    product: {
      _id: string;
      name: string;
    };
    name: string;
    price: number;
    quantity: number;
    size?: string;
    color?: string;
    image?: string;
    isReviewed?: boolean;
    reviewId?: { rating: number } | string;
  }>;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
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
  createdAt: string;
}

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast, hideToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Visual Highlight State
  const [activeHighlight, setActiveHighlight] = useState<string>('all');

  // Pagination State
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 500);
    return () => clearTimeout(timer);
  }, [statusFilter, page, searchTerm]);

  // ... (keep real-time updates)

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('page', page.toString());
      params.append('limit', LIMIT.toString());
      if (searchTerm) params.append('search', searchTerm);

      const response = await adminApi.get(`/admin/orders?${params.toString()}`);
      setOrders(response.data.data || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };



  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      processing: { color: 'bg-blue-100 text-blue-800', icon: Package },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: Truck },
      delivered: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', icon: XCircle }
    };
    return badges[status as keyof typeof badges] || badges.pending;
  };

  const filteredOrders = orders; // Direct reference since backend handles filtering

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length
  };

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-100 rounded"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white p-4 rounded-lg border border-gray-200 space-y-2">
              <div className="h-3 w-20 bg-gray-100 rounded"></div>
              <div className="h-8 w-12 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>

        {/* Filters Skeleton */}
        <div className="flex gap-4">
          <div className="h-12 flex-1 bg-white border border-gray-200 rounded-lg"></div>
          <div className="h-12 w-48 bg-white border border-gray-200 rounded-lg"></div>
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-12 bg-gray-50 border-b border-gray-200"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100 gap-4">
              <div className="w-24 h-6 bg-gray-100 rounded"></div>
              <div className="flex-1 space-y-1">
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-3 w-48 bg-gray-100 rounded"></div>
              </div>
              <div className="w-16 h-4 bg-gray-100 rounded"></div>
              <div className="w-20 h-5 bg-gray-200 rounded"></div>
              <div className="w-24 h-6 bg-gray-100 rounded-full"></div>
              <div className="w-24 h-6 bg-gray-100 rounded-full"></div>
              <div className="w-20 h-4 bg-gray-100 rounded"></div>
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Order Management</h1>
        <p className="text-gray-600">
          View customer orders. To change order status, use the{' '}
          <a href="/my-admin/delivery" className="text-blue-600 hover:underline font-medium">
            Delivery page
          </a>
        </p>
      </div>

      {/* Stats with Visual Highlighting */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div
          onClick={() => setActiveHighlight('all')}
          className={`bg-white p-4 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'all' ? 'border-black ring-1 ring-black shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-gray-300'}`}
        >
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div
          onClick={() => setActiveHighlight('pending')}
          className={`bg-white p-4 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'pending' ? 'border-yellow-500 ring-1 ring-yellow-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-yellow-200'}`}
        >
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div
          onClick={() => setActiveHighlight('processing')}
          className={`bg-white p-4 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'processing' ? 'border-blue-500 ring-1 ring-blue-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-blue-200'}`}
        >
          <p className="text-sm text-gray-600 mb-1">Processing</p>
          <p className="text-2xl font-bold text-blue-600">{stats.processing}</p>
        </div>
        <div
          onClick={() => setActiveHighlight('shipped')}
          className={`bg-white p-4 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'shipped' ? 'border-purple-500 ring-1 ring-purple-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-purple-200'}`}
        >
          <p className="text-sm text-gray-600 mb-1">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">{stats.shipped}</p>
        </div>
        <div
          onClick={() => setActiveHighlight('delivered')}
          className={`bg-white p-4 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'delivered' ? 'border-green-500 ring-1 ring-green-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-green-200'}`}
        >
          <p className="text-sm text-gray-600 mb-1">Delivered</p>
          <p className="text-2xl font-bold text-green-600">{stats.delivered}</p>
        </div>
      </div>

      {/* Alerts */}

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by customer name, email, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reviews
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No orders found matching your search' : 'No orders yet'}
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const StatusIcon = getStatusBadge(order.status).icon;
                  const isHighlighted = activeHighlight === 'all' || order.status === activeHighlight;

                  return (
                    <tr
                      key={order._id}
                      className={`
                        transition-all duration-500 ease-in-out
                        ${isHighlighted
                          ? 'hover:bg-gray-50 opacity-100 transform scale-100'
                          : 'opacity-30 blur-[0.5px] scale-[0.98] grayscale'}
                        ${activeHighlight !== 'all' && order.status === activeHighlight ? 'bg-blue-50/30' : ''}
                      `}
                      style={{
                        boxShadow: activeHighlight !== 'all' && order.status === activeHighlight ? 'inset 3px 0 0 0 #3b82f6' : 'none'
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {order._id.substring(0, 8)}...
                          </code>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order._id);
                              showToast('Order ID copied to clipboard!', 'success');
                            }}
                            className="p-1 hover:bg-gray-200 rounded transition-colors"
                            title="Copy full order ID"
                          >
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{order.user?.fullName || 'Unknown User'}</p>
                          <p className="text-sm text-gray-500">{order.user?.email || 'No email'}</p>
                          {order.user?.phone && (
                            <p className="text-sm text-gray-500">{order.user.phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {order.items.length} item{order.items.length > 1 ? 's' : ''}
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          const reviewedCount = order.items.filter(item => item.isReviewed).length;



                          return (
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${reviewedCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                {reviewedCount > 0 ? (
                                  <>
                                    <svg className="w-3 h-3 mr-1 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    {/* Show average if multiple, or list them? Let's show avg for compactness */}
                                    {(() => {
                                      const ratings = order.items
                                        .filter(i => i.isReviewed && i.reviewId && typeof i.reviewId === 'object')
                                        .map(i => (i.reviewId as any).rating);
                                      const avg = ratings.length ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
                                      return `${avg}/6 (${reviewedCount})`;
                                    })()}
                                  </>
                                ) : (
                                  'No Reviews'
                                )}
                              </span>
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium text-gray-900 uppercase">
                            {order.paymentMethod}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full w-fit ${order.paymentStatus === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : order.paymentStatus === 'failed'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                            }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status).color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-lg flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) ? (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded border text-sm flex items-center justify-center ${page === p ? 'bg-black text-white border-black' : 'bg-white hover:bg-gray-50'
                    }`}
                >
                  {p}
                </button>
              ) : (p === page - 2 || p === page + 2) ? <span key={p} className="px-1">...</span> : null
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
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

export default AdminOrdersPage;
