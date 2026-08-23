/**
 * Desktop Notification Utility
 * Provides functions for showing browser notifications for order status updates
 */

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notifications');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const showDesktopNotification = (title: string, options?: NotificationOptions) => {
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            icon: '/logo.png',
            badge: '/logo.png',
            ...options
        });

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);

        return notification;
    }
};

// Order-specific notifications
export const notifyOrderPlaced = (orderNumber: string) => {
    showDesktopNotification('Order Placed! 🎉', {
        body: `Your order ${orderNumber} has been confirmed.`,
        tag: 'order-placed',
        requireInteraction: false
    });
};

export const notifyOrderShipped = (orderNumber: string, trackingNumber?: string) => {
    showDesktopNotification('Order Shipped! 📦', {
        body: trackingNumber
            ? `Your order ${orderNumber} is on its way. Tracking: ${trackingNumber}`
            : `Your order ${orderNumber} is on its way.`,
        tag: 'order-shipped',
        requireInteraction: false
    });
};

export const notifyOrderDelivered = (orderNumber: string) => {
    showDesktopNotification('Order Delivered! ✅', {
        body: `Your order ${orderNumber} has been delivered.`,
        tag: 'order-delivered',
        requireInteraction: false
    });
};

export const notifyOrderCancelled = (orderNumber: string) => {
    showDesktopNotification('Order Cancelled', {
        body: `Your order ${orderNumber} has been cancelled.`,
        tag: 'order-cancelled',
        requireInteraction: false
    });
};

// Password change notification
export const notifyPasswordChanged = () => {
    showDesktopNotification('Password Changed 🔒', {
        body: 'Your password was successfully changed.',
        tag: 'password-changed',
        requireInteraction: true
    });
};

// Account deletion notification
export const notifyAccountDeletionRequested = () => {
    showDesktopNotification('Account Deletion Requested ⚠️', {
        body: 'Please check your email to confirm account deletion.',
        tag: 'account-deletion',
        requireInteraction: true
    });
};

// Initialize notifications on app load
export const initializeNotifications = async () => {
    const hasPermission = await requestNotificationPermission();
    if (hasPermission) {
        console.log('✅ Desktop notifications enabled');
    } else {
        console.log('❌ Desktop notifications disabled');
    }
};

// Admin-specific notifications
export const notifyAdminOrderCancelled = (orderNumber: string, userName: string) => {
    showDesktopNotification('Order Cancelled 🔴', {
        body: `Order ${orderNumber} was cancelled by ${userName}`,
        tag: 'admin-order-cancelled',
        requireInteraction: true
    });
};

export const notifyAdminNewOrder = (orderNumber: string, userName: string, amount: number) => {
    showDesktopNotification('New Order 🟢', {
        body: `Order ${orderNumber} from ${userName} - ₹${amount}`,
        tag: 'admin-new-order',
        requireInteraction: false
    });
};
