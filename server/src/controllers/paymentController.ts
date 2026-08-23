import { Response, Request } from 'express';
import { AuthenticatedRequest } from '../types';
import PaymentSettings from '../models/PaymentSettings';
import { createHDFCOrder, verifyHDFCSignature, checkHDFCPaymentStatus } from '../utils/hdfcSmartGateway';

/**
 * Create HDFC SmartGateway order for payment
 */
export const createHDFCOrderForPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { amount, currency = 'INR', customerInfo } = req.body;
        const userId = req.user!._id;

        if (!amount || amount <= 0) {
            res.status(400).json({
                success: false,
                message: 'Invalid amount'
            });
            return;
        }

        // Create HDFC order (receipt max 40 chars)
        const userIdShort = userId.toString().slice(-8);
        const timestamp = Date.now().toString().slice(-8);
        const receipt = `ord_${userIdShort}_${timestamp}`;

        const hdfcOrder = await createHDFCOrder(amount, currency, receipt, customerInfo);

        res.status(200).json({
            success: true,
            data: {
                orderId: hdfcOrder.id,
                amount: hdfcOrder.amount,
                currency: hdfcOrder.currency,
                receipt: hdfcOrder.receipt,
                paymentUrl: hdfcOrder.paymentUrl,
                transactionId: hdfcOrder.transactionId
            }
        });
    } catch (error: any) {
        console.error('Create HDFC order error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create payment order',
            error: error.message
        });
    }
};

/**
 * Verify HDFC SmartGateway payment
 */
export const verifyHDFCPayment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const { orderId, transactionId, status, signature } = req.body;

        if (!orderId || !transactionId || !status || !signature) {
            res.status(400).json({
                success: false,
                message: 'Missing payment verification parameters'
            });
            return;
        }

        // Verify signature
        const isValid = verifyHDFCSignature(
            orderId,
            transactionId,
            status,
            signature
        );

        if (!isValid) {
            res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
            return;
        }

        // Additional check: verify payment status from HDFC
        const paymentStatus = await checkHDFCPaymentStatus(orderId);

        if (paymentStatus.status !== 'SUCCESS' && paymentStatus.status !== 'success') {
            res.status(400).json({
                success: false,
                message: 'Payment not successful',
                status: paymentStatus.status
            });
            return;
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            data: {
                orderId: orderId,
                transactionId: transactionId,
                status: paymentStatus.status
            }
        });
    } catch (error: any) {
        console.error('Verify HDFC payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
};

/**
 * Get payment settings for checkout (public)
 */
export const getPaymentSettingsForCheckout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        let settings = await PaymentSettings.findOne();

        // Check if HDFC is properly configured (has merchant ID)
        const isHDFCConfigured = process.env.HDFC_MERCHANT_ID &&
            process.env.HDFC_MERCHANT_ID !== '' &&
            process.env.HDFC_PAYMENT_PAGE_CLIENT_ID &&
            process.env.HDFC_PAYMENT_PAGE_CLIENT_ID !== '';

        if (!settings) {
            // Return defaults if not configured
            res.status(200).json({
                success: true,
                data: {
                    codEnabled: true,
                    codMinimumAmount: 0,
                    hdfcEnabled: true,
                    hdfcMerchantId: process.env.HDFC_MERCHANT_ID || 'SG3004', // Hardcoded fallback for production
                    acceptedPaymentMethods: ['cod'] // Only COD when payment gateway not configured
                }
            });
            return;
        }

        // Return settings without secret
        const { hdfcApiKey: _, hdfcResponseKey: __, ...settingsWithoutSecret } = settings.toObject();

        // Add backward compatibility field and disable online payments if HDFC not configured
        const responseData = {
            ...settingsWithoutSecret,
            acceptedPaymentMethods: isHDFCConfigured && settingsWithoutSecret.hdfcEnabled
                ? settingsWithoutSecret.acceptedPaymentMethods
                : ['cod'] // Only COD if HDFC not configured
        };

        res.status(200).json({
            success: true,
            data: responseData
        });
    } catch (error: any) {
        console.error('Get payment settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch payment settings'
        });
    }
};

/**
 * Handle HDFC SmartGateway Callback
 * This is called by HDFC via browser redirect after payment
 */
export const handleHDFCCallback = async (req: Request, res: Response): Promise<void> => {
    try {
        console.log('🔄 HDFC Callback received:', req.body);

        // HDFC typically sends data in body for POST redirects
        const { order_id, status, transaction_id, signature } = req.body;

        // Check both possible field names
        const hdfcOrderId = order_id || req.body.orderId;

        if (!hdfcOrderId) {
            console.error('❌ HDFC Callback: Missing order ID', req.body);
            res.redirect(`${process.env.CLIENT_URL}/payment/failed?message=Missing order information`);
            return;
        }

        // Verify payment status with HDFC
        const paymentStatus = await checkHDFCPaymentStatus(hdfcOrderId);

        // Find the order in our database using the HDFC Order ID stored in paymentDetails
        // We look for paymentDetails.orderId matching the HDFC ID
        const order = await import('../models/Order').then(m => m.default.findOne({ 'paymentDetails.orderId': hdfcOrderId }));

        if (!order) {
            console.error(`❌ Order not found for HDFC ID: ${hdfcOrderId}`);
            // Fallback: Redirect to failed, but we can't show order specific info
            res.redirect(`${process.env.CLIENT_URL}/payment/failed?message=Order not found&orderId=${hdfcOrderId}`);
            return;
        }

        // Update Order Logic
        if (paymentStatus.status === 'SUCCESS') {
            order.paymentStatus = 'completed';
            order.status = 'processing'; // Move from pending to processing
            if (paymentStatus.transactionId) {
                // Update checks to ensure paymentDetails exists to avoid TS errors, though schema has it
                if (!order.paymentDetails) order.paymentDetails = {} as any;
                order.paymentDetails!.transactionId = paymentStatus.transactionId; // Store transaction ID
                order.paymentDetails!.method = 'HDFC';
                order.paymentDetails!.paidAt = new Date();
            }
            await order.save();

            // Redirect to success page using MONGO ID
            const redirectUrl = `${process.env.CLIENT_URL}/payment/success?orderId=${order._id}&status=success`;
            console.log(`✅ Payment successful for Order ${order._id}, redirecting to:`, redirectUrl);
            res.redirect(redirectUrl);
        } else {
            // Update order as failed if needed, or keep pending
            if (!order.paymentDetails) order.paymentDetails = {} as any;
            order.paymentDetails!.transactionId = paymentStatus.transactionId || order.paymentDetails!.transactionId;

            // Don't mark as cancelled immediately, user might retry. 
            // But we can mark paymentStatus as failed.
            order.paymentStatus = 'failed';
            await order.save();

            // Redirect to failure page using MONGO ID
            const redirectUrl = `${process.env.CLIENT_URL}/payment/failed?orderId=${order._id}&status=failed&message=${paymentStatus.message}`;
            console.warn(`⚠️ Payment failed for Order ${order._id}, redirecting to:`, redirectUrl);
            res.redirect(redirectUrl);
        }
    } catch (error: any) {
        console.error('❌ HDFC Callback Error:', error);
        res.redirect(`${process.env.CLIENT_URL}/payment/failed?message=Internal callback error`);
    }
};
