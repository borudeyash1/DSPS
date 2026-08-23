import React, { useState } from 'react';
import { X, Save, Plus, Minus, Info } from 'lucide-react';
import axios from 'axios';

interface AddOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

interface OrderProduct {
    name: string;
    sku: string;
    units: number;
    selling_price: number;
    discount: number;
    tax: number;
    hsn: number;
}

const AddOrderModal: React.FC<AddOrderModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    
    // Delivery Details
    const [mobileNumber, setMobileNumber] = useState('');
    const [fullName, setFullName] = useState('');
    const [completeAddress, setCompleteAddress] = useState('');
    const [landmark, setLandmark] = useState('');
    const [pincode, setPincode] = useState('');
    const [city, setCity] = useState('');
    const [state, setState] = useState('');

    // Products
    const [products, setProducts] = useState<OrderProduct[]>([
        {
            name: '',
            sku: '',
            units: 1,
            selling_price: 0,
            discount: 0,
            tax: 0,
            hsn: 6109
        }
    ]);

    // Package Details
    const [deadWeight, setDeadWeight] = useState(0.5);
    const [length, setLength] = useState(1);
    const [breadth, setBreadth] = useState(1);
    const [height, setHeight] = useState(1);

    // Payment Method
    const [paymentMethod, setPaymentMethod] = useState<'COD' | 'Prepaid'>('COD');

    // Other Details
    const [orderTag, setOrderTag] = useState('');
    const [notes, setNotes] = useState('');

    // Calculations
    const subTotal = products.reduce((sum, p) => sum + (p.units * p.selling_price), 0);
    const totalDiscount = products.reduce((sum, p) => sum + (p.discount * p.units), 0);
    const totalOrderValue = subTotal - totalDiscount;
    const volumetricWeight = (length * breadth * height) / 5000;
    const applicableWeight = Math.max(deadWeight, volumetricWeight);

    const handleProductChange = (index: number, field: keyof OrderProduct, value: string | number) => {
        const updatedProducts = [...products];
        updatedProducts[index] = {
            ...updatedProducts[index],
            [field]: value
        };
        setProducts(updatedProducts);
    };

    const addProduct = () => {
        setProducts([
            ...products,
            {
                name: '',
                sku: '',
                units: 1,
                selling_price: 0,
                discount: 0,
                tax: 0,
                hsn: 6109
            }
        ]);
    };

    const removeProduct = (index: number) => {
        if (products.length > 1) {
            setProducts(products.filter((_, i) => i !== index));
        }
    };

    const incrementQuantity = (index: number) => {
        handleProductChange(index, 'units', products[index].units + 1);
    };

    const decrementQuantity = (index: number) => {
        if (products[index].units > 1) {
            handleProductChange(index, 'units', products[index].units - 1);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            setLoading(true);

            // Generate unique order ID
            const orderId = `ORD-${Date.now()}`;

            const orderPayload = {
                order_id: orderId,
                order_date: new Date().toISOString().split('T')[0],
                pickup_location: 'Primary',
                channel_id: 'CUSTOM',
                comment: notes,
                billing_customer_name: fullName.split(' ')[0] || fullName,
                billing_last_name: fullName.split(' ').slice(1).join(' ') || '',
                billing_address: completeAddress,
                billing_address_2: landmark,
                billing_city: city,
                billing_pincode: parseInt(pincode),
                billing_state: state,
                billing_country: 'India',
                billing_email: '',
                billing_phone: mobileNumber,
                shipping_is_billing: true,
                order_items: products.map(p => ({
                    name: p.name,
                    sku: p.sku || `SKU-${p.name.substring(0, 10)}`,
                    units: parseInt(p.units.toString()),
                    selling_price: parseFloat(p.selling_price.toString()),
                    discount: parseFloat(p.discount.toString()) || 0,
                    tax: parseFloat(p.tax.toString()) || 0,
                    hsn: parseInt(p.hsn.toString())
                })),
                payment_method: paymentMethod,
                shipping_charges: 0,
                giftwrap_charges: 0,
                transaction_charges: 0,
                total_discount: totalDiscount,
                sub_total: subTotal,
                length: parseFloat(length.toString()),
                breadth: parseFloat(breadth.toString()),
                height: parseFloat(height.toString()),
                weight: parseFloat(deadWeight.toString())
            };

            await axios.post(
                `${import.meta.env.VITE_API_URL}/shiprocket/create-shipment`,
                orderPayload,
                { withCredentials: true }
            );

            alert('Order created successfully in Shiprocket!');
            onSuccess();
            onClose();
            resetForm();
        } catch (error: any) {
            console.error('Failed to create order:', error);
            alert(error.response?.data?.message || 'Failed to create order');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setMobileNumber('');
        setFullName('');
        setCompleteAddress('');
        setLandmark('');
        setPincode('');
        setCity('');
        setState('');
        setProducts([{
            name: '',
            sku: '',
            units: 1,
            selling_price: 0,
            discount: 0,
            tax: 0,
            hsn: 6109
        }]);
        setDeadWeight(0.5);
        setLength(1);
        setBreadth(1);
        setHeight(1);
        setPaymentMethod('COD');
        setOrderTag('');
        setNotes('');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Add Order</h2>
                        <p className="text-sm text-gray-500">Domestic Order - Single Order</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Pickup Address */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Pickup Address</h3>
                        <p className="text-sm text-gray-700">
                            <span className="font-medium">Primary</span> | Shop No.210 Karan Court Building Near Old court Lane Ahmed Nagar Maharashtra-414001
                        </p>
                        <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded">✓ Verified</span>
                    </div>

                    {/* Delivery Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Delivery Details</h3>
                        <p className="text-sm text-gray-600 mb-4">Enter the Delivery Details of your buyer for whom you are making this order</p>
                        
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mobile Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 rounded-l-lg">
                                            +91
                                        </span>
                                        <input
                                            type="tel"
                                            value={mobileNumber}
                                            onChange={(e) => setMobileNumber(e.target.value)}
                                            required
                                            pattern="[0-9]{10}"
                                            placeholder="Enter mobile number"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        required
                                        placeholder="Enter Full Name"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Complete Address <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={completeAddress}
                                    onChange={(e) => setCompleteAddress(e.target.value)}
                                    required
                                    placeholder="Enter Buyer's full address"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Landmark (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={landmark}
                                    onChange={(e) => setLandmark(e.target.value)}
                                    placeholder="Enter any nearby landmark"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Pincode <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={pincode}
                                        onChange={(e) => setPincode(e.target.value)}
                                        required
                                        pattern="[0-9]{6}"
                                        placeholder="Enter pincode"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        City <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={city}
                                        onChange={(e) => setCity(e.target.value)}
                                        required
                                        placeholder="City"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        State <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={state}
                                        onChange={(e) => setState(e.target.value)}
                                        required
                                        placeholder="State"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Details</h3>
                        <div className="space-y-4">
                            {products.map((product, index) => (
                                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                                        <div className="md:col-span-3">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Product Name <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={product.name}
                                                onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                                required
                                                placeholder="Enter or search your product name"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Unit Price <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                                    ₹
                                                </span>
                                                <input
                                                    type="number"
                                                    value={product.selling_price}
                                                    onChange={(e) => handleProductChange(index, 'selling_price', parseFloat(e.target.value))}
                                                    required
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Quantity <span className="text-red-500">*</span>
                                            </label>
                                            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                                <button
                                                    type="button"
                                                    onClick={() => decrementQuantity(index)}
                                                    className="px-2 py-2 hover:bg-gray-100 text-gray-600 border-r border-gray-300"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <input
                                                    type="number"
                                                    value={product.units}
                                                    onChange={(e) => handleProductChange(index, 'units', parseInt(e.target.value))}
                                                    required
                                                    min="1"
                                                    className="flex-1 text-center border-0 focus:ring-0 text-sm py-2"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => incrementQuantity(index)}
                                                    className="px-2 py-2 hover:bg-gray-100 text-gray-600 border-l border-gray-300"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                Discount (Optional)
                                                <Info className="w-3 h-3 text-gray-400" />
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                                    ₹
                                                </span>
                                                <input
                                                    type="number"
                                                    value={product.discount}
                                                    onChange={(e) => handleProductChange(index, 'discount', parseFloat(e.target.value))}
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium text-gray-700 mb-1">
                                                Tax % (Optional)
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    value={product.tax}
                                                    onChange={(e) => handleProductChange(index, 'tax', parseFloat(e.target.value))}
                                                    min="0"
                                                    step="0.01"
                                                    placeholder="0.00"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-sm"
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                                    %
                                                </span>
                                            </div>
                                        </div>
                                        <div className="md:col-span-1 flex items-end justify-center">
                                            {products.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeProduct(index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Remove Product"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addProduct}
                                className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Another Product
                            </button>
                        </div>

                        {/* Order Summary */}
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Sub-total for Product</span>
                                <span className="font-semibold">₹ {subTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-gray-600">Other Charges</span>
                                <span className="font-semibold">₹ 0</span>
                            </div>
                            <div className="flex justify-between text-base font-bold border-t border-gray-300 pt-2">
                                <span>Total Order Value</span>
                                <span className="text-orange-600">₹ {totalOrderValue.toFixed(2)}</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Note: All the Prices/ Charges are inclusive of GST.</p>
                        </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Method</h3>
                        <p className="text-sm text-gray-600 mb-3">Select the payment mode, chosen by the buyer for this order.</p>
                        <div className="flex gap-4">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="COD"
                                    checked={paymentMethod === 'COD'}
                                    onChange={(e) => setPaymentMethod(e.target.value as 'COD' | 'Prepaid')}
                                    className="mr-2"
                                />
                                <span className="text-sm">Cash on Delivery (COD)</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="Prepaid"
                                    checked={paymentMethod === 'Prepaid'}
                                    onChange={(e) => setPaymentMethod(e.target.value as 'COD' | 'Prepaid')}
                                    className="mr-2"
                                />
                                <span className="text-sm">Prepaid</span>
                            </label>
                        </div>
                    </div>

                    {/* Package Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Package Details</h3>
                        <p className="text-sm text-gray-600 mb-3">Provide the details of the final package that includes all the ordered items packed together.</p>
                        <p className="text-xs text-blue-600 mb-4">💡 Tip: Add correct values to avoid weight discrepancy</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dead Weight <span className="text-gray-500 text-xs">(Physical weight of a package)</span>
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        value={deadWeight}
                                        onChange={(e) => setDeadWeight(parseFloat(e.target.value))}
                                        required
                                        min="0.5"
                                        step="0.1"
                                        className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    />
                                    <span className="text-gray-600">kg</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Note: Minimum chargeable wt is 0.5 kg</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Package Dimensions <span className="text-gray-500 text-xs">(LxBxH of the complete package)</span>
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <div>
                                        <input
                                            type="number"
                                            value={length}
                                            onChange={(e) => setLength(parseFloat(e.target.value))}
                                            required
                                            min="0.5"
                                            step="0.1"
                                            placeholder="Length"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                        <span className="text-xs text-gray-500">cm</span>
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            value={breadth}
                                            onChange={(e) => setBreadth(parseFloat(e.target.value))}
                                            required
                                            min="0.5"
                                            step="0.1"
                                            placeholder="Breadth"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                        <span className="text-xs text-gray-500">cm</span>
                                    </div>
                                    <div>
                                        <input
                                            type="number"
                                            value={height}
                                            onChange={(e) => setHeight(parseFloat(e.target.value))}
                                            required
                                            min="0.5"
                                            step="0.1"
                                            placeholder="Height"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        />
                                        <span className="text-xs text-gray-500">cm</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Note: Value should be greater than 0.50 cm</p>
                            </div>

                            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-700">Volumetric Weight:</span>
                                    <span className="font-semibold">{volumetricWeight.toFixed(2)} kg</span>
                                </div>
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-900">Applicable Weight:</span>
                                    <span className="text-orange-600">{applicableWeight.toFixed(2)} kg</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">
                                    Applicable weight is the higher of the dead weight or volumetric weight, used by the courier for freight charges.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Other Details */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Other Details</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Order Tag (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={orderTag}
                                    onChange={(e) => setOrderTag(e.target.value)}
                                    placeholder="e.g., Urgent, Gift, etc."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                    Notes (Optional)
                                    <Info className="w-3 h-3 text-gray-400" />
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    maxLength={300}
                                    rows={3}
                                    placeholder="Notes"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">{notes.length}/300</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save className="w-4 h-4" />
                            {loading ? 'Creating...' : 'Ship Now'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddOrderModal;
