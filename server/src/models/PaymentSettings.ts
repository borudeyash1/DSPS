import mongoose from 'mongoose';

export interface IPaymentSettings extends mongoose.Document {
    codEnabled: boolean;
    codMinimumAmount: number;
    hdfcEnabled: boolean;
    hdfcMerchantId: string;
    hdfcApiKey: string;
    hdfcResponseKey: string;
    acceptedPaymentMethods: string[];
    createdAt: Date;
    updatedAt: Date;
}

const paymentSettingsSchema = new mongoose.Schema(
    {
        codEnabled: {
            type: Boolean,
            default: true,
        },
        codMinimumAmount: {
            type: Number,
            default: 0, // No minimum by default
        },
        hdfcEnabled: {
            type: Boolean,
            default: false,
        },
        hdfcMerchantId: {
            type: String,
            default: '',
        },
        hdfcApiKey: {
            type: String,
            default: '',
        },
        hdfcResponseKey: {
            type: String,
            default: '',
        },
        acceptedPaymentMethods: {
            type: [String],
            default: ['upi', 'card', 'netbanking', 'wallet', 'cod'],
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IPaymentSettings>('PaymentSettings', paymentSettingsSchema);
