
import { Shield, Lock, Eye } from 'lucide-react';

const PrivacyPage = () => {
    return (
        <div className="min-h-screen bg-white pt-12 pb-24">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
                    <p className="text-gray-500">Last updated: January 2026</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Shield className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">Data Protection</h3>
                        <p className="text-sm text-gray-600">Your data is secure with us</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">Secure Payments</h3>
                        <p className="text-sm text-gray-600">Encrypted transaction processing</p>
                    </div>
                    <div className="bg-gray-50 p-6 rounded-xl text-center">
                        <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                            <Eye className="w-6 h-6 text-black" />
                        </div>
                        <h3 className="font-bold mb-2">Transparency</h3>
                        <p className="text-sm text-gray-600">Clear usage of your information</p>
                    </div>
                </div>

                <div className="space-y-12 prose max-w-none">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Introduction</h2>
                        <p className="text-gray-600 leading-relaxed">
                            Welcome to Botam Apparels. We respect your privacy and are committed to protecting your personal data. 
                            This privacy policy will inform you as to how we look after your personal data when you visit our website 
                            and tell you about your privacy rights and how the law protects you.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Information We Collect</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We may collect, use, store and transfer different kinds of personal data about you which we have grouped together as follows:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li><strong>Identity Data:</strong> includes first name, last name, username or similar identifier.</li>
                            <li><strong>Contact Data:</strong> includes billing address, delivery address, email address and telephone numbers.</li>
                            <li><strong>Transaction Data:</strong> includes details about payments to and from you and other details of products you have purchased from us.</li>
                            <li><strong>Technical Data:</strong> includes internet protocol (IP) address, your login data, browser type and version, time zone setting, and operating system.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. How We Use Your Data</h2>
                        <p className="text-gray-600 leading-relaxed mb-4">
                            We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 text-gray-600">
                            <li>To register you as a new customer.</li>
                            <li>To process and deliver your order including managing payments, fees, and charges.</li>
                            <li>To manage our relationship with you which will include notifying you about changes to our terms or privacy policy.</li>
                            <li>To deliver relevant website content and advertisements to you and measure or understand the effectiveness of the advertising we serve to you.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Data Sharing</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We may have to share your personal data with the parties set out below for the purposes set out in section 3 above. 
                            These include service providers who provide IT and system administration services, professional advisers including lawyers, 
                            bankers, auditors and insurers, and regulatory authorities. We require all third parties to respect the security of your 
                            personal data and to treat it in accordance with the law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">5. Data Security</h2>
                        <p className="text-gray-600 leading-relaxed">
                            We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed 
                            in an unauthorised way, altered or disclosed. In addition, we limit access to your personal data to those employees, agents, 
                            contractors and other third parties who have a business need to know.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
                        <p className="text-gray-600 leading-relaxed">
                            If you have any questions about this privacy policy or our privacy practices, please contact us at: 
                            <a href="mailto:support@botamapparels.com" className="text-black font-semibold hover:underline ml-1">support@botamapparels.com</a>.
                        </p>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPage;
