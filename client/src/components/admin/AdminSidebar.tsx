import React from 'react';
import adminApi from '../../services/adminApi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Shield,
  Settings,
  LogOut,
  Layout,
  Menu,
  X,
  Lock,
  Truck,
  Newspaper,
  Bell,
  CreditCard,
  Tag,
  FolderTree,
  MessageCircle,
  Mail
} from 'lucide-react';

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const AdminSidebar = ({ isCollapsed, onToggle }: AdminSidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuthStore();
  const [unreadCount, setUnreadCount] = React.useState(0);

  // Fetch unread count logic (isolated here for sidebar badge)
  const fetchUnreadCount = async () => {
    try {
      const res = await adminApi.get('/admin/notifications/unread-count');
      setUnreadCount(res.data.count);
    } catch (err) {
      console.error('Sidebar notification fetch failed:', err);
    }
  };

  React.useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/my-admin/login');
  };

  // Filter menu items based on role/developer status
  const menuItems = [
    { path: '/my-admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/my-admin/sections', icon: Layout, label: 'Sections', developerOnly: true },
    { path: '/my-admin/blogs', icon: Newspaper, label: 'Blogs' },
    { path: '/my-admin/products', icon: Package, label: 'Products' },
    { path: '/my-admin/categories', icon: FolderTree, label: 'Categories' },
    { path: '/my-admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/my-admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/my-admin/customers', icon: Users, label: 'Customers' },
    { path: '/my-admin/messages', icon: Mail, label: 'contact msg' },
    { path: '/my-admin/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
    { path: '/my-admin/admins', icon: Shield, label: 'Staff' },
    { path: '/my-admin/devices', icon: Lock, label: 'Devices' },
    { path: '/my-admin/delivery', icon: Truck, label: 'Delivery' },
    { path: '/my-admin/shiprocket-delivery', icon: Package, label: 'Shiprocket Delivery' },
    { path: '/my-admin/coupons', icon: Tag, label: 'Coupons' },
    { path: '/my-admin/payment-settings', icon: CreditCard, label: 'Payments' },
    { path: '/my-admin/settings', icon: Settings, label: 'Settings' },
  ].filter(item => {
    if (item.developerOnly) {
      return admin?.role === 'developer';
    }
    if (item.label === 'Staff') {
      return admin?.role === 'super-admin' || admin?.role === 'developer';
    }
    return true;
  });

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col transition-all duration-300 z-40`}>
      {/* Logo */}
      <div className="p-6 border-b border-gray-100 relative">
        <div className="flex items-center justify-center mb-2">
          <img
            src="/logo.png"
            alt="Botam Apparels"
            className={`${isCollapsed ? 'h-8' : 'h-10'} w-auto transition-all duration-300 object-contain`}
          />
        </div>
        {!isCollapsed && <p className="text-xs text-gray-400 mt-1 text-center font-medium tracking-wide">ADMIN PANEL</p>}

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="absolute -right-3 top-8 bg-white border border-gray-200 text-gray-500 rounded-full p-1.5 hover:bg-gray-50 hover:text-black transition-colors z-50 shadow-sm"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <Menu className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-3 rounded-lg transition-all duration-200 group relative ${isActive
                ? 'bg-black text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50 hover:text-black'
                }`}
              title={isCollapsed ? item.label : ''}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-black'}`} />
                {/* Notification Badge for Collapsed State */}
                {item.label === 'Notifications' && unreadCount > 0 && isCollapsed && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center min-w-[16px] h-4 px-1 text-[10px] font-bold leading-none text-white transform bg-red-600 rounded-full animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>

              {!isCollapsed && <span className="font-medium text-sm">{item.label}</span>}

              {/* Notification Badge for Expanded State */}
              {item.label === 'Notifications' && unreadCount > 0 && !isCollapsed && (
                <span className="ml-auto inline-flex items-center justify-center px-2 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full animate-pulse">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Admin Info & Logout */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        {!isCollapsed && (
          <div className="mb-4 px-2">
            <p className="text-sm font-semibold text-gray-900 truncate">{admin?.email}</p>
            <p className="text-xs text-blue-600 font-medium capitalize flex items-center gap-1">
              <Shield className="w-3 h-3" />
              {admin?.role}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-4 py-2.5 text-gray-500 hover:bg-white hover:text-red-600 hover:shadow-sm hover:border-gray-200 border border-transparent rounded-lg transition-all duration-200`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
