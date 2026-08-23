import { RotateCcw, ShieldCheck, CreditCard } from 'lucide-react';

const ReturnsPage = () => {
    return (
        <div className="min-h-screen bg-white pt-12 pb-24">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Returns & Exchanges</h1>
                    <p className="text-gray-500">Hassle-free 7-day return policy</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <RotateCcw className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">7 Days Return</h3>
                        <p className="text-sm text-gray-600">Easy returns within 7 days of delivery</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">Quality Guarantee</h3>
                        <p className="text-sm text-gray-600">Damaged items replaced instantly</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <CreditCard className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">Fast Refunds</h3>
                        <p className="text-sm text-gray-600">Refunds processed within 48 hours</p>
                    </div>
                </div>

                <div className="space-y-12 prose max-w-none">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">Return Policy</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We want you to love what you ordered! If you aren't completely satisfied with the quality or fit,
                            you can return or exchange the item(s) within 7 days of delivery.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            To be eligible for a return, your item must be unused and in the same condition that you received it.
                            It must also be in the original packaging with tags intact.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">How to Initiate a Return</h2>
                        <ol className="list-decimal pl-6 space-y-4 text-gray-600">
                            <li>
                                <strong>Log in to your account</strong>: Go to the "My Orders" section.
                            </li>
                            <li>
                                <strong>Select the Order</strong>: Choose the order containing the item you want to return.
                            </li>
                            <li>
                                <strong>Request Return</strong>: Click on "Return/Exchange" and select the reason.
                            </li>
                            <li>
                                <strong>Schedule Pickup</strong>: Our courier partner will pick up the item within 2-3 days.
                            </li>
                        </ol>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Refunds</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Once your return is received and inspected, we will send you an email to notify you that we have received your returned item.
                            If approved, your refund will be processed, and a credit will automatically be applied to your original method of payment
                            or wallet within 5-7 working days.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">Non-returnable items</h2>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>Gift cards</li>
                            <li>Intimate apparel (underwear, swimwear) for hygiene reasons</li>
                            <li>Customized or personalized items</li>
                        </ul>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default ReturnsPage;
