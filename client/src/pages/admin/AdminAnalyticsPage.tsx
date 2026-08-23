import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { Users, ShoppingCart, DollarSign, Package, Activity } from 'lucide-react';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';


interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  recentOrders: Array<{
    _id: string;
    totalAmount: number;
    createdAt: string;
  }>;
}

const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const { toasts, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminApi.get('/admin/analytics');
      setAnalytics(response.data.data);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch analytics';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics</h1>
        <p className="text-gray-600">Track your store's performance and growth</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Revenue */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-sm font-medium text-green-600">
              +{analytics?.revenueGrowth || 0}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
          <p className="text-2xl font-bold">₹{(analytics?.totalRevenue || 0).toLocaleString()}</p>
        </div>

        {/* Orders */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm font-medium text-blue-600">
              +{analytics?.ordersGrowth || 0}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Orders</p>
          <p className="text-2xl font-bold">{analytics?.totalOrders || 0}</p>
        </div>

        {/* Users */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-sm font-medium text-purple-600">
              +{analytics?.usersGrowth || 0}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold">{analytics?.totalUsers || 0}</p>
        </div>

        {/* Products */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm font-medium text-gray-400">
              <Activity className="w-4 h-4 inline" />
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Products</p>
          <p className="text-2xl font-bold">{analytics?.totalProducts || 0}</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        {analytics?.recentOrders && analytics.recentOrders.length > 0 ? (
          <div className="space-y-3">
            {analytics.recentOrders.map((order) => (
              <div key={order._id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <p className="font-medium">Order #{order._id.substring(0, 8)}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                  </p>
                </div>
                <p className="font-bold text-green-600">₹{order.totalAmount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent orders</p>
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

export default AdminAnalyticsPage;
