import { Request, Response } from 'express';
import { updateOrderFromWebhook } from '../services/shippingAutomation';
import Notification from '../models/Notification';
import Order from '../models/Order';

/**
 * Shiprocket Webhook Controller
 * Handles real-time shipping updates from Shiprocket
 */

/**
 * Handle Shiprocket webhook events
 * Webhook URL: /api/shiprocket/webhook
 */
export const handleShiprocketWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('📨 [WEBHOOK] Received Shiprocket webhook:', JSON.stringify(req.body, null, 2));

        const webhookData = req.body;

        // Validate webhook data
        if (!webhookData || !webhookData.order_id) {
            res.status(400).json({
                success: false,
                message: 'Invalid webhook data'
            });
            return;
        }

        // Update order from webhook
        await updateOrderFromWebhook(webhookData);

        // Send notification to user based on status
        await sendShippingNotification(webhookData);

        res.status(200).json({
            success: true,
            message: 'Webhook processed successfully'
        });

    } catch (error: any) {
        console.error('❌ [WEBHOOK] Error processing webhook:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to process webhook'
        });
    }
};

/**
 * Send shipping notification to user
 */
const sendShippingNotification = async (webhookData: any): Promise<void> => {
    try {
        const { order_id, current_status, awb, courier_name } = webhookData;

        const order = await Order.findOne({ shiprocketOrderId: order_id }).populate('user');

        if (!order || !order.user) {
            console.log('⚠️  [NOTIFICATION] Order or user not found');
            return;
        }

        const userId = (order.user as any)._id;

        // Notification messages based on status
        const notificationMap: { [key: string]: { title: string; message: string; type: string } } = {
            'PICKUP_SCHEDULED': {
                title: 'Pickup Scheduled',
                message: `Your order #${order._id.toString().slice(-6)} pickup has been scheduled.`,
                type: 'order'
            },
            'PICKED_UP': {
                title: 'Order Picked Up',
                message: `Your order #${order._id.toString().slice(-6)} has been picked up by ${courier_name || 'courier'}.`,
                type: 'order'
            },
            'IN_TRANSIT': {
                title: 'Order Shipped',
                message: `Your order #${order._id.toString().slice(-6)} is on its way! Track with AWB: ${awb}`,
                type: 'order'
            },
            'OUT_FOR_DELIVERY': {
                title: 'Out for Delivery',
                message: `Your order #${order._id.toString().slice(-6)} is out for delivery. It will arrive soon!`,
                type: 'order'
            },
            'DELIVERED': {
                title: 'Order Delivered',
                message: `Your order #${order._id.toString().slice(-6)} has been delivered. Thank you for shopping with us!`,
                type: 'order'
            },
            'RTO': {
                title: 'Return to Origin',
                message: `Your order #${order._id.toString().slice(-6)} is being returned. Please contact support.`,
                type: 'order'
            }
        };

        const notification = notificationMap[current_status];

        if (notification) {
            await Notification.create({
                user: userId,
                title: notification.title,
                message: notification.message,
    // @ts-ignore
                type: notification.type,
                metadata: {
                    orderId: order._id.toString(),
                    awb,
                    courierName: courier_name
                },
                read: false
            });

            console.log(`✅ [NOTIFICATION] Sent ${current_status} notification to user ${userId}`);
        }

    } catch (error: any) {
        console.error('❌ [NOTIFICATION] Failed to send notification:', error.message);
        // Don't throw - notification failure shouldn't break webhook processing
    }
};

/**
 * Test webhook endpoint (for development)
 */
export const testWebhook = async (req: Request, res: Response): Promise<void> => {
    try {
        const testData = {
            order_id: req.body.shiprocketOrderId || 123456,
            current_status: req.body.status || 'IN_TRANSIT',
            awb: req.body.awb || 'TEST123456',
            courier_name: req.body.courierName || 'Test Courier',
            etd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            delivered_date: null
        };

        await handleShiprocketWebhook({ body: testData } as Request, res);

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export default {
    handleShiprocketWebhook,
    testWebhook
};
