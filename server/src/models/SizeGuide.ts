import mongoose, { Schema, Document } from 'mongoose';

export interface ISizeGuide extends Document {
    name: string;
    category: string;
    productType: string[];
    description?: string;
    units: string[];
    columns: Array<{
        header: string;
        key: string;
    }>;
    data: Array<Record<string, string>>;
    createdAt: Date;
    updatedAt: Date;
}

const sizeGuideSchema = new Schema<ISizeGuide>({
    name: {
        type: String,
        required: [true, 'Size guide name is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: ['men', 'footwear'],
        lowercase: true
    },
    productType: [{
        type: String,
        required: true,
        trim: true
    }],
    description: {
        type: String,
        trim: true
    },
    units: [{
        type: String,
        enum: ['in', 'cm', 'years'],
        default: ['in']
    }],
    columns: [{
        header: {
            type: String,
            required: true
        },
        key: {
            type: String,
            required: true
        }
    }],
    data: [{
        type: Schema.Types.Mixed,
        required: true
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
sizeGuideSchema.index({ category: 1 });
sizeGuideSchema.index({ productType: 1 });

export default mongoose.model<ISizeGuide>('SizeGuide', sizeGuideSchema);
