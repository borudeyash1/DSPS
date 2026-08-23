import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { Search, UserCheck, UserX, Mail, Calendar, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';


interface User {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
  orderCount?: number;
}

const AdminCustomersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { toasts, showToast, hideToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Visual Highlight State
  const [activeHighlight, setActiveHighlight] = useState<string>('all');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', LIMIT.toString());
      if (searchTerm) params.append('search', searchTerm);

      const response = await adminApi.get(`/admin/customers?${params.toString()}`);
      setUsers(response.data.data || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await adminApi.patch(`/admin/users/${userId}/toggle-status`, {});

      showToast(`User ${currentStatus ? 'deactivated' : 'activated'} successfully`, 'success');
      
      // Update local state
      setUsers(users.map(user =>
        user._id === userId ? { ...user, isActive: !currentStatus } : user
      ));
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Failed to update user status', 'error');
    }
  };

  const displayUsers = users;

  const activeUsers = users.filter(u => u.isActive).length; // This will only be for current page
  const inactiveUsers = users.filter(u => !u.isActive).length; // This will only be for current page

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded"></div>
          <div className="h-4 w-48 bg-gray-100 rounded"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 flex justify-between items-center">
              <div className="space-y-2">
                <div className="h-3 w-24 bg-gray-100 rounded"></div>
                <div className="h-8 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-12 w-12 bg-gray-100 rounded-lg"></div>
            </div>
          ))}
        </div>

        {/* Search Skeleton */}
        <div className="h-12 w-full bg-white border border-gray-200 rounded-lg"></div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="h-12 bg-gray-50 border-b border-gray-200"></div>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center px-6 py-4 border-b border-gray-100">
              <div className="flex items-center w-1/5 mr-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full mr-3"></div>
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="w-1/5 mr-4 h-4 bg-gray-100 rounded"></div>
              <div className="w-1/6 mr-4 h-4 bg-gray-100 rounded"></div>
              <div className="w-1/6 mr-4 h-4 bg-gray-100 rounded"></div>
              <div className="w-1/6 mr-4 h-4 bg-gray-100 rounded"></div>
              <div className="w-24 h-6 bg-gray-200 rounded-full mr-4"></div>
              <div className="w-24 h-9 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage customer accounts and permissions</p>
        </div>
      </div>

      {/* Stats with Visual Highlighting */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          onClick={() => setActiveHighlight('all')}
          className={`bg-white p-6 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'all' ? 'border-blue-500 ring-1 ring-blue-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-blue-200'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Customers</p>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
            <Shield className={`w-12 h-12 ${activeHighlight === 'all' ? 'text-blue-600' : 'text-blue-500'}`} />
          </div>
        </div>

        <div
          onClick={() => setActiveHighlight('active')}
          className={`bg-white p-6 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'active' ? 'border-green-500 ring-1 ring-green-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-green-200'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Customers</p>
              <p className="text-3xl font-bold text-green-600">{activeUsers}</p>
            </div>
            <UserCheck className={`w-12 h-12 ${activeHighlight === 'active' ? 'text-green-600' : 'text-green-500'}`} />
          </div>
        </div>

        <div
          onClick={() => setActiveHighlight('inactive')}
          className={`bg-white p-6 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'inactive' ? 'border-red-500 ring-1 ring-red-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-red-200'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Inactive Customers</p>
              <p className="text-3xl font-bold text-red-600">{inactiveUsers}</p>
            </div>
            <UserX className={`w-12 h-12 ${activeHighlight === 'inactive' ? 'text-red-600' : 'text-red-500'}`} />
          </div>
        </div>
      </div>

      {/* Alerts */}


      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search customers by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No customers found matching your search' : 'No customers yet'}
                  </td>
                </tr>
              ) : (
                displayUsers.map((user) => {
                  const isHighlighted =
                    activeHighlight === 'all' ||
                    (activeHighlight === 'active' && user.isActive) ||
                    (activeHighlight === 'inactive' && !user.isActive);

                  return (
                    <tr
                      key={user._id}
                      className={`
                        transition-all duration-500 ease-in-out
                        ${isHighlighted
                          ? 'hover:bg-gray-50 opacity-100 transform scale-100'
                          : 'opacity-30 blur-[0.5px] scale-[0.98] grayscale'}
                        ${activeHighlight !== 'all' && ((activeHighlight === 'active' && user.isActive) || (activeHighlight === 'inactive' && !user.isActive)) ? 'bg-blue-50/30' : ''}
                      `}
                      style={{
                        boxShadow: activeHighlight !== 'all' && isHighlighted ? 'inset 3px 0 0 0 #3b82f6' : 'none'
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-medium text-gray-600">
                              {user.fullName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.fullName}</p>
                            {user.orderCount !== undefined && (
                              <p className="text-sm text-gray-500">{user.orderCount} orders</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700">
                          <Mail className="w-4 h-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {user.phone || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-700">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Never'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {user.isActive ? (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <UserX className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => toggleUserStatus(user._id, user.isActive)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${user.isActive
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
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

export default AdminCustomersPage;
