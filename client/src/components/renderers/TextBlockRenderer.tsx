import { motion } from 'framer-motion';
import { EditableWrapper } from '../editor/EditableWrapper';

interface TextBlockProps {
  sectionId?: string;
  content?: {
    heading?: string;
    headingStyle?: any;
    subheading?: string;
    subheadingStyle?: any;
    description?: string;
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
  layout?: {
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

export const TextBlockRenderer = ({
  sectionId = '',
  content,
  background,

  isEditMode = false,
  onEdit = () => { },
}: TextBlockProps) => {
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
        className="w-full py-16 px-4"
        style={getBackgroundStyle(background)}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
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
                    fontSize: content.headingStyle?.fontSize || 'clamp(2rem, 5vw, 3.5rem)',
                    fontWeight: content.headingStyle?.fontWeight || 'bold',
                    color: content.headingStyle?.color || '#000000',
                    textAlign: content.headingStyle?.textAlign || 'center',
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
                    fontSize: content.subheadingStyle?.fontSize || '1.25rem',
                    color: content.subheadingStyle?.color || '#666666',
                  }}
                >
                  {content.subheading}
                </p>
              </EditableWrapper>
            )}

            {content?.description && (
              <EditableWrapper
                type="text"
                sectionId={sectionId}
                elementPath="content.description"
                currentValue={content.description}
                isEditMode={isEditMode}
                onEdit={onEdit}
              >
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  {content.description}
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
                  className="inline-block font-medium hover:opacity-90 transition-all"
                  style={{
                    backgroundColor: content.cta.bgColor || '#000000',
                    color: content.cta.textColor || '#ffffff',
                    borderRadius: `${content.cta.borderRadius || 4}px`,
                    padding: `${content.cta.padding?.top || 12}px ${content.cta.padding?.right || 32}px ${content.cta.padding?.bottom || 12}px ${content.cta.padding?.left || 32}px`,
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
