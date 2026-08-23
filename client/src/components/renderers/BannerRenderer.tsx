import { motion } from 'framer-motion';
import { EditableWrapper } from '../editor/EditableWrapper';

interface BannerProps {
  sectionId?: string;
  content?: {
    heading?: string;
    headingStyle?: any;
    subheading?: string;
    subheadingStyle?: any;
    images?: Array<{ url: string; alt: string }>;
    mainImage?: any;
    cta?: {
      text: string;
      link: string;
      bgColor?: string;
      textColor?: string;
      borderRadius?: number;
      padding?: {
        top?: number;
        right?: number;
        bottom?: number;
        left?: number;
      };
    };
  };
  layout?: {
    customHeight?: string;
  };
  background?: any;
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

export const BannerRenderer = ({
  sectionId = '',
  content,
  layout,
  background,
  isEditMode = false,
  onEdit = () => { },
}: BannerProps) => {
  const bannerImage = content?.mainImage?.url || content?.images?.[0]?.url;
  const imageStyle = (content?.mainImage as any)?.urlStyle || (content?.images?.[0] as any)?.urlStyle;
  const isPlaceholder = bannerImage?.includes('placehold.co') || bannerImage?.includes('placeholder.com');

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
        className="relative w-full overflow-hidden"
        style={{
          height: layout?.customHeight || '400px',
          ...getBackgroundStyle(background),
        }}
      >
        {/* Background Image (Content) - Only render if exists and not placeholder */}
        {bannerImage && !isPlaceholder && (
        <div className="absolute inset-0">
          <EditableWrapper
            type="image"
            sectionId={sectionId}
            elementPath="content.mainImage.url"
            currentValue={bannerImage}
            currentStyle={imageStyle}
            isEditMode={isEditMode}
            onEdit={onEdit}
          >
            <img
              src={bannerImage}
              alt={content?.mainImage?.alt || content?.images?.[0]?.alt || 'Banner'}
              className="w-full h-full"
              style={{
                objectFit: imageStyle?.objectFit || 'cover',
                borderRadius: imageStyle?.borderRadius
              }}
            />
          </EditableWrapper>
          <div 
             className="absolute inset-0 bg-black/40" 
             style={{
                borderRadius: imageStyle?.borderRadius
             }}
          />
        </div>
        )}

        {/* Content */}
        <div className="relative h-full flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl"
          >
            {content?.heading && (
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
                  className="mb-4"
                  style={{
                    fontSize: content.headingStyle?.fontSize || 'clamp(1.5rem, 5vw, 3rem)',
                    fontWeight: content.headingStyle?.fontWeight || 'bold',
                    color: content.headingStyle?.color || '#ffffff',
                  }}
                >
                  {content.heading}
                </h2>
              </EditableWrapper>
            )}

            {content?.subheading && (
              <EditableWrapper
                type="text"
                sectionId={sectionId}
                elementPath="content.subheading"
                currentValue={content.subheading}
                currentStyle={content.subheadingStyle}
                isEditMode={isEditMode}
                onEdit={onEdit}
              >
                <p
                  className="mb-6"
                  style={{
                    fontSize: content.subheadingStyle?.fontSize || 'clamp(1rem, 3vw, 1.5rem)',
                    color: content.subheadingStyle?.color || '#ffffff',
                  }}
                >
                  {content.subheading}
                </p>
              </EditableWrapper>
            )}

            {content?.cta && (
              <EditableWrapper
                type="button"
                sectionId={sectionId}
                elementPath="content.cta"
                currentValue={content.cta}
                isEditMode={isEditMode}
                onEdit={onEdit}
              >
                <motion.a
                  href={content.cta.link}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block font-bold hover:opacity-90 transition-all"
                  style={{
                    backgroundColor: content.cta.bgColor || '#ffffff',
                    color: content.cta.textColor || '#000000',
                    borderRadius: `${content.cta.borderRadius || 4}px`,
                    padding: `${content.cta.padding?.top || 16}px ${content.cta.padding?.right || 32}px ${content.cta.padding?.bottom || 16}px ${content.cta.padding?.left || 32}px`,
                  }}
                >
                  {content.cta.text}
                </motion.a>
              </EditableWrapper>
            )}
          </motion.div>
        </div>
      </div>
    </EditableWrapper>
  );
};
