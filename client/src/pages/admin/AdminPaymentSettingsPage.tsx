import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { CreditCard, DollarSign, Settings, Save } from 'lucide-react';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

const AdminPaymentSettingsPage: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const { toasts, showToast, hideToast } = useToast();

    // Form state
    const [codEnabled, setCodEnabled] = useState(true);
    const [codMinimumAmount, setCodMinimumAmount] = useState(0);
    const [hdfcEnabled, setHdfcEnabled] = useState(false);
    const [acceptedMethods, setAcceptedMethods] = useState<string[]>([]);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await adminApi.get('/admin/payment-settings');

            const data = response.data.data;
            setCodEnabled(data.codEnabled);
            setCodMinimumAmount(data.codMinimumAmount);
            setHdfcEnabled(data.hdfcEnabled);
            setAcceptedMethods(data.acceptedPaymentMethods);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            showToast('Failed to load payment settings', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            const payload: any = {
                codEnabled,
                codMinimumAmount,
                hdfcEnabled,
                acceptedPaymentMethods: acceptedMethods
            };

            await adminApi.put('/admin/payment-settings', payload);

            showToast('Payment settings updated successfully', 'success');
            fetchSettings(); // Refresh
        } catch (error: any) {
            console.error('Failed to save settings:', error);
            showToast(error.response?.data?.message || 'Failed to save settings', 'error');
        } finally {
            setSaving(false);
        }
    };



    const togglePaymentMethod = (method: string) => {
        if (acceptedMethods.includes(method)) {
            setAcceptedMethods(acceptedMethods.filter(m => m !== method));
        } else {
            setAcceptedMethods([...acceptedMethods, method]);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading payment settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 max-w-4xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Settings</h1>
                <p className="text-gray-500">Configure payment methods and thresholds</p>
            </div>

            {/* Message */}


            <div className="space-y-6">
                {/* Cash on Delivery Settings */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <DollarSign className="w-6 h-6 text-green-600" />
                        <h2 className="text-xl font-semibold">Cash on Delivery (COD)</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Enable COD</p>
                                <p className="text-sm text-gray-500">Allow customers to pay on delivery</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={codEnabled}
                                    onChange={(e) => setCodEnabled(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                            </label>
                        </div>

                        <div>
                            <label className="block font-medium mb-2">
                                Minimum Order Amount for COD (₹)
                            </label>
                            <input
                                type="number"
                                value={codMinimumAmount}
                                onChange={(e) => setCodMinimumAmount(Number(e.target.value))}
                                min="0"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                                placeholder="0"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                Set to 0 to allow COD for all orders. Orders below this amount won't have COD option.
                            </p>
                        </div>
                    </div>
                </div>

                {/* HDFC SmartGateway Settings */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <CreditCard className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-semibold">HDFC SmartGateway Integration</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="font-medium">Enable HDFC SmartGateway</p>
                                <p className="text-sm text-gray-500">Accept online payments via HDFC SmartGateway</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={hdfcEnabled}
                                    onChange={(e) => setHdfcEnabled(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-black/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black"></div>
                            </label>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mt-4">
                            <p className="text-sm text-blue-800">
                                <strong>🔐 Security Note:</strong> HDFC API keys and JWE credentials are configured in the server environment variables (.env file) for security. Only developers with VPS access can modify them.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Accepted Payment Methods */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Settings className="w-6 h-6 text-purple-600" />
                        <h2 className="text-xl font-semibold">Accepted Payment Methods</h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {['upi', 'card', 'netbanking', 'wallet', 'cod'].map((method) => (
                            <label
                                key={method}
                                className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${acceptedMethods.includes(method)
                                    ? 'border-black bg-black/5'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={acceptedMethods.includes(method)}
                                    onChange={() => togglePaymentMethod(method)}
                                    className="w-4 h-4"
                                />
                                <span className="font-medium capitalize">{method}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Save size={20} />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
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

export default AdminPaymentSettingsPage;
