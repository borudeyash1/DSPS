import mongoose, { Schema } from 'mongoose';
import { IOrder } from '../types';

const orderSchema = new Schema<IOrder>({
    user: {
        type: mongoose.Schema.Types.ObjectId as any,
        ref: 'User',
        required: [true, 'User is required']
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId as any,
            ref: 'Product',
            required: true
        },
        name: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        size: String,  // Optional
        color: String,  // Optional
        image: String,  // Optional - not all products have images
        isReviewed: {
            type: Boolean,
            default: false
        },
        reviewId: {
            type: mongoose.Schema.Types.ObjectId as any,
            ref: 'Review'
        }
    }],
    shippingAddress: {
        street: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        country: {
            type: String,
            required: true,
            default: 'India'
        }
    },
    totalAmount: {
        type: Number,
        required: [true, 'Total amount is required'],
        min: [0, 'Total amount cannot be negative']
    },
    discountAmount: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['cod', 'online'],
        default: 'cod'
    },
    paymentDetails: {
        type: {
            transactionId: { type: String }, // Renamed from paymentId to match usage
            orderId: { type: String },
            signature: { type: String },
            method: { type: String },
            paidAt: { type: Date }
        },
        required: false
    },
    trackingNumber: {
        type: String,
        trim: true
    },
    // Delivery OTP for prepaid orders
    deliveryOtp: {
        type: String,
        select: false // Hide by default
    },
    // Shiprocket integration fields
    shiprocketOrderId: {
        type: Number
    },
    shiprocketShipmentId: {
        type: Number
    },
    awbCode: {
        type: String,
        trim: true
    },
    courierName: {
        type: String,
        trim: true
    },
    // Enhanced Shiprocket tracking fields
    shiprocketStatus: {
        type: String,
        trim: true
    },
    estimatedDeliveryDate: {
        type: Date
    },
    actualDeliveryDate: {
        type: Date
    },
    courierTrackingUrl: {
        type: String,
        trim: true
    },
    rtoStatus: {
        type: String,
        trim: true
    },
    pickupScheduledDate: {
        type: Date
    },
    labelUrl: {
        type: String,
        trim: true
    },
    manifestUrl: {
        type: String,
        trim: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Indexes for better query performance
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

export default mongoose.model<IOrder>('Order', orderSchema);
