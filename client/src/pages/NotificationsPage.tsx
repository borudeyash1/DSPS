import { useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Trash2, ArrowLeft } from 'lucide-react';

const NotificationsPage = () => {
    const {
        notifications,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotificationStore();
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();
        window.scrollTo(0, 0);
    }, [fetchNotifications]);

    const handleNotificationClick = (notification: any) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }

        if (notification.type === 'ORDER_PLACED' && notification.metadata?.orderId) {
            navigate(`/order-confirmation/${notification.metadata.orderId}`);
        } else if (notification.type === 'CART_ADD') {
            navigate('/cart');
        }
    };

    const iconForType = (type: string) => {
        switch (type) {
            case 'ORDER_PLACED': return '🛍️';
            case 'CART_ADD': return '🛒';
            case 'REMINDER': return '⏰';
            case 'PROMOTION': return '🎉';
            default: return '📢';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pt-20 pb-12">
            <div className="container-custom">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => navigate(-1)}
                                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition-colors"
                                aria-label="Go back"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600" />
                            </button>
                            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                        </div>
                        {notifications.some(n => !n.isRead) && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-sm text-primary font-medium hover:underline flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-primary/5 transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                <span className="hidden sm:inline">Mark all as read</span>
                                <span className="sm:hidden">Mark read</span>
                            </button>
                        )}
                    </div>

                    {/* List */}
                    <div className="divide-y divide-gray-50">
                        {notifications.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                    <Bell className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications yet</h3>
                                <p className="text-gray-500 text-sm max-w-sm mx-auto">
                                    We'll notify you about your orders, exclusive offers, and important updates here.
                                </p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification._id}
                                    onClick={() => handleNotificationClick(notification)}
                                    className={`p-4 sm:p-6 hover:bg-gray-50 transition-all cursor-pointer relative group ${!notification.isRead ? 'bg-blue-50/40' : 'bg-white'
                                        }`}
                                >
                                    <div className="flex gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${notification.type === 'ORDER_PLACED' ? 'bg-green-100 text-green-600' :
                                                notification.type === 'CART_ADD' ? 'bg-blue-100 text-blue-600' :
                                                    notification.type === 'REMINDER' ? 'bg-orange-100 text-orange-600' :
                                                        'bg-gray-100 text-gray-600'
                                            }`}>
                                            <span className="text-xl">{iconForType(notification.type)}</span>
                                        </div>

                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <div className="flex justify-between items-start gap-4 mb-1">
                                                <p className={`text-base font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                                    }`}>
                                                    {notification.title}
                                                </p>
                                                <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:block">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>

                                            <p className="text-sm text-gray-600 leading-relaxed mb-2 line-clamp-2">
                                                {notification.message}
                                            </p>

                                            <div className="flex items-center justify-between sm:hidden">
                                                <span className="text-xs text-gray-400">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteNotification(notification._id);
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200"
                                            title="Delete notification"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationsPage;
