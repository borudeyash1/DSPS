import React, { useState } from 'react';
import { X, Save } from 'lucide-react';
import axios from 'axios';

interface UpdateAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    order: {
        id: number;
        shiprocket_order_id?: number;
        customer_name: string;
        customer_phone: string;
        customer_email: string;
        customer_address: string;
        customer_address_2?: string;
        customer_city: string;
        customer_state: string;
        customer_pincode: string;
        customer_country: string;
    };
    onSuccess: () => void;
}

const UpdateAddressModal: React.FC<UpdateAddressModalProps> = ({ isOpen, onClose, order, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shipping_customer_name: order.customer_name,
        shipping_phone: order.customer_phone,
        shipping_email: order.customer_email || '',
        shipping_address: order.customer_address,
        shipping_address_2: order.customer_address_2 || '',
        shipping_city: order.customer_city,
        shipping_state: order.customer_state,
        shipping_pincode: order.customer_pincode,
        shipping_country: order.customer_country,
        billing_alternate_phone: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!order.shiprocket_order_id) {
            alert('Shiprocket Order ID not found');
            return;
        }

        try {
            setLoading(true);
            
            await axios.post(
                `${import.meta.env.VITE_API_URL}/shiprocket/update-address`,
                {
                    order_id: order.shiprocket_order_id,
                    ...formData
                },
                { withCredentials: true }
            );

            alert('Delivery address updated successfully!');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Failed to update address:', error);
            alert(error.response?.data?.message || 'Failed to update address');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">Update Delivery Address</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Customer Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Customer Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="shipping_customer_name"
                                value={formData.shipping_customer_name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* Phone & Email */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    name="shipping_phone"
                                    value={formData.shipping_phone}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{10}"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="shipping_email"
                                    value={formData.shipping_email}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        {/* Address Line 1 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 1 <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="shipping_address"
                                value={formData.shipping_address}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* Address Line 2 */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address Line 2
                            </label>
                            <input
                                type="text"
                                name="shipping_address_2"
                                value={formData.shipping_address_2}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* City, State, Pincode */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    City <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="shipping_city"
                                    value={formData.shipping_city}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    State <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="shipping_state"
                                    value={formData.shipping_state}
                                    onChange={handleChange}
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Pincode <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="shipping_pincode"
                                    value={formData.shipping_pincode}
                                    onChange={handleChange}
                                    required
                                    pattern="[0-9]{6}"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                        </div>

                        {/* Country */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Country <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="shipping_country"
                                value={formData.shipping_country}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>

                        {/* Alternate Phone */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Alternate Phone
                            </label>
                            <input
                                type="tel"
                                name="billing_alternate_phone"
                                value={formData.billing_alternate_phone}
                                onChange={handleChange}
                                pattern="[0-9]{10}"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 flex items-center justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Updating...' : 'Update Address'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateAddressModal;
