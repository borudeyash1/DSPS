import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
    product: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    order: mongoose.Types.ObjectId;
    rating: number; // 1-5
    comment?: string;
    images?: string[]; // Optional review images
    isVerifiedPurchase: boolean;
    helpfulCount: number; // How many found this helpful
    createdAt: Date;
    updatedAt: Date;
}

const reviewSchema = new Schema<IReview>({
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true,
    },
    rating: {
        type: Number,
        required: [true, 'Rating is required'],
        min: [1, 'Rating must be at least 1'],
        max: [6, 'Rating cannot exceed 6'],
    },
    comment: {
        type: String,
        maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    images: [{
        type: String,
    }],
    isVerifiedPurchase: {
        type: Boolean,
        default: true,
    },
    helpfulCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});

// Indexes
reviewSchema.index({ product: 1, user: 1, order: 1 }, { unique: true }); // One review per product per order
reviewSchema.index({ product: 1, rating: -1 });
reviewSchema.index({ user: 1 });

export default mongoose.model<IReview>('Review', reviewSchema);
