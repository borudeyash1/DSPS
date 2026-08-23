import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { EditableWrapper } from '../editor/EditableWrapper';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

// Define modules outside to prevent re-initialization
const CAROUSEL_MODULES = [Navigation, Pagination, Autoplay, EffectFade];

interface HeroCarouselProps {
  sectionId?: string;
  content: {
    heading?: string;
    headingStyle?: any;
    subheading?: string;
    images?: Array<{ url: string; alt: string; link?: string; heading?: string; subheading?: string; cta?: any }>;
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
  background?: any;
  carouselSettings?: {
    autoPlay?: boolean;
    interval?: number;
    showArrows?: boolean;
    showDots?: boolean;
    infinite?: boolean;
    transition?: string;
  };
  isEditMode?: boolean;
  onEdit?: (element: any) => void;
  isPreview?: boolean;
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

export const HeroCarouselRenderer = ({
  sectionId = '',
  content,
  background,
  carouselSettings,
  isEditMode = false,
  onEdit = () => { },
  isPreview = false,
}: HeroCarouselProps) => {
  const [swiper, setSwiper] = useState<any>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const settings = useMemo(() => ({
    autoPlay: isEditMode ? false : (carouselSettings?.autoPlay ?? true),
    interval: carouselSettings?.interval ?? 5000,
    showArrows: isEditMode ? false : (carouselSettings?.showArrows ?? true),
    showDots: isEditMode ? false : (carouselSettings?.showDots ?? true),
    infinite: isEditMode ? false : (carouselSettings?.infinite ?? true),
    transition: carouselSettings?.transition ?? 'slide',
    observer: true,
    observeParents: true,
  }), [isEditMode, carouselSettings]);

  const renderSlideContent = (image: any, index: number) => {
    // Determine content to display (specific > fallback > default)
    const isHeadingSpecific = image.heading !== undefined && image.heading !== '';
    const heading = isHeadingSpecific ? image.heading : content.heading;
    
    const isSubheadingSpecific = image.subheading !== undefined && image.subheading !== '';
    const subheading = isSubheadingSpecific ? image.subheading : content.subheading;
    
    // Check if CTA object has specific properties defined (checking text as a proxy for existence)
    const isCtaSpecific = image.cta && image.cta.text; 
    const cta = isCtaSpecific ? image.cta : content.cta;

    return (
    <div className="relative w-full h-full">
      <EditableWrapper
        type="image"
        sectionId={sectionId}
        elementPath={`content.images[${index}].url`}
        currentValue={image.url}
        isEditMode={isEditMode}
        onEdit={onEdit}
      >
        <img
          src={image.url}
          alt={image.alt}
          className="w-full h-full object-cover"
        />
      </EditableWrapper>
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center px-4"
        >
          {heading && (
            <h1
              className="mb-4"
              style={{
                fontSize: content.headingStyle?.fontSize || 'clamp(3rem, 6vw, 6rem)',
                fontWeight: content.headingStyle?.fontWeight || 'bold',
                color: content.headingStyle?.color || '#ffffff',
                textAlign: content.headingStyle?.textAlign || 'center',
              }}
            >
              {heading}
            </h1>
          )}
          {subheading && (
            <p className="text-lg md:text-2xl text-white mb-6">{subheading}</p>
          )}
          {cta && (
            <a
              href={cta.link}
              className="inline-block font-bold hover:opacity-90 transition-all"
              style={{
                backgroundColor: cta.bgColor || '#ffffff',
                color: cta.textColor || '#000000',
                borderRadius: `${cta.borderRadius || 4}px`,
                padding: `${cta.padding?.top || 16}px ${cta.padding?.right || 32}px ${cta.padding?.bottom || 16}px ${cta.padding?.left || 32}px`,
              }}
            >
              {cta.text}
            </a>
          )}
        </motion.div>
      </div>
    </div>
  )};

  return (
    <EditableWrapper
      type="background"
      sectionId={sectionId}
      elementPath="background"
      currentValue={background}
      isEditMode={isEditMode}
      onEdit={onEdit}
    >
      <div className={`relative w-full overflow-hidden h-[500px] sm:h-[600px] md:h-[700px] lg:h-[800px]`} style={getBackgroundStyle(background)}>
        {isPreview ? (
          <div className="w-full h-full">
            {content.images && content.images[0] && renderSlideContent(content.images[0], 0)}
          </div>
        ) : (
          <Swiper
            key={isEditMode ? 'edit' : 'view'}
            modules={CAROUSEL_MODULES}
            navigation={settings.showArrows}
            pagination={settings.showDots ? { clickable: true } : false}
            autoplay={settings.autoPlay ? { delay: settings.interval, disableOnInteraction: false } : false}
            loop={settings.infinite}
            effect={settings.transition === 'fade' ? 'fade' : 'slide'}
            className="h-full"
            onSwiper={setSwiper}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
          >
            {content.images?.map((image, index) => (
              <SwiperSlide key={index}>
                {renderSlideContent(image, index)}
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {isEditMode && (
          <>
            {/* Manual Slide Controls for Editor */}
            <div 
                className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 bg-white rounded shadow-lg p-1 border border-gray-200 pointer-events-auto"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
            >
                <button 
                    type="button"
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if (swiper) swiper.slidePrev();
                    }}
                    className="p-1 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                    title="Previous Slide"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-bold min-w-[3rem] text-center text-gray-700 select-none">
                    {activeIndex + 1} / {content.images?.length || 0}
                </span>
                <button
                    type="button"
                    onClick={(e) => { 
                        e.stopPropagation(); 
                        if (swiper) swiper.slideNext();
                    }}
                    className="p-1 hover:bg-gray-100 rounded text-gray-700 transition-colors"
                    title="Next Slide"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit({
                  type: 'hero-slides',
                  sectionId,
                  elementPath: 'content.images',
                  currentValue: content.images || [],
                  sectionContent: content, // Pass full content for global editing
                });
              }}
              className="absolute top-4 right-4 z-[100] bg-white text-black px-4 py-2 rounded shadow-lg font-bold hover:bg-gray-100 flex items-center gap-2 pointer-events-auto"
            >
              Manage Slides
            </button>
          </>
        )}
      </div>
    </EditableWrapper>
  );
};
