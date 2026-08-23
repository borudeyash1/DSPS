
import { ScrollText, ShieldCheck, Scale } from 'lucide-react';

const TermsPage = () => {
    return (
        <div className="min-h-screen bg-white pt-12 pb-24">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Terms & Conditions</h1>
                    <p className="text-gray-500">Last updated: January 2026</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <ScrollText className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">Usage Rights</h3>
                        <p className="text-sm text-gray-600">Guidelines for using our platform</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <ShieldCheck className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">Liability</h3>
                        <p className="text-sm text-gray-600">Limitations of our responsibility</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Scale className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">Governing Law</h3>
                        <p className="text-sm text-gray-600">Legal jurisdiction and compliance</p>
                    </div>
                </div>

                <div className="space-y-12 prose max-w-none">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                        <p className="text-gray-600 leading-relaxed">
                            By accessing and using the Botam Apparels website, you accept and agree to be bound by the terms and provision of this agreement. 
                            In addition, when using this websites particular services, you shall be subject to any posted guidelines or rules applicable to such services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Product Information</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We attempt to be as accurate as possible. However, Botam Apparels does not warrant that product descriptions or other content 
                            of this site is accurate, complete, reliable, current, or error-free. If a product offered by us itself is not as described, 
                            your sole remedy is to return it in unused condition.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. Pricing and Availability</h2>
                        <p className="text-gray-600 leading-relaxed">
                            All prices are listed in Indian Rupees (INR) and are inclusive of GST unless stated otherwise. Prices and availability of items 
                            are subject to change without notice. We reserve the right to limit the quantity of items purchased per person, per household or per order.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Intellectual Property</h2>
                        <p className="text-gray-600 leading-relaxed">
                            The Site and its original content, features and functionality are and will remain the exclusive property of Botam Apparels and its licensors. 
                            The Service is protected by copyright, trademark, and other laws of both the India and foreign countries.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. User Account</h2>
                        <p className="text-gray-600 leading-relaxed">
                            If you use this site, you are responsible for maintaining the confidentiality of your account and password and for restricting access to your computer, 
                            and you agree to accept responsibility for all activities that occur under your account or password.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Contact Information</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Questions about the Terms should be sent to us at:
                            <a href="mailto:support@botamapparels.com" className="text-black font-semibold hover:underline ml-1">support@botamapparels.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
