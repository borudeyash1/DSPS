import mongoose, { Document, Schema } from 'mongoose';

export interface ICoupon extends Document {
    code: string;
    type: 'fixed' | 'percentage';
    value: number; // Amount in rupees or percentage value (0-100)
    minOrderAmount?: number;
    maxDiscountAmount?: number; // Only for percentage type
    expirationDate?: Date;
    usageLimit?: number; // Max times this coupon can be used total
    usedCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const couponSchema = new Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        type: {
            type: String,
            enum: ['fixed', 'percentage'],
            required: true,
        },
        value: {
            type: Number,
            required: true,
            min: 0,
        },
        minOrderAmount: {
            type: Number,
            default: 0,
        },
        maxDiscountAmount: {
            type: Number,
        },
        expirationDate: {
            type: Date,
        },
        usageLimit: {
            type: Number,
        },
        usedCount: {
            type: Number,
            default: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<ICoupon>('Coupon', couponSchema);
