import { sendEmail, getEmailContent } from './emailService';

interface OrderEmailData {
    type: 'order_placed' | 'order_shipped' | 'order_delivered' | 'order_cancelled' | 'out_for_delivery' | 'delivery_otp';
    email: string;
    fullName: string;
    order: {
        orderId: string;
        orderNumber: string;
        date: string;
        items: Array<{
            name: string;
            quantity: number;
            price: number;
            image?: string;
        }>;
        subtotal: number;
        shipping: number;
        tax: number;
        total: number;
        shippingAddress: {
            street: string;
            city: string;
            state: string;
            pincode: string;
            country: string;
        };
        trackingNumber?: string;
    };
    otp?: string; // Optional for out_for_delivery and delivery_otp
}

interface PasswordChangedData {
    type: 'password_changed';
    email: string;
    fullName: string;
    changedAt: string;
    ipAddress: string;
}

interface AccountDeletionData {
    type: 'account_deletion_request';
    email: string;
    fullName: string;
    userId: string;
    token: string;
    expiresAt: string;
}

interface PasswordResetLinkData {
    type: 'password_reset_link';
    email: string;
    fullName: string;
    resetToken: string;
    expiresAt: string;
}

interface PasswordChangeOTPData {
    type: 'password_change_otp';
    email: string;
    fullName: string;
    otp: string;
    expiresIn: string;
}

interface RegistrationOTPData {
    type: 'registration';
    email: string;
    fullName: string;
    otp: string;
}

interface LoginOTPData {
    type: 'login_otp';
    email: string;
    fullName: string;
    otp: string;
}

type EmailNotificationData = OrderEmailData | PasswordChangedData | AccountDeletionData | PasswordResetLinkData | PasswordChangeOTPData | RegistrationOTPData | LoginOTPData;

export const sendEmailNotification = async (data: EmailNotificationData): Promise<void> => {
    try {
        const { subject, html } = getEmailContent(data);
        
        await sendEmail({
            to: data.email,
            subject,
            html
        });

        console.log(`✅ Email notification sent: ${data.type} to ${data.email}`);
    } catch (error) {
        console.error(`❌ Failed to send email notification:`, error);
        // Don't throw error - email failure shouldn't break the main flow
    }
};
