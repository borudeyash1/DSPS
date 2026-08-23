import { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { Search, UserCheck, UserX, Mail, Calendar, Shield, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';


interface AdminUser {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    role: 'super-admin' | 'admin' | 'developer';
    isActive: boolean;
    createdAt: string;
    lastLogin?: string;
}

const AdminManagementPage = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddForm, setShowAddForm] = useState(false);

    // New Admin Form State
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fullName: '',
        phone: '',
        role: 'admin' as 'admin' | 'super-admin'
    });

    // Visual Highlight State
    const [activeHighlight, setActiveHighlight] = useState<string>('all');

    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const LIMIT = 10;

    useEffect(() => {
        fetchAdmins();
    }, [page, searchTerm]);

    const fetchAdmins = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', page.toString());
            params.append('limit', LIMIT.toString());
            if (searchTerm) params.append('search', searchTerm);

            const response = await adminApi.get(`/admin/admins?${params.toString()}`);
            setAdmins(response.data.data || []);
            if (response.data.pagination) {
                setTotalPages(response.data.pagination.pages);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch admins');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await adminApi.post('/admin/register', formData);

            setSuccess('Admin created successfully');
            setTimeout(() => setSuccess(''), 3000);

            setShowAddForm(false);
            setFormData({
                email: '',
                password: '',
                fullName: '',
                phone: '',
                role: 'admin'
            });
            fetchAdmins();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create admin');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await adminApi.patch(`/admin/admins/${id}/toggle-status`, {});
            setSuccess('Admin status updated successfully');
            setTimeout(() => setSuccess(''), 3000);
            fetchAdmins();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update admin status');
            setTimeout(() => setError(''), 3000);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this admin? This action cannot be undone.')) {
            return;
        }

        try {
            await adminApi.delete(`/admin/admins/${id}`);
            setSuccess('Admin deleted successfully');
            setTimeout(() => setSuccess(''), 3000);
            fetchAdmins();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete admin');
            setTimeout(() => setError(''), 3000);
        }
    };

    const superAdminsCount = admins.filter(a => a.role === 'super-admin').length;
    const regularAdminsCount = admins.filter(a => a.role === 'admin').length;

    if (loading) {
        return (
            <div className="p-8 space-y-8 animate-pulse">
                <div className="space-y-2">
                    <div className="h-8 w-64 bg-gray-200 rounded"></div>
                    <div className="h-4 w-48 bg-gray-100 rounded"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                    ))}
                </div>
                <div className="h-96 bg-gray-200 rounded-lg"></div>
            </div>
        );
    }

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Admin Management</h1>
                    <p className="text-gray-600">Manage internal staff and access roles</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Create Admin
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
                            <p className="text-sm text-gray-600 mb-1">Total Staff</p>
                            <p className="text-3xl font-bold">{admins.length}</p>
                        </div>
                        <Shield className={`w-12 h-12 ${activeHighlight === 'all' ? 'text-blue-600' : 'text-blue-500'}`} />
                    </div>
                </div>

                <div
                    onClick={() => setActiveHighlight('super-admin')}
                    className={`bg-white p-6 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'super-admin' ? 'border-purple-500 ring-1 ring-purple-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-purple-200'}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Super Admins</p>
                            <p className="text-3xl font-bold text-purple-600">{superAdminsCount}</p>
                        </div>
                        <Shield className={`w-12 h-12 ${activeHighlight === 'super-admin' ? 'text-purple-600' : 'text-purple-500'}`} />
                    </div>
                </div>

                <div
                    onClick={() => setActiveHighlight('admin')}
                    className={`bg-white p-6 rounded-lg border cursor-pointer transition-all duration-300 ${activeHighlight === 'admin' ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md transform scale-[1.02]' : 'border-gray-200 hover:border-indigo-200'}`}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 mb-1">Admins</p>
                            <p className="text-3xl font-bold text-indigo-600">{regularAdminsCount}</p>
                        </div>
                        <UserCheck className={`w-12 h-12 ${activeHighlight === 'admin' ? 'text-indigo-600' : 'text-indigo-500'}`} />
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

            {/* Add Admin Form */}
            {showAddForm && (
                <div className="mb-8 bg-white p-6 rounded-lg border border-gray-200">
                    <h2 className="text-xl font-bold mb-4">Create New Admin User</h2>
                    <form onSubmit={handleCreateAdmin}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black text-sm"
                                    placeholder="John Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email (Login ID)</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black text-sm"
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black text-sm"
                                    placeholder="******"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="text"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black text-sm"
                                    placeholder="+91..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-black focus:border-black text-sm"
                                >
                                    <option value="admin">Admin</option>
                                    <option value="super-admin">Super Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                type="submit"
                                className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
                            >
                                Create Admin
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
                        placeholder="Search admins by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                </div>
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Admin
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
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
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {admins.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        {searchTerm ? 'No admins found matching your search' : 'No admins yet'}
                                    </td>
                                </tr>
                            ) : (
                                admins.map((admin) => {
                                    const isHighlighted =
                                        activeHighlight === 'all' ||
                                        (activeHighlight === 'super-admin' && admin.role === 'super-admin') ||
                                        (activeHighlight === 'admin' && admin.role === 'admin');

                                    return (
                                        <tr
                                            key={admin._id}
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
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                        <span className="text-sm font-medium text-gray-600">
                                                            {admin.fullName ? admin.fullName.charAt(0).toUpperCase() : '?'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{admin.fullName || 'Unknown'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-gray-700">
                                                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                    {admin.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${admin.role === 'super-admin'
                                                    ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                                    : admin.role === 'developer'
                                                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                                                        : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                                                    }`}>
                                                    {admin.role === 'super-admin' && <Shield className="w-3 h-3 mr-1" />}
                                                    {admin.role.charAt(0).toUpperCase() + admin.role.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {admin.phone || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center text-gray-700">
                                                    <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                                    {new Date(admin.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-700">
                                                {admin.lastLogin
                                                    ? new Date(admin.lastLogin).toLocaleDateString()
                                                    : 'Never'
                                                }
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${admin.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {admin.isActive ? (
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
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end space-x-2">
                                                    <button
                                                        onClick={() => handleToggleStatus(admin._id)}
                                                        className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${admin.isActive ? 'text-orange-500' : 'text-green-500'}`}
                                                        title={admin.isActive ? "Deactivate" : "Activate"}
                                                    >
                                                        {admin.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(admin._id)}
                                                        className="p-2 rounded-full hover:bg-gray-100 text-red-600 transition-colors"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
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
            {
                totalPages > 1 && (
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
                )
            }
        </div >
    );
};

export default AdminManagementPage;
