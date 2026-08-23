import React from 'react';

interface VideoSectionProps {
    config: {
        videoUrl?: string;
        videoThumbnail?: string;
        autoplay?: boolean;
        videoTitle?: string;
        videoDescription?: string;
    };
}

const VideoSection: React.FC<VideoSectionProps> = ({ config }) => {
    if (!config.videoUrl) return null;

    const isYouTube = config.videoUrl.includes('youtube.com') || config.videoUrl.includes('youtu.be');
    const isGoogleDrive = config.videoUrl.includes('drive.google.com');

    let embedUrl = config.videoUrl;
    if (isYouTube) {
        const match = config.videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
        const videoId = match ? match[1] : '';
        embedUrl = `https://www.youtube.com/embed/${videoId}${config.autoplay ? '?autoplay=1' : ''}`;
    } else if (isGoogleDrive) {
        const match = config.videoUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        const fileId = match ? match[1] : '';
        embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    }

    return (
        <div className="container-custom py-16">
            <div className="max-w-5xl mx-auto">
                {(config.videoTitle || config.videoDescription) && (
                    <div className="text-center mb-8">
                        {config.videoTitle && <h2 className="text-3xl font-bold mb-4">{config.videoTitle}</h2>}
                        {config.videoDescription && <p className="text-gray-600">{config.videoDescription}</p>}
                    </div>
                )}

                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                    <iframe
                        src={embedUrl}
                        title={config.videoTitle || 'Video'}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>
            </div>
        </div>
    );
};

export default VideoSection;
