import mongoose, { Schema, Document } from 'mongoose';

export interface ICategoryPageSection extends Document {
    category: 'men';
    type: 'hero' | 'banner' | 'featured-products' | 'image-grid' | 'video' | 'text-block';
    title: string;
    order: number;
    isActive: boolean;
    config: {
        // Hero
        heroImage?: string;
        heroTitle?: string;
        heroSubtitle?: string;
        heroOverlay?: boolean;
        heroButton?: {
            text: string;
            link: string;
        };

        // Banner
        bannerImage?: string;
        bannerText?: string;
        bannerLink?: string;
        bannerPosition?: 'left' | 'center' | 'right';

        // Featured Products
        productIds?: string[];
        showPrice?: boolean;
        columns?: number;

        // Image Grid
        images?: Array<{
            url: string;
            title?: string;
            link?: string;
        }>;
        gridLayout?: '2x2' | '3x3' | '4x2';

        // Video
        videoUrl?: string;
        videoThumbnail?: string;
        autoplay?: boolean;
        videoTitle?: string;
        videoDescription?: string;

        // Text Block
        content?: string;
        alignment?: 'left' | 'center' | 'right';
        backgroundColor?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const CategoryPageSectionSchema: Schema = new Schema(
    {
        category: {
            type: String,
            required: true,
            enum: ['men'],
        },
        type: {
            type: String,
            required: true,
            enum: ['hero', 'banner', 'featured-products', 'image-grid', 'video', 'text-block'],
        },
        title: {
            type: String,
            required: true,
            trim: true,
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
        config: {
            // Hero
            heroImage: String,
            heroTitle: String,
            heroSubtitle: String,
            heroOverlay: {
                type: Boolean,
                default: true,
            },
            heroButton: {
                text: String,
                link: String,
            },

            // Banner
            bannerImage: String,
            bannerText: String,
            bannerLink: String,
            bannerPosition: {
                type: String,
                enum: ['left', 'center', 'right'],
                default: 'center',
            },

            // Featured Products
            productIds: [String],
            showPrice: {
                type: Boolean,
                default: true,
            },
            columns: {
                type: Number,
                default: 4,
            },

            // Image Grid
            images: [{
                url: String,
                title: String,
                link: String,
            }],
            gridLayout: {
                type: String,
                enum: ['2x2', '3x3', '4x2'],
                default: '2x2',
            },

            // Video
            videoUrl: String,
            videoThumbnail: String,
            autoplay: {
                type: Boolean,
                default: false,
            },
            videoTitle: String,
            videoDescription: String,

            // Text Block
            content: String,
            alignment: {
                type: String,
                enum: ['left', 'center', 'right'],
                default: 'center',
            },
            backgroundColor: {
                type: String,
                default: '#ffffff',
            },
        },
    },
    {
        timestamps: true,
    }
);

// Index for category and ordering
CategoryPageSectionSchema.index({ category: 1, order: 1, isActive: 1 });

export default mongoose.model<ICategoryPageSection>('CategoryPageSection', CategoryPageSectionSchema);
