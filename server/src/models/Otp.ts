import mongoose, { Document, Schema } from 'mongoose';

export interface IOtp extends Document {
    phoneNumber?: string;
    email?: string;
    otp: string;
    type: 'phone_verification' | 'registration' | 'password_reset' | 'login';
    expiresAt: Date;
    metadata?: any;
    createdAt: Date;
}

const otpSchema = new Schema(
    {
        phoneNumber: {
            type: String,
            required: false,
        },
        email: {
            type: String,
            required: false,
        },
        otp: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: ['phone_verification', 'registration', 'password_reset', 'login'],
            required: true,
            default: 'phone_verification',
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        metadata: {
            type: Schema.Types.Mixed,
            required: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 600, // 10 minutes TTL
        },
    },
    {
        timestamps: true,
    }
);

// Indexes for better query performance
otpSchema.index({ phoneNumber: 1, type: 1 });
otpSchema.index({ email: 1, type: 1 });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Check if model exists before compiling to avoid OverwriteModelError
export default mongoose.models.Otp || mongoose.model<IOtp>('Otp', otpSchema);
