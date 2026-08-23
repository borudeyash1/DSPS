import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
    user: mongoose.Types.ObjectId;
    type: 'ORDER_PLACED' | 'CART_ADD' | 'SYSTEM' | 'PROMOTION' | 'REMINDER' | 'ORDER_CANCELLED_BY_USER' | 'ORDER_SHIPPED' | 'ORDER_DELIVERED' | 'ORDER_CANCELLED' | 'ORDER_STATUS_UPDATE';
    title: string;
    message: string;
    isRead: boolean;
    read: boolean; // Alias for isRead
    isAdminNotification: boolean;
    metadata?: any;
    createdAt: Date;
    updatedAt: Date;
}

const notificationSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false, // Allow null for admin-wide notifications
        },
        type: {
            type: String,
            enum: ['ORDER_PLACED', 'CART_ADD', 'SYSTEM', 'PROMOTION', 'REMINDER', 'ORDER_CANCELLED_BY_USER', 'ORDER_SHIPPED', 'ORDER_DELIVERED', 'ORDER_CANCELLED', 'ORDER_STATUS_UPDATE'],
            required: true,
        },
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        isAdminNotification: {
            type: Boolean,
            default: false,
        },
        metadata: {
            type: Schema.Types.Mixed,
        },
    },
    {
        timestamps: true,
    }
);


// Index for getting user's notifications sorted by time
notificationSchema.index({ user: 1, createdAt: -1 });

// Index for admin notifications
notificationSchema.index({ isAdminNotification: 1, createdAt: -1 });

// Virtual field to alias isRead as read
notificationSchema.virtual('read').get(function () {
    return this.isRead;
}).set(function (value: boolean) {
    this.isRead = value;
});

export default mongoose.model<INotification>('Notification', notificationSchema);
