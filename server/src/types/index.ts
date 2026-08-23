import { Request } from 'express';
import { Document } from 'mongoose';

// Desktop Device Info (for login tracking)
export interface DesktopDeviceInfo {
    runtime?: 'browser' | 'desktop' | 'mobile';
    platform?: string;
    userAgent?: string;
    language?: string;
    timestamp?: Date | string;
}

// User Interface
export interface IUser extends Document {
    fullName: string;
    email: string;
    password?: string;
    phone?: string;
    gender?: 'Male' | 'Female' | 'Other';
    isGenderSelected?: boolean;
    avatarUrl?: string;
    isEmailVerified: boolean;
    emailVerificationOTP?: string;
    emailVerificationOTPExpires?: Date;
    passwordResetToken?: string;
    passwordResetExpires?: Date;
    deletionToken?: string;
    deletionTokenExpires?: Date;
    refreshTokens: Array<{
        token: string;
        createdAt: Date;
    }>;
    lastLogin?: Date;
    loginHistory?: Array<{
        ipAddress: string;
        userAgent: string;
        runtime?: 'browser' | 'mobile';
        deviceInfo?: DesktopDeviceInfo;
        loginTime: Date;
        location: {
            country: string;
            city: string;
            region: string;
        };
    }>;
    isActive: boolean;
    // E-commerce specific fields
    shippingAddresses: Array<{
        _id?: string;
        street: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        isDefault: boolean;
    }>;
    wishlist: string[]; // Product IDs
    orderHistory: string[]; // Order IDs
    loginOTP?: string;
    loginOTPExpires?: Date;
    createdAt: Date;
    updatedAt: Date;
    // AI Integration fields
    aiInteractionCount?: number;
    lastAiInteraction?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    generateRefreshToken(): string;
    removeRefreshToken(token: string): void;
    toJSON(): any;
}

// Admin Interface
export interface IAdmin extends Document {
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
    bio?: string;
    avatar?: string;
    role: 'super-admin' | 'admin' | 'developer';
    isActive: boolean;
    lastLogin?: Date;
    loginOTP?: string;
    loginOTPExpires?: Date;
    shippingAddresses: Array<{
        _id?: string;
        street: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        isDefault: boolean;
    }>;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Product Interface
export interface IProduct extends Document {
    name: string;
    description: string;
    category: 'men';
    subcategory?: string;
    type?: string;
    price: number;
    discountPrice?: number;
    stock: number;
    sizes?: Array<'One Size' | 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL'>;
    colors?: string[];
    // Legacy variants (backward compatibility)
    variants?: Array<{
        size: string;
        color: string;
        price: number;
        discountPrice?: number;
        stock: number;
        sku?: string;
    }>;
    // Legacy images (backward compatibility)
    images?: Array<{
        url: string;
        publicId: string;
        isMain?: boolean;
    }>;
    videos?: Array<{
        url: string;
        publicId: string;
        thumbnail?: string;
    }>;
    // Phase 4: Size Chart
    sizeChart?: {
        image?: string;
        measurements?: Array<{
            size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
            chest?: string;
            length?: string;
            shoulder?: string;
            sleeve?: string;
            waist?: string;
            hip?: string;
        }>;
    };
    // Phase 4: Delivery Information
    deliveryInfo?: {
        estimatedDays: number;
        freeShippingThreshold: number;
        returnPolicy: string;
    };
    // Phase 4: Color Variants
    colorVariants?: Array<{
        color: string;
        colorHex?: string;
        images: Array<{
            view: 'front' | 'back' | 'side' | 'detail' | 'worn';
            url: string;
            alt?: string;
        }>;
        stock?: number;
        sku?: string;
    }>;
    // Phase 4: Available View Angles
    viewAngles?: Array<'front' | 'back' | 'side' | 'detail' | 'worn'>;
    // Product Status
    status?: 'active' | 'coming-soon' | 'inactive';
    // Size Guide Reference
    sizeGuideId?: string;
    isFeatured: boolean;
    isActive: boolean;
    rating?: number;
    reviewCount?: number;
    wishlistCount?: number;
    // Shiprocket Integration: Shipping Information
    shippingInfo?: {
        weight?: number;        // in kg
        length?: number;        // in cm
        breadth?: number;       // in cm
        height?: number;        // in cm
        hsn?: string;          // HSN code for tax
        sku?: string;          // Stock Keeping Unit
        packagingType?: 'poly-bag' | 'box' | 'envelope';
    };
    createdAt: Date;
    updatedAt: Date;
}

// Order Interface
export interface IOrder extends Document {
    user: string; // User ID
    items: Array<{
        product: string; // Product ID
        name: string;
        price: number;
        quantity: number;
        size: string;
        color: string;
        image: string;
        isReviewed?: boolean; // Track if user reviewed this item
        reviewId?: string; // Link to review
    }>;
    shippingAddress: {
        fullName?: string; // Customer name
        street: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        landmark?: string; // Additional landmark
        phone?: string; // Contact number
    };
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';
    paymentStatus: 'pending' | 'completed' | 'failed';
    paymentMethod: 'cod' | 'online';
    paymentDetails?: {
        transactionId?: string;  // HDFC transaction ID
        orderId?: string;        // HDFC order ID
        signature?: string;      // HDFC signature
        method?: string;         // Payment method (upi, card, etc.)
        paidAt?: Date;          // Payment completion timestamp
        status?: string;        // Payment status from HDFC
    };
    trackingNumber?: string;
    // Shiprocket integration fields
    shiprocketOrderId?: number;
    shiprocketShipmentId?: number;
    awbCode?: string;
    courierName?: string;
    shiprocketStatus?: string;
    estimatedDeliveryDate?: Date;
    actualDeliveryDate?: Date;
    courierTrackingUrl?: string;
    rtoStatus?: string;
    pickupScheduledDate?: Date;
    labelUrl?: string;
    manifestUrl?: string;
    notes?: string;
    discountAmount?: number;
    couponCode?: string;
    deliveryOtp?: string;
    createdAt: Date;
    updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
    };
}

// Auth Types
export interface LoginRequest {
    email: string;
    password: string;
    rememberMe?: boolean;
}

export interface RegisterRequest {
    fullName: string;
    email: string;
    phone?: string;
    password: string;
    confirmPassword: string;
    gender?: 'Male' | 'Female' | 'Other';
}

export interface AuthResponse {
    user: IUser;
    accessToken: string;
    refreshToken: string;
}

// Request Types
export interface AuthenticatedRequest extends Request {
    user?: any;
    refreshToken?: string;
    isAdmin?: boolean;
    deviceType?: 'admin' | 'trusted';
    deviceId?: string;
}

// JWT Payload
export interface JWTPayload {
    userId: string;
    email: string;
    type?: string;
    iat?: number;
    exp?: number;
    deviceId?: string;
    deviceType?: string;
}

// File Upload Types
export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
    buffer: Buffer;
}

// Query Types
export interface QueryOptions {
    page?: number;
    limit?: number;
    sort?: string;
    filter?: Record<string, any>;
    search?: string;
}

// Controller Types
export interface ControllerFunction {
    (req: AuthenticatedRequest, res: any): Promise<void>;
}
