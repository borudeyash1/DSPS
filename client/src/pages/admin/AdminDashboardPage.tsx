import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import adminApi from '../../services/adminApi';
import NotificationBell from '../../components/admin/NotificationBell';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowRight,
  X,
  MapPin,
  CreditCard,
  Phone,
  Mail,
  Settings,
  Smartphone,
  Tablet,

  Monitor
} from 'lucide-react';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';



interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
  recentOrders: any[];
  lowStockProducts: any[];
  revenueGrowth: number;
  ordersGrowth: number;
  usersGrowth: number;
  salesChartData: { _id: string; totalSales: number; orderCount: number }[];
  salesByCategory: { _id: string; totalSales: number }[];
  userGrowthData: { _id: string; userCount: number }[];
  deviceStats?: { _id: string; count: number }[]; // Added for device visualization
  recentUsers?: any[]; // Added for recent users
}

// Custom Tooltip Component for Recharts
const CustomTooltip = ({ active, payload, label, prefix = '' }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="font-bold text-gray-800">
          {prefix}{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const { toasts, showToast, hideToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const usersSectionRef = useRef<HTMLDivElement>(null);
  const transactionsSectionRef = useRef<HTMLDivElement>(null);
  const usersControls = useAnimation();
  const transactionsControls = useAnimation();

  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await adminApi.get('/admin/dashboard/stats');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        showToast('Failed to load dashboard statistics', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Colors for charts
  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316'];

  if (isLoading) {
    return (
      <div className="p-6 max-w-[1600px] mx-auto space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded-md animate-pulse"></div>
            <div className="h-4 w-96 bg-gray-100 rounded-md animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-48 bg-gray-100 rounded-full animate-pulse"></div>
            <div className="h-9 w-9 bg-gray-100 rounded-full animate-pulse"></div>
          </div>
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm h-32 animate-pulse">
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl"></div>
                <div className="w-16 h-6 bg-gray-50 rounded-full"></div>
              </div>
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-100 rounded"></div>
                <div className="h-8 w-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row 1 Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[380px] animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div className="space-y-2">
                <div className="h-6 w-48 bg-gray-200 rounded"></div>
                <div className="h-4 w-32 bg-gray-100 rounded"></div>
              </div>
              <div className="w-10 h-10 bg-gray-100 rounded-lg"></div>
            </div>
            <div className="w-full h-[280px] bg-gray-50 rounded-xl"></div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[380px] animate-pulse">
            <div className="mb-6 space-y-2">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-24 bg-gray-100 rounded"></div>
            </div>
            <div className="w-full h-[280px] bg-gray-50 rounded-xl"></div>
          </div>
        </div>

        {/* Row 2 Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[300px] animate-pulse">
            <div className="mb-6 space-y-2">
              <div className="h-6 w-32 bg-gray-200 rounded"></div>
              <div className="h-4 w-48 bg-gray-100 rounded"></div>
            </div>
            <div className="flex items-center justify-center h-[180px]">
              <div className="flex gap-4">
                <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm h-[300px] animate-pulse p-6">
            <div className="w-full h-full bg-gray-50 rounded-xl"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-[350px] animate-pulse"></div>
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm h-[350px] animate-pulse">
            <div className="h-16 border-b border-gray-50 p-6 flex justify-between">
              <div className="w-48 h-6 bg-gray-100 rounded"></div>
              <div className="w-24 h-6 bg-gray-100 rounded"></div>
            </div>
            <div className="p-6 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-50 rounded-xl w-full"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      growth: stats?.revenueGrowth || 0,
      trend: (stats?.revenueGrowth || 0) >= 0 ? 'up' : 'down',
      action: () => {
        if (transactionsSectionRef.current) {
          transactionsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          transactionsControls.start({
            scale: [1, 1.02, 1],
            boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 10px 30px rgba(16, 185, 129, 0.2)", "0px 1px 2px 0px rgba(0, 0, 0, 0.05)"],
            transition: { duration: 0.8, ease: "easeInOut" }
          });
        }
      }
    },
    {
      title: 'Total Orders',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      growth: stats?.ordersGrowth || 0,
      trend: (stats?.ordersGrowth || 0) >= 0 ? 'up' : 'down',
      path: '/my-admin/orders'
    },
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      growth: stats?.usersGrowth || 0,
      trend: (stats?.usersGrowth || 0) >= 0 ? 'up' : 'down',
      action: () => {
        if (usersSectionRef.current) {
          usersSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          usersControls.start({
            scale: [1, 1.05, 1],
            boxShadow: ["0px 0px 0px rgba(0,0,0,0)", "0px 10px 30px rgba(124, 58, 237, 0.3)", "0px 1px 2px 0px rgba(0, 0, 0, 0.05)"],
            transition: { duration: 0.8, ease: "easeInOut" }
          });
        }
      }
    },
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      growth: 0,
      trend: 'neutral',
      path: '/my-admin/products'
    },
  ];

  return (
    <motion.div
      className="p-6 max-w-[1600px] mx-auto space-y-6 relative" // Added relative for modal positioning context if needed, though fixed is better
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Toast Notifications */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => hideToast(toast.id)}
        />
      ))}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <NotificationBell />
          <button
            onClick={() => navigate('/my-admin/settings')}
            className="p-2 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 rounded-full border border-gray-200 shadow-sm transition-all"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const isPositive = stat.trend === 'up';
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              onClick={() => stat.action ? stat.action() : (stat.path && navigate(stat.path))}
              className={`bg-white p-5 rounded-2xl border border-gray-100 shadow-[0_2px_10px_-4px_rgba(6,81,237,0.1)] hover:shadow-[0_8px_30px_-4px_rgba(6,81,237,0.1)] transition-shadow duration-300 ${(stat.path || stat.action) ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                {stat.trend !== 'neutral' && (
                  <div className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(stat.growth)}%
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{stat.title}</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{stat.value}</h3>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Revenue Area Chart */}
        {/* Revenue Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Revenue Analytics</h2>
              <p className="text-sm text-gray-500">Income trend over the last 7 days</p>
            </div>
            <div className="p-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
          </div>

          <div className="h-[300px] w-full">
            {stats?.salesChartData && stats.salesChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis
                    dataKey="_id"
                    tickFormatter={(str) => new Date(str).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    tickFormatter={(value) => `₹${value}`}
                  />
                  <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ stroke: '#6366f1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area
                    type="monotone"
                    dataKey="totalSales"
                    stroke="#6366f1"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <DollarSign className="w-12 h-12 mb-2 opacity-20" />
                <p>No revenue data available for this week</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Top Categories Bar Chart */}
        <motion.div variants={itemVariants} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Top Categories</h2>
            <p className="text-sm text-gray-500">Sales distribution</p>
          </div>
          <div className="h-[300px] w-full">
            {stats?.salesByCategory && stats.salesByCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={stats.salesByCategory} margin={{ top: 0, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="_id"
                    type="category"
                    width={80}
                    tick={{ fontSize: 12, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={<CustomTooltip prefix="₹" />}
                  />
                  <Bar dataKey="totalSales" radius={[0, 4, 4, 0]} barSize={24}>
                    {stats.salesByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <Package className="w-10 h-10 mb-2 opacity-20" />
                <p>No category data</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Row 1.5: Devices Stats (New) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm relative">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900">Device Usage</h2>
            <p className="text-sm text-gray-500">Active sessions by runtime</p>
          </div>
          <div className="h-[250px] w-full">
            {stats?.deviceStats && stats.deviceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.deviceStats.map(item => ({ name: item._id || 'Unknown', value: item.count }))}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    cornerRadius={6}
                    stroke="none"
                  >
                    {stats.deviceStats.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-lg">
                            <p className="text-xs text-gray-400 capitalize mb-1">{payload[0].name}</p>
                            <p className="font-bold text-gray-800 text-lg">
                              {payload[0].value}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <text x="50%" y="50%" dy={4} textAnchor="middle" fill="#374151" className="text-2xl font-bold">
                    {stats.deviceStats.reduce((sum, item) => sum + item.count, 0)}
                  </text>
                  <text x="50%" y="50%" dy={24} textAnchor="middle" fill="#9ca3af" className="text-xs font-medium uppercase tracking-wide">
                    Devices
                  </text>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <div className="flex gap-4 mb-4">
                  <Monitor className="w-8 h-8 opacity-50" />
                  <Smartphone className="w-8 h-8 opacity-50" />
                  <Tablet className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-sm">No device data available</p>
              </div>
            )}

            {stats?.deviceStats && stats.deviceStats.length > 0 && (
              <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-6 text-xs text-gray-500">
                {stats.deviceStats.map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="capitalize font-medium text-gray-700">{item._id || 'Unknown'}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Users List (Replaces 'Grow your business') */}
        <motion.div
          variants={itemVariants}
          ref={usersSectionRef}
          animate={usersControls}
          className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">New Members</h2>
              <p className="text-sm text-gray-500">Recently registered users</p>
            </div>
            <button
              onClick={() => navigate('/my-admin/users')}
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group cursor-pointer"
            >
              View All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
          <div className="overflow-x-auto flex-1 p-0">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                  stats.recentUsers.map((user: any) => (
                    <tr
                      key={user._id}
                      onClick={() => setSelectedUser(user)}
                      className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                      title="View User Details"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-xs">
                            {user.fullName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{user.fullName || 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${user.isActive ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right text-xs text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No recent users</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ... User Growth Line Chart ... */}

        {/* Recent Orders Table */}
        <motion.div
          variants={itemVariants}
          ref={transactionsSectionRef}
          animate={transactionsControls}
          className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-gray-50 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Recent Transactions</h2>
              <p className="text-sm text-gray-500">Latest orders from your store</p>
            </div>
            <button
              onClick={() => navigate('/my-admin/orders')}
              className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors group cursor-pointer"
            >
              View All <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50/50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Order ID</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                  stats.recentOrders.map((order: any) => (
                    <tr
                      key={order._id}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-xs text-gray-500">#{order._id.slice(-6).toUpperCase()}</span>
                        <div className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs ring-2 ring-white shadow-sm">
                            {order.user?.fullName?.charAt(0) || 'G'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700">{order.user?.fullName || 'Guest User'}</p>
                            <p className="text-xs text-gray-400">{order.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border
                                            ${order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              order.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5
                                                ${order.status === 'delivered' ? 'bg-emerald-500' :
                              order.status === 'processing' ? 'bg-blue-500' :
                                order.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500'}`}></span>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900">
                        ₹{order.totalAmount.toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                      No recent transactions found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Order Details Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setSelectedOrder(null)}
            />
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden pointer-events-auto flex flex-col">
                {/* Modal Header */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border
                            ${selectedOrder.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          selectedOrder.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            selectedOrder.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                        {selectedOrder.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 font-mono">ID: #{selectedOrder._id}</p>
                  </div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                  {/* Customer & Shipping Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <Users className="w-4 h-4" /> Customer Info
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                        <p className="text-sm font-medium text-gray-900">{selectedOrder.user?.fullName || 'Guest User'}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3.5 h-3.5" />
                          {selectedOrder.user?.email}
                        </div>
                        {selectedOrder.user?.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone className="w-3.5 h-3.5" />
                            {selectedOrder.user.phone}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <CreditCard className="w-4 h-4" /> Payment Info
                      </h3>
                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Method</span>
                          <span className="text-sm font-medium text-gray-900 uppercase">{selectedOrder.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Status</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${selectedOrder.paymentStatus === 'completed'
                            ? 'bg-green-100 text-green-700'
                            : selectedOrder.paymentStatus === 'failed'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {selectedOrder.paymentStatus?.toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 mt-2">
                          <span className="text-sm font-bold text-gray-900">Total</span>
                          <span className="text-lg font-bold text-primary">₹{selectedOrder.totalAmount.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {selectedOrder.shippingAddress && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Shipping Address
                      </h3>
                      <div className="text-sm text-gray-600 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <p>{selectedOrder.shippingAddress.street}</p>
                        <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.pincode}</p>
                        <p>{selectedOrder.shippingAddress.country}</p>
                      </div>
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4" /> Order Items
                    </h3>
                    <div className="border border-gray-100 rounded-xl overflow-hidden">
                      <table className="w-full text-left bg-white">
                        <thead className="bg-gray-50 border-b border-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase">Product</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-center">Qty</th>
                            <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase text-right">Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {selectedOrder.items?.map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                    ) : (
                                      <Package className="w-5 h-5 text-gray-400 m-auto mt-2.5" />
                                    )}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name}</p>
                                    {(item.size || item.color) && (
                                      <p className="text-xs text-gray-500">
                                        {item.size && `Size: ${item.size}`}
                                        {item.size && item.color && ' • '}
                                        {item.color && `Color: ${item.color}`}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                {item.quantity}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                  <button
                    onClick={() => navigate('/my-admin/orders')}
                    className="text-sm font-medium text-primary hover:text-primary/80 transition-colors mr-auto"
                  >
                    View Full Order History →
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* User Details Modal */}
      <AnimatePresence>
        {selectedUser && (
          <>
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={overlayVariants}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setSelectedUser(null)}
            />
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={modalVariants}
              className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none p-4"
            >
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                  <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                  <button onClick={() => setSelectedUser(null)} className="p-1 hover:bg-gray-200 rounded-full">
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center font-bold text-2xl mb-3">
                      {selectedUser.fullName?.charAt(0) || 'U'}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">{selectedUser.fullName || 'Unknown User'}</h3>
                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
                    <span className={`mt-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {selectedUser.role?.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Phone</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.phone || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Joined</p>
                        <p className="text-sm font-medium text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className={`w-2 h-2 rounded-full ${selectedUser.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">Account Status</p>
                        <p className="text-sm font-medium text-gray-900">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                  <button onClick={() => setSelectedUser(null)} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboardPage;
