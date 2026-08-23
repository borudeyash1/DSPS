import mongoose, { Schema, Document } from 'mongoose';

export interface IBlog extends Document {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    featuredImage: string;
    category: string;
    tags: string[];
    author: {
        name: string;
        avatar?: string;
        bio?: string;
    };
    authorId?: string | Schema.Types.ObjectId;
    readTime: number;
    isPublished: boolean;
    isFeatured: boolean;
    views: number;
    saveCount: number;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    sectionId?: string;
}

const BlogSchema: Schema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        excerpt: {
            type: String,
            required: true,
            maxlength: 300,
        },
        content: {
            type: String,
            required: true,
        },
        featuredImage: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
            enum: ['fashion', 'lifestyle', 'tips', 'news', 'trends', 'style'],
            default: 'fashion',
        },
        tags: [{
            type: String,
            trim: true,
        }],
        author: {
            name: {
                type: String,
                required: true,
            },
            avatar: {
                type: String,
            },
            bio: {
                type: String,
            }
        },
        authorId: {
            type: Schema.Types.ObjectId,
            ref: 'Admin',
            index: true
        },
        readTime: {
            type: Number,
            required: true,
            default: 5,
        },
        isPublished: {
            type: Boolean,
            default: false,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        views: {
            type: Number,
            default: 0,
        },
        saveCount: {
            type: Number,
            default: 0,
            index: true
        },
        publishedAt: {
            type: Date,
        },
        sectionId: {
            type: String,
            required: false,
            index: true
        }
    },
    {
        timestamps: true,
    }
);

// Index for search
BlogSchema.index({ title: 'text', excerpt: 'text', content: 'text' });

BlogSchema.index({ category: 1 });
BlogSchema.index({ isPublished: 1, publishedAt: -1 });
BlogSchema.index({ saveCount: -1, publishedAt: -1 }); // For trending algorithm

export default mongoose.model<IBlog>('Blog', BlogSchema);
