import Order from '../models/Order';
import Notification from '../models/Notification';

import { getIO } from '../socket';

/**
 * Centralized service to handle order state changes and side effects (Notifications, etc.)
 * This ensures that any status change (Manual, Mock, or Automated) triggers all relevant updates.
 */
export const orderStateManager = {
    /**
     * Update order status and trigger events
     */
    updateStatus: async (orderId: string | any, newStatus: string, metadata: any = {}) => {
        const order = await Order.findById(orderId).populate('user');
        if (!order) {
            throw new Error('Order not found');
        }

        const oldStatus = order.status;

        // Skip if no change (unless forcing update)
        if (oldStatus === newStatus && !metadata.forceUpdate) {
            // Still update metadata if provided
            let changed = false;
            if (metadata.trackingNumber && order.trackingNumber !== metadata.trackingNumber) {
                order.trackingNumber = metadata.trackingNumber;
                changed = true;
            }
            if (metadata.awbCode) { (order as any).awbCode = metadata.awbCode; changed = true; }
            if (metadata.courierName) { (order as any).courierName = metadata.courierName; changed = true; }

            if (changed) await order.save();
            return order;
        }

        // Update core status
        order.status = newStatus as any;

        // Update metadata fields
        if (metadata.trackingNumber) order.trackingNumber = metadata.trackingNumber;
        if (metadata.awbCode) (order as any).awbCode = metadata.awbCode;
        if (metadata.courierName) (order as any).courierName = metadata.courierName;

        // Automatic Payment Completion for COD on Delivery
        if (newStatus === 'delivered' && order.paymentMethod === 'cod') {
            order.paymentStatus = 'completed';
        }




        await order.save();

        // Generate OTP for Out For Delivery (Prepaid/Online only) - AFTER save
        let generatedOtp: string | undefined = undefined;
        const pMethod = order.paymentMethod ? order.paymentMethod.toLowerCase() : '';

        if (newStatus === 'out_for_delivery' && (pMethod === 'online' || pMethod === 'prepaid')) {
            generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            await Order.findByIdAndUpdate(order._id, { deliveryOtp: generatedOtp });
            console.log(`✅ Generated and saved OTP: ${generatedOtp} for order ${order._id} (Method: ${order.paymentMethod})`);
        }

        // Trigger Side Effects
        try {
            await handleStatusChangeEvents(order, oldStatus, newStatus, generatedOtp);
        } catch (error) {
            console.error('Failed to handle order status events:', error);
            // Don't fail the request if notification fails
        }

        return order;
    }
};

/**
 * Handle side effects for status changes
 */
async function handleStatusChangeEvents(order: any, oldStatus: string, newStatus: string, otp?: string) {
    const user = order.user;
    if (!user) return;

    // 1. Create In-App Notification for User
    const title = getKeyStatusTitle(newStatus);
    const message = getStatusMessage(newStatus, order._id);

    await Notification.create({
        user: user._id,
        type: 'ORDER_STATUS_UPDATE',
        title: title,
        message: message,
        metadata: {
            orderId: order._id,
            oldStatus,
            newStatus
        }
    });

    // 2. Create Admin Notification for status changes
    try {
        const orderNumber = `#${order._id.toString().slice(-6).toUpperCase()}`;
        const userName = user.fullName || 'Customer';

        let adminNotificationData = null;

        if (newStatus === 'shipped') {
            adminNotificationData = {
                type: 'ORDER_SHIPPED',
                title: 'Order Shipped',
                message: `Order ${orderNumber} has been shipped to ${userName}`,
                metadata: { orderId: order._id, userId: user._id }
            };
        } else if (newStatus === 'delivered') {
            adminNotificationData = {
                type: 'ORDER_DELIVERED',
                title: 'Order Delivered',
                message: `Order ${orderNumber} was delivered to ${userName}`,
                metadata: { orderId: order._id, userId: user._id }
            };
        } else if (newStatus === 'cancelled') {
            adminNotificationData = {
                type: 'ORDER_CANCELLED',
                title: 'Order Cancelled',
                message: `Order ${orderNumber} was cancelled (Admin action)`,
                metadata: { orderId: order._id, userId: user._id }
            };
        } else if (newStatus === 'processing') {
            adminNotificationData = {
                type: 'ORDER_PLACED',
                title: 'Order Processing',
                message: `Order ${orderNumber} from ${userName} is now processing`,
                metadata: { orderId: order._id, userId: user._id }
            };
        }

        if (adminNotificationData) {
            await Notification.create({
                user: null,
                ...adminNotificationData,
                isAdminNotification: true
            });

            console.log(`✅ Admin notification created for ${newStatus} status`);
        }
    } catch (notifError) {
        console.error('❌ Failed to create admin notification:', notifError);
    }

    // 3. Send Email Notification
    try {
        const { sendEmailNotification } = await import('../services/notificationService');

        // Populate items for email
        const populatedOrder = await Order.findById(order._id).populate('items.product');
        if (!populatedOrder) return;

        const emailData = {
            email: user.email,
            fullName: user.fullName,
            order: {
                orderId: order._id.toString(),
                orderNumber: `#${order._id.toString().slice(-6).toUpperCase()}`,
                date: order.createdAt.toISOString(),
                items: (populatedOrder.items || []).map((item: any) => ({
                    name: item.name || item.product?.name || 'Product',
                    quantity: item.quantity,
                    price: item.price,
                    image: item.image || item.product?.images?.[0]?.url || ''
                })),
                subtotal: order.totalAmount, // Assuming simple structure for now
                shipping: 0,
                tax: 0,
                total: order.totalAmount,
                shippingAddress: order.shippingAddress,
                trackingNumber: order.trackingNumber
            }
        };

        if (newStatus === 'processing' || newStatus === 'pending') {
            // Optional: Don't spam "processing" if "pending" email was sent, but good for confirmation
            // await sendEmailNotification({ ...emailData, type: 'order_placed' });
        } else if (newStatus === 'shipped') {
            await sendEmailNotification({ ...emailData, type: 'order_shipped' });
        } else if (newStatus === 'out_for_delivery') {
            // Use passed OTP if available, otherwise try to fetch (fallback)
            let finalOtp = otp;

            if (!finalOtp) {
                console.log('⚠️ OTP not passed to handler, fetching from DB...');
                const freshOrder = await Order.findById(order._id).select('+deliveryOtp');
                finalOtp = freshOrder?.deliveryOtp;
            }

            await sendEmailNotification({ ...emailData, type: 'out_for_delivery', otp: finalOtp || undefined });
            console.log(`✅ Out for delivery email sent (OTP: ${finalOtp})`);
        } else if (newStatus === 'delivered') {
            await sendEmailNotification({ ...emailData, type: 'order_delivered' });
        } else if (newStatus === 'cancelled') {
            await sendEmailNotification({ ...emailData, type: 'order_cancelled' });
        }
    } catch (emailError) {
        console.error('❌ Failed to send order status email:', emailError);
    }

    // 4. Emit Real-time Socket Event
    try {
        const io = getIO();
        const updatePayload = {
            orderId: order._id,
            status: newStatus,
            paymentStatus: order.paymentStatus
        };

        // Notify User
        io.to(`user:${user._id}`).emit('order_updated', updatePayload);

        // Notify Admins
        io.to('admin_room').emit('order_updated', updatePayload);
    } catch (err) {
        console.error('Socket emission failed:', err);
    }
}

function getKeyStatusTitle(status: string): string {
    switch (status) {
        case 'processing': return 'Order Processing';
        case 'shipped': return 'Order Shipped';
        case 'out_for_delivery': return 'Out For Delivery';
        case 'delivered': return 'Order Delivered';
        case 'cancelled': return 'Order Cancelled';
        default: return 'Order Updated';
    }
}

function getStatusMessage(status: string, orderId: string): string {
    const id = orderId.toString().slice(-6);
    switch (status) {
        case 'processing': return `Your order #${id} has been confirmed and is processing.`;
        case 'shipped': return `Good news! Your order #${id} has been shipped.`;
        case 'out_for_delivery': return `Your order #${id} is out for delivery! Please provide the OTP to the delivery agent.`;
        case 'delivered': return `Your order #${id} has been successfully delivered.`;
        case 'cancelled': return `Your order #${id} has been cancelled.`;
        default: return `The status of order #${id} is now ${status}.`;
    }
}

function getEmoji(status: string): string {
    switch (status) {
        case 'processing': return '⚙️';
        case 'shipped': return '🚚';
        case 'out_for_delivery': return 'runner'; // Placeholder
        case 'delivered': return '🎉';
        case 'cancelled': return '❌';
        default: return '📢';
    }
}

