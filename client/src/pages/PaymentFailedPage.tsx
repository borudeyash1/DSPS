import { Link, useSearchParams } from 'react-router-dom';
import { XCircle, AlertCircle, ArrowRight, ShoppingBag } from 'lucide-react';

const PaymentFailedPage = () => {
    const [searchParams] = useSearchParams();
    const message = searchParams.get('message') || 'Transaction could not be completed';
    const orderId = searchParams.get('orderId');

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                        <XCircle className="h-10 w-10 text-red-600" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Failed</h2>
                    <p className="text-sm text-gray-500">
                        We couldn't process your payment.
                    </p>
                </div>

                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md my-6">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Details</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{message}</p>
                                {orderId && <p className="mt-1 font-mono text-xs">Order ID: {orderId}</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <Link
                        to="/checkout"
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                    >
                        Try Again
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>

                    <Link
                        to="/cart"
                        className="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                    >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Return to Cart
                    </Link>
                </div>

                <div className="mt-6 text-center">
                    <p className="text-xs text-gray-400">
                        If money was deducted, it will be refunded automatically within 5-7 business days.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailedPage;
