import React from 'react';
import { Download, Package, Calendar, MapPin, CreditCard, Phone, Mail, Share2, CheckCircle } from 'lucide-react';
import Toast from './Toast';
import { useToast } from '../hooks/useToast';

interface InvoiceProps {
    order: {
        _id: string;
        items: Array<{
            name: string;
            price: number;
            quantity: number;
            size?: string;
            color?: string;
            image?: string;
        }>;
        totalAmount: number;
        status: string;
        paymentMethod: string;
        paymentStatus: string;
        paymentDetails?: {
            transactionId?: string;
            orderId?: string;
            method?: string;
            paidAt?: string;
            status?: string;
        };
        shippingAddress: {
            fullName?: string;
            street: string;
            city: string;
            state: string;
            pincode: string;
            country?: string;
            phone?: string;
        };
        createdAt: string;
        trackingNumber?: string;
        awbCode?: string;
        courierName?: string;
    };
    user: {
        fullName: string;
        email: string;
        phone?: string;
    };
}

const Invoice: React.FC<InvoiceProps> = ({ order, user }) => {
    const invoiceRef = React.useRef<HTMLDivElement>(null);
    const { toasts, showToast, hideToast } = useToast();

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR'
        }).format(amount);
    };

    const downloadPDF = async () => {
        // Dynamic import to reduce bundle size
        const html2canvas = (await import('html2canvas')).default;
        const jsPDF = (await import('jspdf')).default;

        if (!invoiceRef.current) return;

        try {
            const canvas = await html2canvas(invoiceRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = (canvas.height * imgWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Invoice-${order._id}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            showToast('Failed to generate PDF. Please try again.', 'error');
        }
    };

    const shareViaWhatsApp = () => {
        const invoiceNumber = order._id.slice(-8).toUpperCase();
        const amount = formatCurrency(order.totalAmount);
        const text = `*Invoice from Botam Apparels*\n\nInvoice #${invoiceNumber}\nAmount: ${amount}\nStatus: ${order.status}\n\nThank you for shopping with us!`;
        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const shareViaEmail = () => {
        const invoiceNumber = order._id.slice(-8).toUpperCase();
        const subject = `Invoice #${invoiceNumber} - Botam Apparels`;
        const body = `Dear ${user.fullName},\n\nPlease find your invoice details below:\n\nInvoice Number: ${invoiceNumber}\nOrder Date: ${formatDate(order.createdAt)}\nTotal Amount: ${formatCurrency(order.totalAmount)}\nPayment Method: ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}\n\nThank you for shopping with Botam Apparels!\n\nBest regards,\nBotam Apparels Team`;
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };



    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getPaymentStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-800',
            completed: 'bg-green-100 text-green-800',
            failed: 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header with Action Buttons */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
                <div className="flex justify-between items-center mb-3">
                    <h2 className="text-white text-xl font-bold">Invoice / Payment Slip</h2>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={downloadPDF}
                        className="bg-white text-orange-600 px-4 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center gap-2 text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                    <button
                        onClick={shareViaWhatsApp}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 text-sm"
                    >
                        <Share2 className="w-4 h-4" />
                        WhatsApp
                    </button>
                    <button
                        onClick={shareViaEmail}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm"
                    >
                        <Mail className="w-4 h-4" />
                        Email
                    </button>

                </div>
            </div>

            {/* Invoice Content */}
            <div ref={invoiceRef} className="p-8 bg-white">
                {/* Header with Logo */}
                <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
                    <div className="flex items-start gap-4">
                        {/* Company Logo */}
                        <img
                            src="/logo.png"
                            alt="Botam Apparels Logo"
                            className="w-16 h-16 object-contain"
                        />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Botam Apparels</h1>
                            <p className="text-gray-600">Premium Fashion & Lifestyle</p>
                            <p className="text-sm text-gray-500 mt-2">GST: 27XXXXX1234X1ZX</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="bg-orange-50 px-4 py-2 rounded-lg inline-block">
                            <p className="text-sm text-gray-600">Invoice Number</p>
                            <p className="text-lg font-bold text-orange-600">#{order._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            <Calendar className="w-4 h-4 inline mr-1" />
                            {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>

                {/* Status Badges */}
                <div className="flex gap-3 mb-6">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-800">
                        <CreditCard className="w-3 h-3 inline mr-1" />
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                    </span>
                </div>

                {/* Customer & Shipping Info */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* Bill To */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Mail className="w-4 h-4 text-orange-600" />
                            Bill To
                        </h3>
                        <p className="font-semibold text-gray-900">{user.fullName}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        {user.phone && (
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" />
                                {user.phone}
                            </p>
                        )}
                    </div>

                    {/* Ship To */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-orange-600" />
                            Ship To
                        </h3>
                        <p className="font-semibold text-gray-900">
                            {order.shippingAddress.fullName || user.fullName}
                        </p>
                        <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
                        <p className="text-sm text-gray-600">
                            {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                        </p>
                        <p className="text-sm text-gray-600">{order.shippingAddress.country || 'India'}</p>
                        {order.shippingAddress.phone && (
                            <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                                <Phone className="w-3 h-3" />
                                {order.shippingAddress.phone}
                            </p>
                        )}
                    </div>
                </div>

                {/* Tracking Info (if available) */}
                {(order.trackingNumber || order.awbCode) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            Tracking Information
                        </h3>
                        {order.awbCode && (
                            <p className="text-sm text-blue-800">
                                <span className="font-semibold">AWB Code:</span> {order.awbCode}
                            </p>
                        )}
                        {order.courierName && (
                            <p className="text-sm text-blue-800">
                                <span className="font-semibold">Courier:</span> {order.courierName}
                            </p>
                        )}
                        {order.trackingNumber && (
                            <p className="text-sm text-blue-800">
                                <span className="font-semibold">Tracking Number:</span> {order.trackingNumber}
                            </p>
                        )}
                    </div>
                )}

                {/* Payment Transaction Details (for online payments) */}
                {order.paymentMethod === 'online' && order.paymentDetails && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                        <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5" />
                            Payment Transaction Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {order.paymentDetails.transactionId && (
                                <div className="bg-white rounded p-3">
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Transaction ID</p>
                                    <p className="text-sm font-mono font-semibold text-green-700">
                                        {order.paymentDetails.transactionId}
                                    </p>
                                </div>
                            )}
                            {order.paymentDetails.orderId && (
                                <div className="bg-white rounded p-3">
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Gateway Order ID</p>
                                    <p className="text-sm font-mono font-semibold text-green-700">
                                        {order.paymentDetails.orderId}
                                    </p>
                                </div>
                            )}
                            {order.paymentDetails.method && (
                                <div className="bg-white rounded p-3">
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Payment Method</p>
                                    <p className="text-sm font-semibold text-gray-900 uppercase">
                                        {order.paymentDetails.method}
                                    </p>
                                </div>
                            )}
                            {order.paymentDetails.paidAt && (
                                <div className="bg-white rounded p-3">
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">Payment Date & Time</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {new Date(order.paymentDetails.paidAt).toLocaleString('en-IN', {
                                            day: '2-digit',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            )}
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-sm text-green-800 bg-white rounded p-2">
                            <CheckCircle className="w-4 h-4" />
                            <span className="font-medium">Payment Verified & Confirmed</span>
                        </div>
                    </div>
                )}

                {/* Order Items Table */}
                <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Order Items</h3>
                    <div className="overflow-hidden border border-gray-200 rounded-lg">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Item
                                    </th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Quantity
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {order.items.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt={item.name}
                                                        className="w-12 h-12 object-cover rounded"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium text-gray-900">{item.name}</p>
                                                    <div className="flex gap-2 mt-1">
                                                        {item.size && (
                                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                                Size: {item.size}
                                                            </span>
                                                        )}
                                                        {item.color && (
                                                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                                                                Color: {item.color}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center text-gray-900">
                                            {item.quantity}
                                        </td>
                                        <td className="px-4 py-4 text-right text-gray-900">
                                            {formatCurrency(item.price)}
                                        </td>
                                        <td className="px-4 py-4 text-right font-semibold text-gray-900">
                                            {formatCurrency(item.price * item.quantity)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Totals */}
                <div className="flex justify-end">
                    <div className="w-80">
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Subtotal</span>
                                <span className="text-gray-900">{formatCurrency(order.totalAmount)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Shipping</span>
                                <span className="text-green-600 font-semibold">FREE</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Tax (Included)</span>
                                <span className="text-gray-900">₹0</span>
                            </div>
                            <div className="border-t border-gray-300 pt-2 mt-2">
                                <div className="flex justify-between">
                                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                    <span className="text-lg font-bold text-orange-600">
                                        {formatCurrency(order.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Payment Information</h4>
                            <p>Method: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                            <p>Status: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}</p>
                            {order.paymentMethod === 'online' && order.paymentDetails?.transactionId && (
                                <p className="mt-2 font-mono text-xs bg-gray-100 p-2 rounded">
                                    Txn: {order.paymentDetails.transactionId}
                                </p>
                            )}
                        </div>
                        <div>
                            <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                            <p>Email: support@botamapparels.com</p>
                            <p>Phone: +91 1800-XXX-XXXX</p>
                        </div>
                    </div>
                    <div className="mt-6 text-center text-xs text-gray-500 border-t border-gray-200 pt-4">
                        <p className="font-semibold text-gray-700 mb-1">Thank you for shopping with Botam Apparels!</p>
                        <p>This is a computer-generated invoice and does not require a signature.</p>
                        <p className="mt-2">For any queries, please contact our customer support team.</p>
                    </div>
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

export default Invoice;
