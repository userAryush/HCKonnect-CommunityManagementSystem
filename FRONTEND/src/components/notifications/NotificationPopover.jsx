import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, CheckCheck, Settings, Loader2 } from 'lucide-react';
import NotificationItem from './NotificationItem';
import notificationService from '../../services/notificationService';

const NotificationPopover = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const popoverRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        } catch (error) {
            console.error('Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popoverRef.current && !popoverRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen, onClose]);

    const handleMarkRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            // Silent error
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            // Silent error
        }
    };

    const handleDelete = async (id) => {
        try {
            await notificationService.deleteNotification(id);
            setNotifications(prev => prev.filter(n => n.id !== id));
            if (notifications.find(n => n.id === id && !n.is_read)) {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            // Silent error
        }
    };

    if (!isOpen) return null;

    return (
        <div
            ref={popoverRef}
            className="absolute top-full right-0 mt-3 w-80 md:w-96 bg-[#0d1f14] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[60] animate-in fade-in zoom-in duration-200"
        >
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
                <div className="flex items-center gap-2">
                    <Bell size={18} className="text-[#75C043]" />
                    <h3 className="font-bold text-white">Notifications</h3>
                    {unreadCount > 0 && (
                        <span className="bg-[#75C043] text-[#0d1f14] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {unreadCount}
                        </span>
                    )}
                </div>
                {/* <div className="flex items-center gap-1">
                    {unreadCount > 0 && (
                        <button
                            onClick={handleMarkAllRead}
                            className="p-2 hover:bg-white/10 rounded-full text-white/60 transition-colors"
                            title="Mark all as read"
                        >
                            <CheckCheck size={16} />
                        </button>
                    )}
                    <button className="p-2 hover:bg-white/10 rounded-full text-white/60 transition-colors">
                        <Settings size={16} />
                    </button>
                </div> */}
            </div>

            <div className="max-h-[450px] overflow-y-auto custom-scrollbar">
                {loading ? (
                    <div className="p-10 flex flex-col items-center justify-center gap-3">
                        <Loader2 size={24} className="animate-spin text-[#75C043]" />
                        <p className="text-xs text-white/40">Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map(notification => (
                        <NotificationItem
                            key={notification.id}
                            notification={notification}
                            onMarkRead={handleMarkRead}
                            onDelete={handleDelete}
                        />
                    ))
                ) : (
                    <div className="p-12 flex flex-col items-center justify-center gap-4 text-center">
                        <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center text-white/20">
                            <BellOff size={32} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-white/70">No notifications yet</p>
                            <p className="text-xs text-white/40 mt-1 px-4">We'll notify you when something important happens.</p>
                        </div>
                    </div>
                )}
            </div>

            {notifications.length > 0 && (
                <div className="p-3 border-t border-white/10 text-center bg-white/[0.01]">
                    {/* <button className="text-xs font-semibold text-[#75C043] hover:underline transition-all">
                        View all activity
                    </button> */}
                </div>
            )}
        </div>
    );
};

export default NotificationPopover;
