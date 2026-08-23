import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { useAdminAuthStore } from '../../store/adminAuthStore';
import {
  Search,

  Plus,
  Trash2,
  Monitor,
  Smartphone,
  Tablet,
  CheckCircle,
  XCircle,
  Globe,
  Calendar,
  Activity,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';



interface Device {
  _id: string;
  deviceId: string;
  deviceName: string;
  deviceType: 'admin' | 'trusted';
  platform?: string;
  runtime?: 'browser' | 'desktop' | 'mobile';
  lastAccess?: string;
  ipAddress?: string;
  location?: string;
  riskLevel?: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  isBlacklisted: boolean;
  loginAttempts?: number;
  failedAttempts?: number;
  notes?: string;
  createdAt: string;
}

const AdminDevicesPage = () => {
  const { admin } = useAdminAuthStore();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Visual Highlight State
  const [activeHighlight, setActiveHighlight] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    deviceId: '',
    deviceName: '',
    deviceType: 'admin' as 'admin' | 'trusted',
    platform: '',
    notes: ''
  });

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 10;

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchDevices();
  }, [page, debouncedSearchTerm]);

  const fetchDevices = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', LIMIT.toString());
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);

      const response = await adminApi.get(`/admin/devices?${params.toString()}`);
      setDevices(response.data.data || []);
      if (response.data.pagination) {
        setTotalPages(response.data.pagination.pages);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch devices');
    } finally {
      setLoading(false);
    }
  };



  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.post(
        '/admin/devices',
        {
          deviceId: formData.deviceId,
          deviceName: formData.deviceName,
          deviceType: formData.deviceType,
          platform: formData.platform,
          notes: formData.notes
        }
      );

      setSuccess('Device added successfully');
      setTimeout(() => setSuccess(''), 3000);

      // Clear device fields
      setFormData(prev => ({
        ...prev,
        deviceId: '',
        deviceName: '',
        deviceType: 'admin',
        platform: '',
        notes: ''
      }));

      fetchDevices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add device');
      setTimeout(() => setError(''), 3000);
    }
  };

  const copyCurrentDeviceId = () => {
    const id = localStorage.getItem('admin_device_id');
    if (id) {
      setFormData(prev => ({ ...prev, deviceId: id }));
      setSuccess('Current Device ID copied to form');
      setTimeout(() => setSuccess(''), 2000);
    } else {
      setError('No device ID found in local storage');
    }
  };

  const toggleDeviceStatus = async (deviceId: string, currentStatus: boolean) => {
    try {
      await adminApi.put(
        `/admin/devices/${deviceId}`,
        { isActive: !currentStatus }
      );

      setSuccess(`Device ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      setTimeout(() => setSuccess(''), 3000);

      setDevices(devices.map(device =>
        device._id === deviceId ? { ...device, isActive: !currentStatus } : device
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update device');
      setTimeout(() => setError(''), 3000);
    }
  };

  const deleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      return;
    }

    try {
      await adminApi.delete(`/admin/devices/${deviceId}`);

      setSuccess('Device deleted successfully');
      setTimeout(() => setSuccess(''), 3000);

      setDevices(devices.filter(device => device._id !== deviceId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete device');
      setTimeout(() => setError(''), 3000);
    }
  };

  const getDeviceIcon = (runtime?: string) => {
    switch (runtime) {
      case 'desktop':
        return <Monitor className="w-5 h-5" />;
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      default:
        return <Tablet className="w-5 h-5" />;
    }
  };

  const getRiskBadge = (risk?: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[risk as keyof typeof colors] || colors.low;
  };

  // Client-side filtering removed in favor of backend search
  const filteredDevices = devices;

  const activeDevices = devices.filter(d => d.isActive).length; // Page only stats
  const adminDevices = devices.filter(d => d.deviceType === 'admin').length; // Page only stats

  if (loading) {
    return (
      <div className="p-8 space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex justify-between items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-gray-200 rounded"></div>
            <div className="h-4 w-48 bg-gray-100 rounded"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded-lg"></div>
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
                <div className="h-10 w-10 bg-gray-100 rounded-lg mr-3"></div>
                <div className="space-y-1 flex-1">
                  <div className="h-4 w-32 bg-gray-200 rounded"></div>
                  <div className="h-3 w-20 bg-gray-100 rounded"></div>
                </div>
              </div>
              <div className="w-1/6 mr-4 h-4 bg-gray-100 rounded"></div>
              <div className="w-20 mr-4 h-6 bg-gray-100 rounded-full"></div>
              <div className="w-1/6 mr-4 h-4 bg-gray-100 rounded"></div>
              <div className="w-1/6 mr-4 h-4 bg-gray-100 rounded"></div>
              <div className="w-16 mr-4 h-6 bg-gray-100 rounded-full"></div>
              <div className="w-20 mr-4 h-6 bg-gray-100 rounded-full"></div>
              <div className="flex gap-2">
                <div className="w-20 h-8 bg-gray-200 rounded"></div>
                <div className="w-8 h-8 bg-gray-200 rounded"></div>
              </div>
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
          <h1 className="text-3xl font-bold mb-2">Device Management</h1>
          <p className="text-gray-600">Manage authorized devices and access control</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Device
        </button>
      </div>

      {/* Stats with Visual Highlighting */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div
          onClick={() => setActiveHighlight('all')}
          className={`bg-white p-6 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'all' ? 'border-blue-500 ring-1 ring-blue-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-blue-200'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Devices</p>
              <p className="text-3xl font-bold">{devices.length}</p>
            </div>
            <Monitor className={`w-12 h-12 ${activeHighlight === 'all' ? 'text-blue-600' : 'text-blue-500'}`} />
          </div>
        </div>

        <div
          onClick={() => setActiveHighlight('active')}
          className={`bg-white p-6 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'active' ? 'border-green-500 ring-1 ring-green-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-green-200'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Active Devices</p>
              <p className="text-3xl font-bold text-green-600">{activeDevices}</p>
            </div>
            <CheckCircle className={`w-12 h-12 ${activeHighlight === 'active' ? 'text-green-600' : 'text-green-500'}`} />
          </div>
        </div>

        <div
          onClick={() => setActiveHighlight('admin')}
          className={`bg-white p-6 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'admin' ? 'border-purple-500 ring-1 ring-purple-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-purple-200'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Admin Devices</p>
              <p className="text-3xl font-bold text-purple-600">{adminDevices}</p>
            </div>
            <Activity className={`w-12 h-12 ${activeHighlight === 'admin' ? 'text-purple-600' : 'text-purple-500'}`} />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Add Device Form */}
      {showAddForm && (
        <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
          <div className="mb-4 border-b border-gray-100 pb-2 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-800">Register Authorized Device</h2>
            <button
              type="button"
              onClick={copyCurrentDeviceId}
              className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 transition-colors flex items-center gap-1"
            >
              <Monitor className="w-3 h-3" />
              Use My Current Device ID
            </button>
          </div>
          <form onSubmit={handleAddDevice}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1">Device ID *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black text-sm font-mono bg-gray-50"
                    placeholder="e.g., device_..."
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Unique identifier for the device browser. Click "Use My Current Device ID" to auto-fill.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Device Name *</label>
                <input
                  type="text"
                  required
                  value={formData.deviceName}
                  onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black text-sm"
                  placeholder="e.g., John's Laptop (Chrome)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Device Type *</label>
                <select
                  value={formData.deviceType}
                  onChange={(e) => setFormData({ ...formData, deviceType: e.target.value as 'admin' | 'trusted' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black text-sm"
                >
                  <option value="admin">Admin Device</option>
                  <option value="trusted">Trusted Device</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform</label>
                <input
                  type="text"
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black text-sm"
                  placeholder="e.g., Windows 10"
                />
              </div>
              <div className="lg:col-span-2">
                <label className="block text-sm font-medium mb-1">Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black text-sm"
                  placeholder="Additional context..."
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                Add Device
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search devices by name, ID, or platform..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
          />
        </div>
      </div>

      {/* Devices Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Device ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Access
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Risk
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
              {filteredDevices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    {searchTerm ? 'No devices found matching your search' : 'No devices yet'}
                  </td>
                </tr>
              ) : (
                filteredDevices.map((device) => {
                  const isHighlighted =
                    activeHighlight === 'all' ||
                    (activeHighlight === 'active' && device.isActive) ||
                    (activeHighlight === 'admin' && device.deviceType === 'admin');

                  return (
                    <tr
                      key={device._id}
                      className={`
                        transition-all duration-500 ease-in-out
                        ${isHighlighted
                          ? 'hover:bg-gray-50 opacity-100 transform scale-100'
                          : 'opacity-30 blur-[0.5px] scale-[0.98] grayscale'}
                        ${activeHighlight !== 'all' && isHighlighted ? 'bg-blue-50/30' : ''}
                      `}
                      style={{
                        boxShadow: activeHighlight !== 'all' && isHighlighted ? 'inset 3px 0 0 0 #3b82f6' : 'none'
                      }}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                            {getDeviceIcon(device.runtime)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{device.deviceName}</p>
                            <p className="text-sm text-gray-500">{device.platform || 'Unknown'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {device.deviceId.substring(0, 20)}...
                        </code>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700 text-sm">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {device.lastAccess
                            ? new Date(device.lastAccess).toLocaleDateString()
                            : 'Never'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-gray-700 text-sm">
                          <Globe className="w-4 h-4 mr-2 text-gray-400" />
                          {device.location || device.ipAddress || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getRiskBadge(device.riskLevel)}`}>
                          {device.riskLevel || 'low'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${device.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                          }`}>
                          {device.isActive ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {(admin?.role === 'super-admin' || admin?.role === 'developer') ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleDeviceStatus(device._id, device.isActive)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${device.isActive
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                            >
                              {device.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteDevice(device._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                              title="Delete device"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Read-only</span>
                        )}
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
    </div>
  );
};

export default AdminDevicesPage;
