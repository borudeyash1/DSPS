import { Truck, Clock, Globe } from 'lucide-react';

const ShippingPolicyPage = () => {
    return (
        <div className="min-h-screen bg-white pt-12 pb-24">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Shipping Policy</h1>
                    <p className="text-gray-500">Last updated: January 2026</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Truck className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">Free Shipping</h3>
                        <p className="text-sm text-gray-600">On all orders above ₹999</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">Fast Delivery</h3>
                        <p className="text-sm text-gray-600">Within 3-5 business days</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Globe className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">Pan India</h3>
                        <p className="text-sm text-gray-600">Delivery across 25000+ pincodes</p>
                    </div>
                </div>

                <div className="space-y-12 prose max-w-none">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Order Processing</h2>
                        <p className="text-gray-600 leading-relaxed">
                            All orders are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.
                            If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
                            If there will be a significant delay in shipment of your order, we will contact you via email or telephone.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Shipping Rates & Delivery Estimates</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left bg-white border border-gray-200 rounded-lg">
                                <thead className="bg-gray-50 text-gray-700">
                                    <tr>
                                        <th className="px-6 py-3 font-semibold">Shipping Method</th>
                                        <th className="px-6 py-3 font-semibold">Estimated Delivery Time</th>
                                        <th className="px-6 py-3 font-semibold">Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    <tr>
                                        <td className="px-6 py-4">Standard Shipping</td>
                                        <td className="px-6 py-4">3-5 details business days</td>
                                        <td className="px-6 py-4">₹50 (Free over ₹999)</td>
                                    </tr>
                                    <tr>
                                        <td className="px-6 py-4">Express Shipping</td>
                                        <td className="px-6 py-4">1-2 business days</td>
                                        <td className="px-6 py-4">₹150</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Shipment Confirmation & Order Tracking</h2>
                        <p className="text-gray-600 leading-relaxed">
                            You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s).
                            The tracking number will be active within 24 hours.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Damages</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Botam Apparels is not liable for any products damaged or lost during shipping. If you received your order damaged,
                            please contact the shipment carrier to file a claim. Please save all packaging materials and damaged goods before filing a claim.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ShippingPolicyPage;
