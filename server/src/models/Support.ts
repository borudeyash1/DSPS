import mongoose, { Document, Schema } from 'mongoose';

export interface ISupport extends Document {
    phoneNumber: string;
    email: string;
    hours: string; // e.g., "10:00 AM - 6:00 PM"
    isActive: boolean;
}

const supportSchema = new Schema<ISupport>({
    phoneNumber: {
        type: String,
        required: true
    },
    email: {
        type: String,
        default: ''
    },
    hours: {
        type: String,
        default: '10:00 AM - 6:00 PM'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

export default mongoose.model<ISupport>('Support', supportSchema);
