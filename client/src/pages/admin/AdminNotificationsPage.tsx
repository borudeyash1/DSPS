import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';
import { Bell, Trash2, CheckCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/Toast';
import { useToast } from '../../hooks/useToast';

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    metadata?: any;
    createdAt: string;
}

const AdminNotificationsPage: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const navigate = useNavigate();
    const { toasts, showToast, hideToast } = useToast();

    // Fetch notifications
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const readParam = filter === 'unread' ? '&read=false' : '';
            const response = await adminApi.get(
                `/admin/notifications?page=${page}&limit=20${readParam}`
            );
            setNotifications(response.data.data);
            setTotalPages(response.data.pagination.pages);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
            showToast('Failed to fetch notifications', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [page, filter]);

    // Mark as read
    const markAsRead = async (id: string) => {
        try {
            await adminApi.put(
                `/admin/notifications/${id}/read`
            );
            fetchNotifications();
        } catch (error) {
            console.error('Failed to mark as read:', error);
            showToast('Failed to mark notification as read', 'error');
        }
    };

    // Mark all as read
    const markAllAsRead = async () => {
        try {
            await adminApi.put(
                `/admin/notifications/mark-all-read`
            );
            fetchNotifications();
            showToast('All notifications marked as read', 'success');
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            showToast('Failed to mark all as read', 'error');
        }
    };

    // Delete notification
    const deleteNotification = async (id: string) => {
        if (!confirm('Delete this notification?')) return;

        try {
            await adminApi.delete(
                `/admin/notifications/${id}`
            );
            fetchNotifications();
            showToast('Notification deleted', 'success');
        } catch (error) {
            console.error('Failed to delete notification:', error);
            showToast('Failed to delete notification', 'error');
        }
    };

    // Handle notification click
    const handleNotificationClick = (notification: Notification) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }

        // Navigate to delivery page for order-related notifications
        if (notification.metadata?.orderId) {
            navigate('/my-admin/delivery');
        }
    };

    // Format date
    const formatDate = (date: string) => {
        return new Date(date).toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
                    <p className="text-gray-500 mt-1">Manage your admin notifications</p>
                    <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-200">
                        <Bell size={16} />
                        <span>Notifications are automatically deleted after 2 days</span>
                    </div>
                </div>
                <button
                    onClick={markAllAsRead}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                    <CheckCheck size={18} />
                    Mark all read
                </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'all'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'unread'
                        ? 'bg-black text-white'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    Unread
                </button>
            </div>

            {/* Notifications List */}
            {loading ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <p className="text-gray-500">Loading notifications...</p>
                </div>
            ) : notifications.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg">No notifications</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {notifications.map((notification) => (
                        <div
                            key={notification._id}
                            className={`bg-white rounded-lg border border-gray-200 p-5 transition-all hover:shadow-md ${!notification.isRead ? 'border-l-4 border-l-blue-600' : ''
                                }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                {/* Content */}
                                <div
                                    onClick={() => handleNotificationClick(notification)}
                                    className="flex-1 cursor-pointer"
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {!notification.isRead && (
                                            <span className="w-2 h-2 bg-blue-600 rounded-full" />
                                        )}
                                        <h3 className="font-semibold text-gray-900">
                                            {notification.title}
                                        </h3>
                                    </div>
                                    <p className="text-gray-600 mb-2">{notification.message}</p>
                                    <p className="text-sm text-gray-400">
                                        {formatDate(notification.createdAt)}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    {!notification.isRead && (
                                        <button
                                            onClick={() => markAsRead(notification._id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Mark as read"
                                        >
                                            <CheckCheck size={20} />
                                        </button>
                                    )}
                                    <button
                                        onClick={() => deleteNotification(notification._id)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 bg-white rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Previous
                    </button>
                    <span className="px-4 py-2 bg-white rounded-lg border border-gray-200">
                        Page {page} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="px-4 py-2 bg-white rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                        Next
                    </button>
                </div>
            )}

            
            {/* Toast Notifications */}
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => hideToast(toast.id)}
                />
            ))}
        </div>
    );
};

export default AdminNotificationsPage;
