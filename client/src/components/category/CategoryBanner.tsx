import { Link } from 'react-router-dom';

interface CategoryBannerProps {
    config: {
        bannerImage?: string;
        bannerText?: string;
        bannerLink?: string;
        bannerPosition?: 'left' | 'center' | 'right';
    };
}

const CategoryBanner: React.FC<CategoryBannerProps> = ({ config }) => {
    const { bannerImage, bannerText, bannerLink, bannerPosition = 'center' } = config;

    const positionClass = {
        left: 'justify-start text-left',
        center: 'justify-center text-center',
        right: 'justify-end text-right',
    }[bannerPosition];

    const content = (
        <div className="relative h-[400px] overflow-hidden rounded-lg">
            {/* Background Image */}
            {bannerImage && (
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${bannerImage})` }}
                >
                    <div className="absolute inset-0 bg-black/30" />
                </div>
            )}

            {/* Text Overlay */}
            {bannerText && (
                <div className={`relative h-full flex items-center ${positionClass} px-8 md:px-16`}>
                    <h2 className="text-4xl md:text-5xl font-bold text-white max-w-2xl">
                        {bannerText}
                    </h2>
                </div>
            )}
        </div>
    );

    return (
        <div className="container-custom py-12">
            {bannerLink ? (
                <Link to={bannerLink} className="block group">
                    {content}
                </Link>
            ) : (
                content
            )}
        </div>
    );
};

export default CategoryBanner;
