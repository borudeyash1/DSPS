import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { EditableWrapper } from '../editor/EditableWrapper';

interface CategoryCardsProps {
  sectionId?: string;
  content?: {
    heading?: string;
    headingStyle?: any;
    images?: Array<{ url: string; alt: string; link?: string }>;
  };
  background?: any;
  gridSettings?: {
    columns?: number;
    gap?: string;
    itemsPerRow?: {
      mobile?: number;
      tablet?: number;
      desktop?: number;
    };
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

export const CategoryCardsRenderer = ({
  sectionId = '',
  content,
  background,
  gridSettings,
  isEditMode = false,
  onEdit = () => { },
}: CategoryCardsProps) => {
  const categories = content?.images?.length
    ? content.images
    : [
      { url: 'https://placehold.co/400x500/667eea/ffffff?text=Men', alt: 'Men', link: '/products/men' },
    ];

  const itemsPerRow = {
    mobile: gridSettings?.itemsPerRow?.mobile ?? 1,
    tablet: gridSettings?.itemsPerRow?.tablet ?? 2,
    desktop: gridSettings?.itemsPerRow?.desktop ?? 3,
  };

  const gap = gridSettings?.gap || '24px';

  return (
    <EditableWrapper
      type="background"
      sectionId={sectionId}
      elementPath="background"
      currentValue={background}
      isEditMode={isEditMode}
      onEdit={onEdit}
    >
      <div className="w-full py-16 px-4" style={getBackgroundStyle(background)}>
        <div className="max-w-7xl mx-auto">
          {content?.heading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
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
                    fontSize: content.headingStyle?.fontSize || 'clamp(1.5rem, 5vw, 2.5rem)',
                    fontWeight: content.headingStyle?.fontWeight || 'bold',
                    color: content.headingStyle?.color || '#000000',
                  }}
                >
                  {content.heading}
                </h2>
              </EditableWrapper>
            </motion.div>
          )}

          <div
            className="grid grid-dynamic"
            style={{
              gridTemplateColumns: `repeat(${itemsPerRow.mobile}, minmax(0, 1fr))`,
              gap: gap,
            }}
          >
            {categories.map((category, index) => (
              <motion.a
                key={index}
                href={category.link}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="group relative overflow-hidden rounded-lg shadow-lg cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden">
                  <EditableWrapper
                    type="image"
                    sectionId={sectionId}
                    elementPath={`content.images[${index}].url`}
                    currentValue={category.url}
                    isEditMode={isEditMode}
                    onEdit={onEdit}
                  >
                    <img
                      src={category.url}
                      alt={category.alt}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </EditableWrapper>
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6">
                  <div className="w-full">
                    <h3 className="text-white text-3xl font-bold mb-2">{category.alt}</h3>
                    <div className="flex items-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium mr-2">SHOP NOW</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>

          <style>{`
            @media (min-width: 768px) {
              .grid-dynamic {
                grid-template-columns: repeat(${itemsPerRow.tablet}, minmax(0, 1fr)) !important;
              }
            }
            @media (min-width: 1024px) {
              .grid-dynamic {
                grid-template-columns: repeat(${itemsPerRow.desktop}, minmax(0, 1fr)) !important;
              }
            }
          `}</style>
        </div>
      </div>
    </EditableWrapper>
  );
};
