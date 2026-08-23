import { Link } from 'react-router-dom';

interface ImageGridProps {
    config: {
        images?: Array<{
            url: string;
            title?: string;
            link?: string;
        }>;
        gridLayout?: '2x2' | '3x3' | '4x2';
    };
}

const ImageGrid: React.FC<ImageGridProps> = ({ config }) => {
    const { images = [], gridLayout = '2x2' } = config;

    const gridClass = {
        '2x2': 'grid-cols-2',
        '3x3': 'grid-cols-3',
        '4x2': 'grid-cols-2 md:grid-cols-4',
    }[gridLayout];

    if (images.length === 0) return null;

    return (
        <div className="container-custom py-12">
            <div className={`grid ${gridClass} gap-4`}>
                {images.map((image, index) => {
                    const content = (
                        <div className="group relative aspect-square overflow-hidden rounded-lg">
                            <img
                                src={image.url}
                                alt={image.title || `Image ${index + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {image.title && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <h3 className="text-white text-2xl font-bold">{image.title}</h3>
                                </div>
                            )}
                        </div>
                    );

                    return image.link ? (
                        <Link key={index} to={image.link}>
                            {content}
                        </Link>
                    ) : (
                        <div key={index}>{content}</div>
                    );
                })}
            </div>
        </div>
    );
};

export default ImageGrid;
