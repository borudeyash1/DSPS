import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { Plus, Trash2, Tag, Calendar, X } from 'lucide-react';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

interface Coupon {
    _id: string;
    code: string;
    type: 'fixed' | 'percentage';
    value: number;
    minOrderAmount: number;
    maxDiscountAmount?: number;
    expirationDate?: string;
    usageLimit?: number;
    usedCount: number;
    isActive: boolean;
}

const AdminCouponsPage: React.FC = () => {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const { toasts, showToast, hideToast } = useToast();

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        type: 'fixed',
        value: '',
        minOrderAmount: '',
        maxDiscountAmount: '',
        expirationDate: '',
        usageLimit: ''
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const response = await adminApi.get('/coupons');
            setCoupons(response.data.data || response.data); // Handle potential response structure diffs
        } catch (error) {
            console.error('Error fetching coupons:', error);
            showToast('Failed to fetch coupons', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this coupon?')) return;
        try {
            await adminApi.delete(`/coupons/${id}`);
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            showToast('Failed to delete coupon', 'error');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                ...formData,
                value: Number(formData.value),
                minOrderAmount: Number(formData.minOrderAmount) || 0,
                maxDiscountAmount: Number(formData.maxDiscountAmount) || undefined,
                usageLimit: Number(formData.usageLimit) || undefined,
                expirationDate: formData.expirationDate || undefined
            };

            await adminApi.post('/coupons', payload);

            setShowModal(false);
            setFormData({
                code: '',
                type: 'fixed',
                value: '',
                minOrderAmount: '',
                maxDiscountAmount: '',
                expirationDate: '',
                usageLimit: ''
            });
            fetchCoupons();
            showToast('Coupon created successfully!', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.message || 'Failed to create coupon', 'error');
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading coupons...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
                    <p className="text-gray-500">Manage discount codes</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <Plus size={20} />
                    Create Coupon
                </button>
            </div>

            {coupons.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No coupons active</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {coupons.map(coupon => (
                        <div key={coupon._id} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm relative group hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-lg font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                    {coupon.code}
                                </span>
                                <button
                                    onClick={() => handleDelete(coupon._id)}
                                    className="text-gray-400 hover:text-red-500 transition-colors bg-white p-1 rounded hover:bg-red-50"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="space-y-1 text-sm text-gray-600 mb-3">
                                <p className="font-semibold text-gray-900">
                                    {coupon.type === 'fixed' ? `₹${coupon.value} OFF` : `${coupon.value}% OFF`}
                                </p>
                                {coupon.minOrderAmount > 0 && (
                                    <p>Min Order: ₹{coupon.minOrderAmount}</p>
                                )}
                                {coupon.maxDiscountAmount && (
                                    <p>Max Discount: ₹{coupon.maxDiscountAmount}</p>
                                )}
                                {coupon.expirationDate && (
                                    <p className="flex items-center gap-1 text-orange-600">
                                        <Calendar size={12} />
                                        Exp: {new Date(coupon.expirationDate).toLocaleDateString()}
                                    </p>
                                )}
                            </div>

                            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs text-gray-400">
                                <span>Used: {coupon.usedCount} times</span>
                                <span className={`w-2 h-2 rounded-full ${coupon.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Create New Coupon</h3>
                            <button onClick={() => setShowModal(false)}><X size={20} /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    className="w-full border rounded p-2 font-mono uppercase"
                                    placeholder="SALE2024"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full border rounded p-2"
                                    >
                                        <option value="fixed">Fixed Amount (₹)</option>
                                        <option value="percentage">Percentage (%)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Value</label>
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.value}
                                        onChange={e => setFormData({ ...formData, value: e.target.value })}
                                        className="w-full border rounded p-2"
                                        placeholder={formData.type === 'fixed' ? '100' : '15'}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Min Order (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.minOrderAmount}
                                        onChange={e => setFormData({ ...formData, minOrderAmount: e.target.value })}
                                        className="w-full border rounded p-2"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Max Discount (₹)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        disabled={formData.type === 'fixed'}
                                        value={formData.maxDiscountAmount}
                                        onChange={e => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                                        className="w-full border rounded p-2 disabled:bg-gray-100"
                                        placeholder="Optional"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Expiration Date</label>
                                <input
                                    type="date"
                                    value={formData.expirationDate}
                                    onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                                    className="w-full border rounded p-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-1">Usage Limit</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={formData.usageLimit}
                                    onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                                    className="w-full border rounded p-2"
                                    placeholder="Unlimited"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 font-medium mt-2"
                            >
                                Create Coupon
                            </button>
                        </form>
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

export default AdminCouponsPage;
