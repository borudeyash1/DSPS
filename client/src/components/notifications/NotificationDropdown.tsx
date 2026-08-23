import { useState, useRef, useEffect } from 'react';
import { Bell, Check, X } from 'lucide-react';
import { useNotificationStore } from '../../store/notificationStore';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const {
        notifications,
        unreadCount,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification
    } = useNotificationStore();
    const navigate = useNavigate();

    // Fetch initial notifications
    useEffect(() => {
        fetchNotifications();

        // Polling for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Handle outside click
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Desktop Notification Permission
    const requestPermission = () => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
    };

    useEffect(() => {
        if (unreadCount > 0) {
            requestPermission();
        }
    }, [unreadCount]);

    const handleNotificationClick = (notification: any) => {
        if (!notification.isRead) {
            markAsRead(notification._id);
        }

        // Navigation based on type
        if (notification.type === 'ORDER_PLACED' && notification.metadata?.orderId) {
            navigate(`/order-confirmation/${notification.metadata.orderId}`);
            setIsOpen(false);
        } else if (notification.type === 'CART_ADD') {
            navigate('/cart');
            setIsOpen(false);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-all duration-300 relative group"
                aria-label="Notifications"
            >
                <Bell className={`w-6 h-6 text-gray-700 group-hover:text-black ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white transform scale-100 transition-transform">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white border border-border shadow-xl rounded-xl overflow-hidden z-[60] animate-fadeIn">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h3 className="font-bold text-gray-800">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                            >
                                <Check className="w-3 h-3" /> Mark all read
                            </button>
                        )}
                    </div>

                    <div className="max-h-[70vh] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <Bell className="w-12 h-12 text-gray-200 mb-2" />
                                <p>No notifications yet</p>
                            </div>
                        ) : (
                            <div>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer relative group ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                                        onClick={() => handleNotificationClick(notification)}
                                    >
                                        <div className="flex gap-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notification.type === 'ORDER_PLACED' ? 'bg-green-100 text-green-600' :
                                                notification.type === 'CART_ADD' ? 'bg-blue-100 text-blue-600' :
                                                    notification.type === 'REMINDER' ? 'bg-orange-100 text-orange-600' :
                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                {iconForType(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                <p className="text-[10px] text-gray-400 mt-2">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </p>
                                            </div>

                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteNotification(notification._id);
                                                }}
                                                className="absolute right-2 top-2 p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-2 bg-gray-50 text-center border-t border-gray-100">
                        <button
                            onClick={requestPermission}
                            className="text-xs text-gray-500 hover:text-gray-700"
                        >
                            Enable Desktop Notifications
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
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

export default NotificationDropdown;
