import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import PaymentSettings from '../models/PaymentSettings';

/**
 * Get payment settings
 */
export const getPaymentSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        // Get or create default settings
        let settings = await PaymentSettings.findOne();

        if (!settings) {
            settings = await PaymentSettings.create({
                codEnabled: true,
                codMinimumAmount: 0,
                hdfcEnabled: false,
                hdfcMerchantId: '',
                hdfcApiKey: '',
                hdfcResponseKey: '',
                acceptedPaymentMethods: ['upi', 'card', 'netbanking', 'wallet', 'cod']
            });
        }

        res.status(200).json({
            success: true,
            data: settings
        });
    } catch (error: any) {
        console.error('Get payment settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

/**
 * Update payment settings (Admin only)
 */
export const updatePaymentSettings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
        const {
            codEnabled,
            codMinimumAmount,
            hdfcEnabled,

            hdfcMerchantId,
            hdfcApiKey,
            hdfcResponseKey,
            acceptedPaymentMethods
        } = req.body;

        let settings = await PaymentSettings.findOne();

        if (!settings) {
            settings = new PaymentSettings();
        }

        // Update fields (HDFC keys can be updated from admin panel)
        if (codEnabled !== undefined) settings.codEnabled = codEnabled;
        if (codMinimumAmount !== undefined) settings.codMinimumAmount = codMinimumAmount;
        
        if (hdfcEnabled !== undefined) settings.hdfcEnabled = hdfcEnabled;
        if (hdfcMerchantId !== undefined) settings.hdfcMerchantId = hdfcMerchantId;
        if (hdfcApiKey !== undefined) settings.hdfcApiKey = hdfcApiKey;
        if (hdfcResponseKey !== undefined) settings.hdfcResponseKey = hdfcResponseKey;
        if (acceptedPaymentMethods !== undefined) settings.acceptedPaymentMethods = acceptedPaymentMethods;

        await settings.save();

        res.status(200).json({
            success: true,
            message: 'Payment settings updated successfully',
            data: settings
        });
    } catch (error: any) {
        console.error('Update payment settings error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};
