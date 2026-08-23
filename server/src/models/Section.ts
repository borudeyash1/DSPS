import mongoose, { Schema, Document } from 'mongoose';

export interface ISection extends Document {
    _id: mongoose.Types.ObjectId;
    name: string;
    type: 'hero' | 'product-grid' | 'product-carousel' | 'category-cards' | 'image-banner' | 'video' | 'text-block' | 'custom' | 'split-hero-carousel' | 'new-arrivals-showcase' | 'jockey-new-arrivals' | 'essentials-category-grid' | 'prime-selections' | 'colossal-carousel' | 'colossal-static-grid' | 'slide-into-colors' | 'blog-grid' | 'image-text-split' | 'headline-bar';
    order: number;
    isActive: boolean;
    page?: 'homepage' | 'blog' | 'men'; // Page identifier

    // Layout Properties
    layout: {
        width: 'full' | 'container' | 'custom';
        customWidth?: string;
        height: 'auto' | 'fixed' | 'viewport';
        customHeight?: string;
        padding: string;
        margin: string;
        backgroundColor: string;
        backgroundImage?: string;
        backgroundGradient?: string;
        borderRadius: string;
    };
    background?: any;

    // Content
    content: {
        heading?: string;
        headingStyle?: {
            fontSize: string;
            fontWeight: string;
            color: string;
            textAlign: 'left' | 'center' | 'right';
        };
        subheading?: string;
        subheadingStyle?: {
            fontSize: string;
            color: string;
        };
        description?: string;
        backgroundImage?: string;
        mainImage?: string | { url: string; alt?: string };
        images?: Array<{
            url: string;
            alt: string;
            link?: string;
        }>;
        videos?: Array<{
            url: string;
            thumbnail?: string;
            autoplay?: boolean;
            loop?: boolean;
            muted?: boolean;
            controls?: boolean;
        }>;
        video?: {
            url: string;
            thumbnail?: string;
            autoplay?: boolean;
            loop?: boolean;
            muted?: boolean;
            controls?: boolean;
        };
        cta?: {
            text: string;
            link: string;
            style: string;
        };
        customHtml?: string;
        products?: any;
        hotspots?: Array<{
            productId: string;
            position: {
                x: number;
                y: number;
            };
        }>;
        blogIds?: string[];
        count?: number;
    };

    // Grid/Carousel Settings
    gridSettings?: {
        columns: number;
        gap: string;
        itemsPerRow: {
            mobile: number;
            tablet: number;
            desktop: number;
        };
    };

    carouselSettings?: {
        autoPlay: boolean;
        interval: number;
        showArrows: boolean;
        showDots: boolean;
        infinite: boolean;
    };

    // Styling
    styling: {
        textColor: string;
        borderColor?: string;
        borderWidth?: string;
        boxShadow?: string;
        hoverEffect?: string;
        customCSS?: string;
    };

    // Behavior
    behavior: {
        animateOnScroll: boolean;
        animation?: 'fade' | 'slide' | 'zoom' | 'none';
        clickAction?: 'link' | 'modal' | 'none';
        link?: string;
    };

    // Products (for product sections)
    products?: mongoose.Types.ObjectId[];
    productFilter?: {
        category?: string;
        tags?: string[];
        featured?: boolean;
        newArrivals?: boolean;
        bestSellers?: boolean;
        limit?: number;
    };

    // Multi-Component Support (NEW)
    components?: Array<{
        id: string;
        type: 'hero' | 'product-grid' | 'product-carousel' | 'category-cards' | 'image-banner' | 'video' | 'text-block' | 'custom' | 'split-hero-carousel' | 'new-arrivals-showcase' | 'jockey-new-arrivals' | 'image-text-split' | 'headline-bar';
        layout: {
            width: string; // e.g., '50%', '100%', '300px'
            height: string;
            order: number; // For flex/grid ordering
        };
        content: any; // Component-specific content
        settings: any; // Component-specific settings (carousel, grid, etc.)
    }>;

    // Section Layout (for multi-component sections)
    sectionLayout?: {
        direction: 'horizontal' | 'vertical';
        display: 'flex' | 'grid';
        gridColumns?: number;
        gridRows?: number;
        gap: string;
        alignItems?: 'start' | 'center' | 'end' | 'stretch';
        justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
    };

    // Blog-specific fields
    layoutStyle?: 'standard-grid' | 'masonry' | 'carousel' | 'list';
    blogs?: Array<{
        blog: mongoose.Types.ObjectId;
        order: number;
    }>;

    createdAt: Date;
    updatedAt: Date;
}

const SectionSchema = new Schema<ISection>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['hero', 'product-grid', 'product-carousel', 'category-cards', 'image-banner', 'video', 'text-block', 'custom', 'split-hero-carousel', 'new-arrivals-showcase', 'jockey-new-arrivals', 'essentials-category-grid', 'prime-selections', 'colossal-carousel', 'colossal-static-grid', 'slide-into-colors', 'blog-grid', 'image-text-split', 'headline-bar'],
            required: true,
        },
        order: {
            type: Number,
            required: true,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        page: {
            type: String,
            enum: ['homepage', 'blog', 'men'],
            default: 'homepage',
        },
        layout: {
            width: {
                type: String,
                enum: ['full', 'container', 'custom'],
                default: 'container',
            },
            customWidth: String,
            height: {
                type: String,
                enum: ['auto', 'fixed', 'viewport'],
                default: 'auto',
            },
            customHeight: String,
            padding: {
                type: String,
                default: '0',
            },
            margin: {
                type: String,
                default: '0',
            },
            backgroundColor: {
                type: String,
                default: '#ffffff',
            },
            backgroundImage: String,
            backgroundGradient: String,
            borderRadius: {
                type: String,
                default: '0',
            },
        },
        background: Schema.Types.Mixed,
        content: {
            heading: String,
            headingStyle: {
                fontSize: {
                    type: String,
                    default: '2rem',
                },
                fontWeight: {
                    type: String,
                    default: 'bold',
                },
                color: {
                    type: String,
                    default: '#000000',
                },
                textAlign: {
                    type: String,
                    enum: ['left', 'center', 'right'],
                    default: 'left',
                },
            },
            subheading: String,
            subheadingStyle: {
                fontSize: {
                    type: String,
                    default: '1rem',
                },
                color: {
                    type: String,
                    default: '#666666',
                },
            },
            description: String,
            text: String,
            speed: Number,
            direction: String,
            textColor: String,
            backgroundImage: String,
            mainImage: Schema.Types.Mixed,
            images: [
                {
                    url: String,
                    alt: String,
                    link: String,
                    heading: String,
                    subheading: String,
                    cta: {
                        text: String,
                        link: String,
                        bgColor: String,
                        textColor: String,
                        borderRadius: Number,
                        padding: {
                            top: Number,
                            right: Number,
                            bottom: Number,
                            left: Number,
                        }
                    },
                    urlStyle: Schema.Types.Mixed,
                },
            ],
            videos: [
                {
                    url: String,
                    thumbnail: String,
                    autoplay: Boolean,
                    loop: Boolean,
                    muted: Boolean,
                    controls: Boolean,
                },
            ],
            video: {
                url: String,
                thumbnail: String,
                autoplay: Boolean,
                loop: Boolean,
                muted: Boolean,
                controls: Boolean,
            },
            cta: {
                text: String,
                link: String,
                style: String,
            },
            customHtml: String,
            products: {
                type: Schema.Types.Mixed,
            },
            hotspots: [{
                productId: {
                    type: String,
                    required: false,
                },
                position: {
                    x: {
                        type: Number,
                        required: false,
                    },
                    y: {
                        type: Number,
                        required: false,
                    },
                },
            }],
            blogIds: [String],
            count: Number,
        },
        gridSettings: {
            columns: {
                type: Number,
                default: 4,
            },
            gap: {
                type: String,
                default: '1rem',
            },
            itemsPerRow: {
                mobile: {
                    type: Number,
                    default: 1,
                },
                tablet: {
                    type: Number,
                    default: 2,
                },
                desktop: {
                    type: Number,
                    default: 4,
                },
            },
        },
        carouselSettings: {
            autoPlay: {
                type: Boolean,
                default: true,
            },
            interval: {
                type: Number,
                default: 5000,
            },
            showArrows: {
                type: Boolean,
                default: true,
            },
            showDots: {
                type: Boolean,
                default: true,
            },
            infinite: {
                type: Boolean,
                default: true,
            },
        },
        styling: {
            textColor: {
                type: String,
                default: '#000000',
            },
            borderColor: String,
            borderWidth: String,
            boxShadow: String,
            hoverEffect: String,
            customCSS: String,
        },
        behavior: {
            animateOnScroll: {
                type: Boolean,
                default: false,
            },
            animation: {
                type: String,
                enum: ['fade', 'slide', 'zoom', 'none'],
                default: 'none',
            },
            clickAction: {
                type: String,
                enum: ['link', 'modal', 'none'],
                default: 'none',
            },
            link: String,
        },
        products: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Product',
            },
        ],
        productFilter: {
            category: String,
            tags: [String],
            featured: Boolean,
            newArrivals: Boolean,
            bestSellers: Boolean,
            limit: Number,
        },
        components: [
            {
                id: String,
                type: {
                    type: String,
                    enum: ['hero', 'product-grid', 'product-carousel', 'category-cards', 'image-banner', 'video', 'text-block', 'custom', 'split-hero-carousel', 'new-arrivals-showcase', 'jockey-new-arrivals', 'essentials-category-grid', 'prime-selections', 'colossal-carousel', 'colossal-static-grid', 'slide-into-colors', 'blog-grid', 'image-text-split', 'headline-bar'],
                },
                layout: {
                    width: String,
                    height: String,
                    order: Number,
                },
                content: Schema.Types.Mixed,
                settings: Schema.Types.Mixed,
            },
        ],
        sectionLayout: {
            direction: {
                type: String,
                enum: ['horizontal', 'vertical'],
                default: 'vertical',
            },
            display: {
                type: String,
                enum: ['flex', 'grid'],
                default: 'flex',
            },
            gridColumns: Number,
            gridRows: Number,
            gap: {
                type: String,
                default: '1rem',
            },
            alignItems: {
                type: String,
                enum: ['start', 'center', 'end', 'stretch'],
            },
            justifyContent: {
                type: String,
                enum: ['start', 'center', 'end', 'space-between', 'space-around'],
            },
        },
        layoutStyle: {
            type: String,
            enum: ['standard-grid', 'masonry', 'carousel', 'list'],
            default: 'standard-grid',
        },
        blogs: [
            {
                blog: {
                    type: Schema.Types.ObjectId,
                    ref: 'Blog',
                },
                order: {
                    type: Number,
                    default: 0,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Index for ordering
SectionSchema.index({ order: 1, isActive: 1 });

const Section = mongoose.model<ISection>('Section', SectionSchema);

export default Section;
