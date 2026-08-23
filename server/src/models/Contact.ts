import mongoose, { Document, Schema } from 'mongoose';

export interface IContact extends Document {
    name: string;
    email: string;
    subject: string;
    message: string;
    ipAddress: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const contactSchema = new Schema<IContact>(
    {
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        email: {
            type: String,
            required: [true, 'Email is required'],
            trim: true,
            lowercase: true,
        },
        subject: {
            type: String,
            required: [true, 'Subject is required'],
            trim: true,
        },
        message: {
            type: String,
            required: [true, 'Message is required'],
            trim: true,
        },
        ipAddress: {
            type: String,
            select: false, // Don't return by default
        },
        isRead: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// TTL Index: Delete documents 7 days (604800 seconds) after createdAt
contactSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export const Contact = mongoose.model<IContact>('Contact', contactSchema);
