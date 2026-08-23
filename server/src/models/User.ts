import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

const LoginDeviceInfoSchema = new Schema({
    runtime: { type: String, enum: ['browser', 'mobile'], default: 'browser' },
    platform: { type: String },
    userAgent: { type: String },
    language: { type: String },
    timestamp: { type: Date }
}, { _id: false });

const ShippingAddressSchema = new Schema({
    street: {
        type: String,
        required: true,
        trim: true
    },
    city: {
        type: String,
        required: true,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true
    },
    pincode: {
        type: String,
        required: true,
        trim: true
    },
    country: {
        type: String,
        required: true,
        trim: true,
        default: 'India'
    },
    isDefault: {
        type: Boolean,
        default: false
    }
});

const userSchema = new Schema<IUser>({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    password: {
        type: String,
        minlength: [6, 'Password must be at least 6 characters']
    },
    phone: {
        type: String,
        trim: true,
        match: [/^[\d\s\-\(\)\+]+$/, 'Please enter a valid phone number']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        default: 'Other'
    },
    isGenderSelected: {
        type: Boolean,
        default: false
    },
    avatarUrl: {
        type: String,
        trim: true
    },
    loginOTP: {
        type: String,
        select: false
    },
    loginOTPExpires: {
        type: Date,
        select: false
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    emailVerificationOTP: String,
    emailVerificationOTPExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    deletionToken: {
        type: String,
        select: false
    },
    deletionTokenExpires: {
        type: Date,
        select: false
    },
    refreshTokens: [{
        token: String,
        createdAt: {
            type: Date,
            default: Date.now,
            expires: '30d'
        }
    }],
    lastLogin: Date,
    loginHistory: [{
        ipAddress: String,
        userAgent: String,
        runtime: {
            type: String,
            enum: ['browser', 'mobile'],
            default: 'browser'
        },
        deviceInfo: {
            type: LoginDeviceInfoSchema,
            default: undefined
        },
        loginTime: {
            type: Date,
            default: Date.now
        },
        location: {
            country: String,
            city: String,
            region: String
        }
    }],
    isActive: {
        type: Boolean,
        default: true
    },
    // AI Integration fields
    aiInteractionCount: {
        type: Number,
        default: 0
    },
    lastAiInteraction: {
        type: Date
    },
    // E-commerce specific fields
    shippingAddresses: [ShippingAddressSchema],
    wishlist: [{
        type: Schema.Types.ObjectId,
        ref: 'Product'
    }],
    orderHistory: [{
        type: Schema.Types.ObjectId,
        ref: 'Order'
    }]
}, {
    timestamps: true
});

// Indexes for better query performance

userSchema.index({ 'refreshTokens.token': 1 });

// Hash password before saving
userSchema.pre('save', async function (next) {
    const user = this as unknown as IUser;

    // Skip hashing if flag is set (password is already hashed)
    if ((user as any).skipPasswordHash) {
        delete (user as any).skipPasswordHash;
    // @ts-ignore
        return next();
    }

    // Only hash the password if it's new or has been modified
    if (!user.isModified('password') || user.password === undefined) {
    // @ts-ignore
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(12);
        user.password = await bcrypt.hash(user.password as string, salt);
    // @ts-ignore
        next();
    } catch (error) {
    // @ts-ignore
        next(error as Error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) {
        return false;
    }
    return bcrypt.compare(candidatePassword, this.password);
};

// Generate refresh token
userSchema.methods.generateRefreshToken = function (): string {
    const crypto = require('crypto');
    const token = crypto.randomBytes(40).toString('hex');
    this.refreshTokens.push({ token });
    return token;
};

// Remove old refresh tokens
userSchema.methods.removeRefreshToken = function (token: string): void {
    this.refreshTokens = this.refreshTokens.filter((t: any) => t.token !== token);
};

// Transform JSON output
userSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.refreshTokens;
    delete userObject.emailVerificationOTP;
    delete userObject.emailVerificationOTPExpires;
    delete userObject.passwordResetToken;
    delete userObject.passwordResetExpires;
    return userObject;
};

export default mongoose.model<IUser>('User', userSchema);
