import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedBlog extends Document {
    user: mongoose.Types.ObjectId;
    blog: mongoose.Types.ObjectId;
    savedAt: Date;
}

const SavedBlogSchema: Schema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        blog: {
            type: Schema.Types.ObjectId,
            ref: 'Blog',
            required: true,
            index: true
        },
        savedAt: {
            type: Date,
            default: Date.now,
            index: true
        }
    },
    {
        timestamps: true
    }
);

// Compound unique index to prevent duplicate saves
SavedBlogSchema.index({ user: 1, blog: 1 }, { unique: true });

export default mongoose.model<ISavedBlog>('SavedBlog', SavedBlogSchema);
