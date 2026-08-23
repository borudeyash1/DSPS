import { Link } from 'react-router-dom';

interface BlogHeroProps {
    config: {
        heroImage?: string;
        heroTitle?: string;
        heroSubtitle?: string;
        heroButton?: {
            text: string;
            link: string;
        };
    };
}

const BlogHero: React.FC<BlogHeroProps> = ({ config }) => {
    const { heroImage, heroTitle, heroSubtitle, heroButton } = config;

    return (
        <div className="relative h-[500px] bg-gray-900 overflow-hidden">
            {/* Background Image */}
            {heroImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImage})` }}
                >
                    <div className="absolute inset-0 bg-black/40" />
                </div>
            )}

            {/* Content */}
            <div className="relative h-full flex items-center justify-center text-center px-4">
                <div className="max-w-4xl mx-auto">
                    {heroTitle && (
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            {heroTitle}
                        </h1>
                    )}

                    {heroSubtitle && (
                        <p className="text-xl md:text-2xl text-white/90 mb-8">
                            {heroSubtitle}
                        </p>
                    )}

                    {heroButton && (
                        <Link
                            to={heroButton.link}
                            className="inline-block px-8 py-4 bg-white text-black font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {heroButton.text}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlogHero;
