import mongoose, { Document, Schema } from 'mongoose';

export interface ICategory extends Document {
    name: string;
    slug: string;
    subcategories: Array<{
        name: string;
        slug: string;
        types: string[];
    }>;
    createdAt: Date;
    updatedAt: Date;
}

const categorySchema = new Schema<ICategory>({
    name: {
        type: String,
        required: [true, 'Category name is required'],
        trim: true,
        unique: true
    },
    slug: {
        type: String,
        required: [true, 'Category slug is required'],
        trim: true,
        unique: true,
        lowercase: true
    },
    subcategories: [{
        name: {
            type: String,
            required: true,
            trim: true
        },
        slug: {
            type: String,
            required: true,
            trim: true,
            lowercase: true
        },
        types: [{
            type: String,
            trim: true
        }]
    }]
}, {
    timestamps: true
});

// Indexes for better query performance

categorySchema.index({ 'subcategories.slug': 1 });

export default mongoose.model<ICategory>('Category', categorySchema);
