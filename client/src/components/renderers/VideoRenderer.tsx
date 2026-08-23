import { motion } from 'framer-motion';
import { EditableWrapper } from '../editor/EditableWrapper';
import { PremiumVideoPlayer } from '../ui/PremiumVideoPlayer';

interface VideoProps {
  sectionId?: string;
  content?: {
    heading?: string;
    headingStyle?: any;
    subheading?: string;
    video?: {
      url: string;
      thumbnail?: string;
      autoplay?: boolean;
      loop?: boolean;
      muted?: boolean;
      controls?: boolean;
      aspectRatio?: string;
      height?: string;
      objectFit?: 'cover' | 'contain';
      padding?: string;
      width?: string;
      align?: 'left' | 'center' | 'right';
    };
  };
  background?: any;
  layout?: {
    customHeight?: string;
    padding?: string;
  };
  isEditMode?: boolean;
  onEdit?: (element: any) => void;
}

const getBackgroundStyle = (bg: any) => {
  if (!bg || !bg.type) return {};
  const styles: any = {};
  if (bg.type === 'solid') {
    styles.backgroundColor = bg.color || '#ffffff';
  } else if (bg.type === 'gradient') {
    const stops = bg.stops?.map((s: any) => `${s.color} ${s.position}%`).join(', ') || '';
    if (bg.gradientType === 'linear') {
      styles.background = `linear-gradient(${bg.direction || 90}deg, ${stops})`;
    } else {
      styles.background = `radial-gradient(circle, ${stops})`;
    }
  } else if (bg.type === 'image') {
    styles.backgroundImage = `url(${bg.imageUrl})`;
    styles.backgroundSize = bg.size || 'cover';
    styles.backgroundPosition = bg.position || 'center';
    styles.backgroundRepeat = bg.repeat || 'no-repeat';
  }
  return styles;
};

// Helper to get video type and embed URL
const getVideoInfo = (url: string) => {
  if (!url) return { type: 'native', url: '' };

  // Google Drive
  // Support /file/d/ID/view, open?id=ID, and other common formats
  const driveIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (url.includes('drive.google.com') && driveIdMatch) {
    return {
      type: 'drive',
      url: `https://drive.google.com/file/d/${driveIdMatch[1]}/preview`
    };
  }

  // YouTube source
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    let videoId = '';

    // Handle youtu.be/ID
    if (url.includes('youtu.be')) {
      videoId = url.split('youtu.be/')[1]?.split('?')[0];
    }
    // Handle youtube.com/watch?v=ID
    else if (url.includes('watch')) {
      const match = url.match(/[?&]v=([^&]+)/);
      if (match) videoId = match[1];
    }
    // Handle youtube.com/embed/ID
    else if (url.includes('embed')) {
      videoId = url.split('embed/')[1]?.split('?')[0];
    }

    if (videoId) {
      // Add parameters for cleaner look: no related videos (rel=0), no controls, modest branding
      return {
        type: 'youtube',
        url: `https://www.youtube.com/embed/${videoId}?enablejsapi=1&rel=0&modestbranding=1&controls=0&showinfo=0&iv_load_policy=3&fs=0`
      };
    }
  }

  // Default to native (uploaded files)
  return { type: 'native', url };
};

export const VideoRenderer = ({
  sectionId = '',
  content,
  background,
  isEditMode = false,
  onEdit = () => { },
}: VideoProps) => {
  const videoData = content?.video || {
    url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    thumbnail: 'https://placehold.co/1280x720/667eea/ffffff?text=Video+Thumbnail',
    autoplay: false,
    loop: false,
    muted: false,
    controls: true,
    // ...
  };

  const { type: videoType, url: embedUrl } = getVideoInfo(videoData.url);

  // Construct iframe props based on provider
  const getNestIframeProps = () => {
    let src = embedUrl;
    const allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";

    if (videoType === 'youtube') {
      // Add params based on videoData props
      const params = [];
      if (videoData.autoplay) params.push('autoplay=1');
      if (videoData.muted) params.push('mute=1');
      if (videoData.loop) params.push(`loop=1&playlist=${embedUrl.split('/').pop()?.split('?')[0]}`);
      if (!videoData.controls) params.push('controls=0');

      if (params.length > 0) {
        src = `${src}&${params.join('&')}`;
      }
    }

    return { src, allow };
  };

  const containerStyle = {
      ...getBackgroundStyle(background),
      ...(videoData.aspectRatio && videoData.aspectRatio !== 'auto' ? { aspectRatio: videoData.aspectRatio, height: 'auto', minHeight: 'unset' } : {}),
      ...(videoData.height && (!videoData.aspectRatio || videoData.aspectRatio === 'auto') ? { height: videoData.height, minHeight: 'unset' } : {}),
      padding: videoData.padding || '0'
  };

  const objectFitClass = videoData.objectFit === 'contain' ? 'object-contain' : 'object-cover';

  return (
    <EditableWrapper
      type="background"
      sectionId={sectionId}
      elementPath="background"
      currentValue={background}
      isEditMode={isEditMode}
      onEdit={onEdit}
    >
      <div
        className={`w-full h-full relative mb-8 overflow-hidden rounded-xl ${(!videoData.aspectRatio || videoData.aspectRatio === 'auto') && !videoData.height ? 'min-h-[50vh] md:min-h-screen' : ''}`}
        style={containerStyle}
      >
        {/* Content Overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="max-w-6xl mx-auto px-4 w-full text-center pointer-events-auto">
            {content?.heading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <EditableWrapper
                  type="text"
                  sectionId={sectionId}
                  elementPath="content.heading"
                  currentValue={content.heading}
                  currentStyle={content.headingStyle}
                  isEditMode={isEditMode}
                  onEdit={onEdit}
                >
                  <h2
                    style={{
                      fontSize: content.headingStyle?.fontSize || 'clamp(2rem, 5vw, 4rem)',
                      fontWeight: content.headingStyle?.fontWeight || 'bold',
                      color: content.headingStyle?.color || '#ffffff',
                      textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}
                  >
                    {content.heading}
                  </h2>
                </EditableWrapper>
                {content.subheading && (
                  <EditableWrapper
                    type="text"
                    sectionId={sectionId}
                    elementPath="content.subheading"
                    currentValue={content.subheading}
                    isEditMode={isEditMode}
                    onEdit={onEdit}
                  >
                    <p className="text-xl text-white mt-4 drop-shadow-md">{content.subheading}</p>
                  </EditableWrapper>
                )}
              </motion.div>
            )}
          </div>
        </div>

        {/* Video Background Layer - Z-index 0 */}
        <div 
          className={`absolute top-0 h-full z-0 transition-all duration-300 ${videoData.align === 'left' ? 'left-0' : videoData.align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}
          style={{ width: videoData.width || '100%' }}
        >
          <EditableWrapper
            type="video"
            sectionId={sectionId}
            elementPath="content.video"
            currentValue={videoData}
            isEditMode={isEditMode}
            onEdit={onEdit}
            className="w-full h-full relative"
          >
            {videoType === 'drive' || videoType === 'youtube' ? (
              <iframe
                src={getNestIframeProps().src}
                className={`w-full h-full transition-transform duration-300 ${videoData.objectFit === 'cover' ? 'scale-[1.5]' : (!videoData.controls ? 'scale-[1.35]' : 'scale-100')}`}
                allow={getNestIframeProps().allow}
                allowFullScreen
                style={{
                  border: 'none',
                  pointerEvents: (isEditMode || !videoData.controls) ? 'none' : 'auto'
                }}
              />
            ) : (
              <PremiumVideoPlayer
                src={videoData.url}
                poster={videoData.thumbnail}
                autoPlay={videoData.autoplay}
                loop={videoData.loop}
                muted={videoData.muted}
                className={`w-full h-full ${isEditMode ? 'pointer-events-none' : ''} ${objectFitClass}`}
              />
            )}

            {/* Explicit Edit Overlay for Video - Only visible in Edit Mode */}
            {/* Explicit Edit Overlay for Video - Only visible in Edit Mode */}
            {isEditMode && (
              <div
                className="absolute top-4 right-4 z-50 flex items-center justify-center cursor-pointer pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit({
                    type: 'video',
                    sectionId,
                    elementPath: 'content.video',
                    currentValue: videoData
                  });
                }}
              >
                <div className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg hover:bg-purple-700 transition-colors border-2 border-white/20">
                  Click to Edit Video
                </div>
              </div>
            )}
          </EditableWrapper>
        </div>
      </div>
    </EditableWrapper>
  );
};
