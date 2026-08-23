import { Store, Users, Award } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="bg-white min-h-screen">
            {/* Hero Section */}
            <div className="bg-gray-900 text-white py-20 px-4">
                <div className="container-custom text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">Excellence in Every Thread</h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Quality isn't just a feature—it's our foundation. We combine premium materials with expert craftsmanship to create garments that stand the test of time.
                    </p>
                </div>
            </div>

            {/* Quality Focus Section */}
            <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 py-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div>
                        <img
                            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Quality Fabric"
                            className="rounded-lg shadow-xl"
                        />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold mb-6">Uncompromising Quality</h2>
                        <p className="text-gray-600 mb-4 leading-relaxed">
                            We believe that true luxury lies in the details. Our journey begins with the selection of the finest raw materials. We source premium long-staple cottons and high-performance blends that offer superior softness, breathability, and resilience.
                        </p>
                        <p className="text-gray-600 leading-relaxed">
                            Our manufacturing process blends modern precision with traditional techniques. Every seam is reinforced, every button securely fastened, and every hem perfectly aligned. We don't cut corners; we choose fabrics that feel better the longer you wear them and conduct rigorous testing to ensure durability.
                        </p>
                    </div>
                </div>
            </div>

            {/* Core Values */}
            <div className="bg-gray-50 py-16">
                <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">The Botam Standard</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Our commitment to excellence ensures that every piece you own is a testament to superior design and build.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Store className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Premium Fabrics</h3>
                            <p className="text-gray-600">
                                Sourced from the world's best mills to ensure unmatched softness, drape, and comfort against your skin.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Award className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Expert Craftsmanship</h3>
                            <p className="text-gray-600">
                                Precision stitching and obsessive attention to detail define every piece we make, ensuring a perfect fit.
                            </p>
                        </div>
                        <div className="bg-white p-8 rounded-lg shadow-sm text-center">
                            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Users className="w-8 h-8 text-purple-600" />
                            </div>
                            <h3 className="text-xl font-bold mb-4">Built to Last</h3>
                            <p className="text-gray-600">
                                Designed to withstand the rigors of daily wear while maintaining shape, color, and integrity over time.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
