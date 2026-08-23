import mongoose, { Schema, Document } from 'mongoose';

export interface IBlogSection extends Document {
    type: 'hero' | 'featured-grid' | 'blog-list' | 'category-filter' | 'newsletter';
    title: string;
    order: number;
    isActive: boolean;
    config: {
        // Hero Banner
        heroImage?: string;
        heroTitle?: string;
        heroSubtitle?: string;
        heroButton?: {
            text: string;
            link: string;
        };

        // Featured Grid
        featuredBlogs?: string[];
        gridColumns?: number;

        // Blog List
        showCategories?: boolean;
        postsPerPage?: number;
        layout?: 'grid' | 'list' | 'masonry';

        // Category Filter
        categories?: string[];

        // Newsletter
        newsletterTitle?: string;
        newsletterDescription?: string;
        newsletterPlaceholder?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const BlogSectionSchema: Schema = new Schema(
    {
        type: {
            type: String,
            required: true,
            enum: ['hero', 'featured-grid', 'blog-list', 'category-filter', 'newsletter'],
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
            // Hero Banner
            heroImage: String,
            heroTitle: String,
            heroSubtitle: String,
            heroButton: {
                text: String,
                link: String,
            },

            // Featured Grid
            featuredBlogs: [String],
            gridColumns: {
                type: Number,
                default: 3,
            },

            // Blog List
            showCategories: {
                type: Boolean,
                default: true,
            },
            postsPerPage: {
                type: Number,
                default: 9,
            },
            layout: {
                type: String,
                enum: ['grid', 'list', 'masonry'],
                default: 'grid',
            },

            // Category Filter
            categories: [String],

            // Newsletter
            newsletterTitle: String,
            newsletterDescription: String,
            newsletterPlaceholder: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for ordering
BlogSectionSchema.index({ order: 1, isActive: 1 });

export default mongoose.model<IBlogSection>('BlogSection', BlogSectionSchema);
