import { motion } from 'framer-motion';
import { EditableWrapper } from '../editor/EditableWrapper';

interface ImageTextSplitProps {
    sectionId?: string;
    content?: {
        heading?: string;
        headingStyle?: any;
        subheading?: string;
        subheadingStyle?: any;
        description?: string;
        descriptionStyle?: any;
        image?: string;
        imagePosition?: 'left' | 'right';
        button?: {
            text?: string;
            link?: string;
            style?: any;
        };
    };
    background?: any;
    layout?: {
        imagePosition?: 'left' | 'right';
        contentAlignment?: 'left' | 'center' | 'right';
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

export const ImageTextSplitRenderer = ({
    sectionId = '',
    content,
    background,
    layout,
    isEditMode = false,
    onEdit = () => { },
}: ImageTextSplitProps) => {
    const imagePosition = layout?.imagePosition || content?.imagePosition || 'right';
    const contentAlignment = layout?.contentAlignment || 'left';

    const defaultImage = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80';
    const imageUrl = content?.image || defaultImage;

    return (
        <EditableWrapper
            type="background"
            sectionId={sectionId}
            elementPath="background"
            currentValue={background}
            isEditMode={isEditMode}
            onEdit={onEdit}
        >
            <div className="w-full py-16 px-4" style={{ ...getBackgroundStyle(background), minHeight: '500px' }}>
                <div className="max-w-7xl mx-auto">
                    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${imagePosition === 'left' ? 'lg:flex-row-reverse' : ''}`}>
                        
                        {/* Text Content Side */}
                        <motion.div
                            initial={{ opacity: 0, x: imagePosition === 'left' ? 50 : -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className={`space-y-6 ${imagePosition === 'left' ? 'lg:order-2' : 'lg:order-1'}`}
                            style={{ textAlign: contentAlignment }}
                        >
                            {/* Heading */}
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
                                    <h1
                                        className="font-bold leading-tight"
                                        style={{
                                            fontSize: content.headingStyle?.fontSize || 'clamp(2rem, 5vw, 3.5rem)',
                                            fontWeight: content.headingStyle?.fontWeight || '800',
                                            color: content.headingStyle?.color || '#000000',
                                            textAlign: content.headingStyle?.textAlign || contentAlignment,
                                        }}
                                    >
                                        {content.heading}
                                    </h1>
                                </EditableWrapper>
                            )}

                            {/* Subheading */}
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
                                    <h2
                                        className="font-semibold"
                                        style={{
                                            fontSize: content.subheadingStyle?.fontSize || 'clamp(1.25rem, 3vw, 1.75rem)',
                                            fontWeight: content.subheadingStyle?.fontWeight || '600',
                                            color: content.subheadingStyle?.color || '#333333',
                                            textAlign: content.subheadingStyle?.textAlign || contentAlignment,
                                        }}
                                    >
                                        {content.subheading}
                                    </h2>
                                </EditableWrapper>
                            )}

                            {/* Description */}
                            {content?.description && (
                                <EditableWrapper
                                    type="text"
                                    sectionId={sectionId}
                                    elementPath="content.description"
                                    currentValue={content.description}
                                    currentStyle={content.descriptionStyle}
                                    isEditMode={isEditMode}
                                    onEdit={onEdit}
                                >
                                    <p
                                        className="leading-relaxed"
                                        style={{
                                            fontSize: content.descriptionStyle?.fontSize || '1.125rem',
                                            fontWeight: content.descriptionStyle?.fontWeight || '400',
                                            color: content.descriptionStyle?.color || '#666666',
                                            textAlign: content.descriptionStyle?.textAlign || contentAlignment,
                                        }}
                                    >
                                        {content.description}
                                    </p>
                                </EditableWrapper>
                            )}

                            {/* Button */}
                            {content?.button?.text && (
                                <EditableWrapper
                                    type="button"
                                    sectionId={sectionId}
                                    elementPath="content.button"
                                    currentValue={content.button}
                                    isEditMode={isEditMode}
                                    onEdit={onEdit}
                                >
                                    <a
                                        href={content.button.link || '#'}
                                        className="inline-block px-8 py-4 rounded-lg font-semibold transition-all hover:scale-105 hover:shadow-lg"
                                        style={{
                                            backgroundColor: content.button.style?.bgColor || '#000000',
                                            color: content.button.style?.textColor || '#ffffff',
                                            borderRadius: content.button.style?.borderRadius ? `${content.button.style.borderRadius}px` : '8px',
                                        }}
                                    >
                                        {content.button.text}
                                    </a>
                                </EditableWrapper>
                            )}
                        </motion.div>

                        {/* Image Side */}
                        <motion.div
                            initial={{ opacity: 0, x: imagePosition === 'left' ? -50 : 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className={`${imagePosition === 'left' ? 'lg:order-1' : 'lg:order-2'}`}
                        >
                            <EditableWrapper
                                type="image"
                                sectionId={sectionId}
                                elementPath="content.image"
                                currentValue={imageUrl}
                                isEditMode={isEditMode}
                                onEdit={onEdit}
                            >
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                                    <img
                                        src={imageUrl}
                                        alt={content?.heading || 'Feature image'}
                                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                                        style={{ minHeight: '400px', maxHeight: '600px' }}
                                    />
                                </div>
                            </EditableWrapper>
                        </motion.div>

                    </div>
                </div>
            </div>
        </EditableWrapper>
    );
};
