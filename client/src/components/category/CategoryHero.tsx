import { Link } from 'react-router-dom';

interface CategoryHeroProps {
    config: {
        heroImage?: string;
        heroTitle?: string;
        heroSubtitle?: string;
        heroOverlay?: boolean;
        heroButton?: {
            text: string;
            link: string;
        };
    };
}

const CategoryHero: React.FC<CategoryHeroProps> = ({ config }) => {
    const { heroImage, heroTitle, heroSubtitle, heroOverlay = true, heroButton } = config;

    return (
        <div className="relative h-[600px] bg-gray-900 overflow-hidden">
            {/* Background Image */}
            {heroImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroImage})` }}
                >
                    {heroOverlay && <div className="absolute inset-0 bg-black/50" />}
                </div>
            )}

            {/* Content */}
            <div className="relative h-full flex items-center justify-center text-center px-4">
                <div className="max-w-4xl mx-auto">
                    {heroTitle && (
                        <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
                            {heroTitle}
                        </h1>
                    )}

                    {heroSubtitle && (
                        <p className="text-xl md:text-2xl text-white/90 mb-8 font-light">
                            {heroSubtitle}
                        </p>
                    )}

                    {heroButton && (
                        <Link
                            to={heroButton.link}
                            className="inline-block px-10 py-4 bg-white text-black font-semibold text-lg rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            {heroButton.text}
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CategoryHero;
