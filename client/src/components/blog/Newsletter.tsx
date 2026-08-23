import { useState } from 'react';
import { Mail } from 'lucide-react';

interface NewsletterProps {
    config: {
        newsletterTitle?: string;
        newsletterDescription?: string;
        newsletterPlaceholder?: string;
    };
}

const Newsletter: React.FC<NewsletterProps> = ({ config }) => {
    const [email, setEmail] = useState('');
    const [subscribed, setSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) return;

        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            setSubscribed(true);
            setLoading(false);
            setEmail('');

            // Reset after 3 seconds
            setTimeout(() => setSubscribed(false), 3000);
        }, 1000);
    };

    const title = config.newsletterTitle || 'Subscribe to our Newsletter';
    const description = config.newsletterDescription || 'Get the latest updates and exclusive content delivered to your inbox';
    const placeholder = config.newsletterPlaceholder || 'Enter your email';

    return (
        <div className="bg-gradient-to-r from-gray-900 to-black text-white py-16">
            <div className="container-custom">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-6">
                        <Mail className="w-8 h-8" />
                    </div>

                    {/* Title */}
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        {title}
                    </h2>

                    {/* Description */}
                    <p className="text-lg text-white/80 mb-8">
                        {description}
                    </p>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={placeholder}
                            required
                            className="flex-1 px-6 py-4 rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-white/50"
                        />
                        <button
                            type="submit"
                            disabled={loading || subscribed}
                            className="px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {loading ? 'Subscribing...' : subscribed ? '✓ Subscribed!' : 'Subscribe'}
                        </button>
                    </form>

                    {/* Privacy Note */}
                    <p className="text-sm text-white/60 mt-4">
                        We respect your privacy. Unsubscribe at any time.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Newsletter;
