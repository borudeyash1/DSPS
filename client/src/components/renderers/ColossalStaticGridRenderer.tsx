import { motion } from 'framer-motion';
import { EditableWrapper } from '../editor/EditableWrapper';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Link as LinkIcon } from 'lucide-react';

interface ColossalStaticGridProps {
    sectionId?: string;
    content?: {
        heading?: string;
        headingStyle?: any;
        subheading?: string;
        subheadingStyle?: any;
        products?: any[];
    };
    background?: any;
    gridSettings?: {
        gap?: string;
        columns?: number;
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

export const ColossalStaticGridRenderer = ({
    sectionId = '',
    content,
    background,
    gridSettings,
    isEditMode = false,
    onEdit = () => { },
}: ColossalStaticGridProps) => {
    const navigate = useNavigate();

    // Mock data based on the screenshots provided by user (Image 4)
    const defaultItems = [
        {
            id: 1,
            name: 'Face Masks',
            image: 'https://images.unsplash.com/photo-1586942593568-29361efcd571?w=600&q=80',
            bgColor: '#E6C66B', // Yellow-ish
            link: '/category/masks'
        },
        {
            id: 2,
            name: 'Towels',
            image: 'https://images.unsplash.com/photo-1583541285327-1422c5493012?w=600&q=80',
            bgColor: '#D9D9D9', // Grey-ish
            link: '/category/towels'
        },
        {
            id: 3,
            name: 'Socks',
            image: 'https://images.unsplash.com/photo-1586350977771-b3b0abd50c82?w=600&q=80',
            bgColor: '#E09267', // Orange-ish
            link: '/category/socks'
        },
        {
            id: 4,
            name: 'Handkerchiefs',
            image: 'https://images.unsplash.com/photo-1589363360147-4f2d5154a541?w=600&q=80',
            bgColor: '#333333', // Dark
            link: '/category/handkerchiefs'
        },
        {
            id: 5,
            name: 'Caps',
            image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&q=80',
            bgColor: '#4A4A4A', // Dark Grey
            link: '/category/caps'
        }
    ];

    // Use content.products if available, otherwise fallback to defaultItems only if content is missing
    const displayItems = content?.products ? content.products : defaultItems;

    const handleItemClick = (item: any) => {
        if (isEditMode) return;
        if (item.link) navigate(item.link);
    };

    const handleAddCard = () => {
        const newCard = {
            id: Date.now(),
            name: 'New Item',
            image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&q=80',
            bgColor: '#f3f4f6',
            link: '/category/new'
        };

        const updatedProducts = [...displayItems, newCard];
        
        // Directly save without opening PropertyPanel
        if (onEdit) {
            // Call onEdit with a special structure that triggers immediate save
            const element = {
                type: 'array',
                sectionId,
                elementPath: 'content.products',
                currentValue: updatedProducts,
            };
            
            // We need to call the parent's save function directly
            // Since we don't have access to onSave, we'll use a workaround
            // by triggering the edit which will be handled by PropertyPanel
            onEdit(element);
        }
    };

    const handleDeleteCard = (index: number) => {
        if (!confirm('Are you sure you want to delete this card?')) return;
        
        const updatedProducts = displayItems.filter((_, i) => i !== index);
        
        // Directly save without opening PropertyPanel
        if (onEdit) {
            const element = {
                type: 'array',
                sectionId,
                elementPath: 'content.products',
                currentValue: updatedProducts,
            };
            
            onEdit(element);
        }
    };

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
                <div className="max-w-[1600px] mx-auto">
                    {content?.heading && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
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
                                    className="uppercase tracking-wider mb-3"
                                    style={{
                                        fontSize: content.headingStyle?.fontSize || 'clamp(1.5rem, 5vw, 2.5rem)',
                                        fontWeight: content.headingStyle?.fontWeight || '800',
                                        color: content.headingStyle?.color || '#000000',
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
                                    currentStyle={content.subheadingStyle}
                                    isEditMode={isEditMode}
                                    onEdit={onEdit}
                                >
                                    <p className="text-xl text-gray-600 font-medium tracking-wide uppercase">{content.subheading}</p>
                                </EditableWrapper>
                            )}
                        </motion.div>
                    )}

                    <div
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8"
                        style={{ gap: gridSettings?.gap || '32px' }}
                    >
                        {displayItems.map((item, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -10, scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                                className="relative rounded-2xl overflow-hidden shadow-lg cursor-pointer h-[400px] group"
                                onClick={() => handleItemClick(item)}
                            >
                                {/* Delete Button (Edit Mode Only) */}
                                {isEditMode && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDeleteCard(index);
                                        }}
                                        className="absolute top-2 left-2 z-20 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                        title="Delete Card"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}

                                {/* Link Edit Button (Edit Mode Only) */}
                                {isEditMode && (
                                    <div className="absolute top-2 left-14 z-20">
                                        <EditableWrapper
                                            type="link"
                                            sectionId={sectionId}
                                            elementPath={`content.products.${index}.link`}
                                            currentValue={item.link}
                                            isEditMode={true}
                                            onEdit={onEdit}
                                        >
                                            <div className="bg-indigo-500 hover:bg-indigo-600 text-white p-2 rounded-full shadow-lg transition-colors cursor-pointer flex items-center justify-center">
                                                <LinkIcon className="w-4 h-4" />
                                            </div>
                                        </EditableWrapper>
                                    </div>
                                )}

                                {/* Editable Background Image */}
                                <EditableWrapper
                                    type="image"
                                    sectionId={sectionId}
                                    elementPath={`content.products.${index}.image`}
                                    currentValue={item.image}
                                    isEditMode={isEditMode}
                                    onEdit={onEdit}
                                >
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                                        style={{
                                            backgroundColor: item.bgColor || '#f3f4f6',
                                            backgroundImage: item.image ? `url("${item.image}")` : 'none',
                                            backgroundBlendMode: 'normal', // Changed from 'overlay' to 'normal'
                                            opacity: 1 // Ensure full opacity
                                        }}
                                    >
                                        {/* Fallback image if background image fails or isn't set */}
                                        {!item.image && (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                No Image
                                            </div>
                                        )}
                                    </div>
                                </EditableWrapper>

                                {/* Gradient Overlay for text readability - reduced opacity */}
                                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/50" />

                                {/* Editable Item Name */}
                                <div className="absolute top-8 left-0 right-0 text-center z-10 p-4">
                                    <EditableWrapper
                                        type="text"
                                        sectionId={sectionId}
                                        elementPath={`content.products.${index}.name`}
                                        currentValue={item.name}
                                        isEditMode={isEditMode}
                                        onEdit={onEdit}
                                    >
                                        <h3 className="text-2xl font-bold text-white uppercase tracking-wider drop-shadow-md">
                                            {item.name}
                                        </h3>
                                    </EditableWrapper>
                                </div>

                                {/* Product image - centered floating effect (optional, if we want separate from bg) */}
                                {/* For this specific design, it looks like a card with background color + product image floating */}
                                <div className="absolute inset-0 flex items-center justify-center p-8 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    {/* We assume the 'image' property is the background or main image. 
                                        If user wants specific floating product, we might need separate fields. 
                                        For now, using the image as background is safer. */}
                                </div>

                            </motion.div>
                        ))}

                        {/* Add Card Button (Edit Mode Only) */}
                        {isEditMode && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleAddCard}
                                className="relative rounded-2xl overflow-hidden shadow-lg h-[400px] border-4 border-dashed border-gray-300 hover:border-blue-500 bg-gray-50 hover:bg-blue-50 transition-all flex flex-col items-center justify-center gap-4 group"
                            >
                                <div className="bg-blue-500 group-hover:bg-blue-600 text-white p-4 rounded-full transition-colors">
                                    <Plus className="w-8 h-8" />
                                </div>
                                <p className="text-gray-600 group-hover:text-blue-600 font-semibold text-lg transition-colors">
                                    Add New Card
                                </p>
                            </motion.button>
                        )}
                    </div>
                </div>
            </div>
        </EditableWrapper>
    );
};
