import mongoose, { Schema, Document } from 'mongoose';

export interface IAllowedDevice extends Document {
    deviceId: string;
    deviceName: string;
    deviceType: 'admin' | 'trusted';
    userAgent?: string;
    platform?: string;
    lastAccess?: Date;
    ipAddress?: string;
    location?: string;
    runtime?: 'browser' | 'desktop' | 'mobile';
    source?: 'web' | 'desktop' | 'mobile';
    loginAttempts: number;
    failedAttempts: number;
    lastFailedAttempt?: Date;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
    isBlacklisted: boolean;
    blacklistReason?: string;
    isActive: boolean;
    addedBy: string;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}

const allowedDeviceSchema = new Schema<IAllowedDevice>({
    deviceId: {
        type: String,
        required: [true, 'Device ID is required'],
        unique: true,
        trim: true,
        index: true
    },
    deviceName: {
        type: String,
        required: [true, 'Device name is required'],
        trim: true
    },
    deviceType: {
        type: String,
        enum: ['admin', 'trusted'],
        default: 'admin',
        required: true
    },
    userAgent: {
        type: String,
        trim: true
    },
    platform: {
        type: String,
        trim: true
    },
    lastAccess: {
        type: Date
    },
    ipAddress: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    runtime: {
        type: String,
        enum: ['browser', 'desktop', 'mobile'],
        default: 'browser'
    },
    source: {
        type: String,
        enum: ['web', 'desktop', 'mobile'],
        default: 'web'
    },
    loginAttempts: {
        type: Number,
        default: 0
    },
    failedAttempts: {
        type: Number,
        default: 0
    },
    lastFailedAttempt: {
        type: Date
    },
    riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'low'
    },
    isBlacklisted: {
        type: Boolean,
        default: false
    },
    blacklistReason: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    addedBy: {
        type: String,
        required: true,
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        maxlength: [500, 'Notes cannot exceed 500 characters']
    }
}, {
    timestamps: true
});

// Index for faster queries
allowedDeviceSchema.index({ deviceId: 1, isActive: 1 });
allowedDeviceSchema.index({ deviceType: 1 });

// Method to check if device is allowed
allowedDeviceSchema.statics.isDeviceAllowed = async function (deviceId: string): Promise<boolean> {
    const device = await this.findOne({ deviceId, isActive: true });
    return !!device;
};

// Method to update last access
allowedDeviceSchema.methods.updateLastAccess = function () {
    this.lastAccess = new Date();
    return this.save();
};

const AllowedDevice = mongoose.model<IAllowedDevice>('AllowedDevice', allowedDeviceSchema);

export default AllowedDevice;
