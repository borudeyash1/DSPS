import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface Notification {
    _id: string;
    type: 'ORDER_PLACED' | 'CART_ADD' | 'SYSTEM' | 'PROMOTION' | 'REMINDER';
    title: string;
    message: string;
    isRead: boolean;
    metadata?: any;
    createdAt: string;
}

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    loading: boolean;
    error: string | null;
    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    addNotification: (notification: Notification) => void;
    deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const response = await axios.get(`${API_URL}/notifications`, {
                withCredentials: true,
            });
            if (response.data.success) {
                set({
                    notifications: response.data.data,
                    unreadCount: response.data.unreadCount,
                    loading: false,
                });
            }
        } catch (error: any) {
            set({ loading: false, error: error.message });
            console.error('Fetch notifications error:', error);
        }
    },

    markAsRead: async (id: string) => {
        try {
            // Optimistic update
            const { notifications, unreadCount } = get();
            const notification = notifications.find((n) => n._id === id);

            if (notification && !notification.isRead) {
                set({
                    notifications: notifications.map((n) =>
                        n._id === id ? { ...n, isRead: true } : n
                    ),
                    unreadCount: Math.max(0, unreadCount - 1),
                });

                await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
                    withCredentials: true,
                });
            }
        } catch (error: any) {
            console.error('Mark as read error:', error);
            // Revert if needed, but keeping it simple for now
        }
    },

    markAllAsRead: async () => {
        try {
            set({
                notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
                unreadCount: 0,
            });

            await axios.put(`${API_URL}/notifications/mark-all-read`, {}, {
                withCredentials: true,
            });
        } catch (error: any) {
            console.error('Mark all as read error:', error);
        }
    },

    addNotification: (notification: Notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
        }));
    },

    deleteNotification: async (id: string) => {
        try {
            const { notifications, unreadCount } = get();
            const notification = notifications.find((n) => n._id === id);

            set({
                notifications: notifications.filter(n => n._id !== id),
                unreadCount: notification && !notification.isRead ? Math.max(0, unreadCount - 1) : unreadCount
            });

            await axios.delete(`${API_URL}/notifications/${id}`, {
                withCredentials: true
            });
        } catch (error: any) {
            console.error('Delete notification error:', error);
        }
    }
}));
