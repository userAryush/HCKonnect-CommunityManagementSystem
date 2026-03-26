import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellOff, CheckCheck, Settings, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import NotificationItem from './NotificationItem';
import notificationService from '../../services/notificationService';

const NotificationPopover = ({ isOpen, onClose }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const popoverRef = useRef(null);
    const navigate = useNavigate();

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

    const handleNavigate = (type, metadata) => {
        onClose(); // Close the popover
        if (!metadata) return;

        switch (type) {
            case 'event':
                if (metadata.event_id) navigate(`/events/${metadata.event_id}`);
                break;
            case 'discussion':
                if (metadata.discussion_id) navigate(`/discussions/${metadata.discussion_id}`);
                break;
            case 'post':
                if (metadata.post_id) navigate(`/posts/${metadata.post_id}`);
                break;
            case 'membership':
                if (metadata.community_id) navigate(`/community/${metadata.community_id}`);
                break;
            case 'role_change':
                navigate(`/profile`);
                break;
            case 'announcement':
                navigate(`/feed`);
                break;
            case 'vacancy':
                navigate(`/communities`);
                break;
            case 'resource':
                navigate(`/feed`);
                break;
            default:
                break;
        }
    };

    if (!isOpen) return null;

    return (

        <div
            ref={popoverRef}
            className="absolute top-full right-0 mt-4 w-80 md:w-[400px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-surface-border overflow-hidden z-[60] animate-in slide-in-from-top-2 duration-300"
        >
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between border-b border-surface-border bg-secondary">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-surface-dark">Notifications</span>
                    {unreadCount > 0 && (
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                </div>

                {unreadCount > 0 && (
                    <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] font-bold text-primary hover:opacity-70 transition-opacity"
                    >
                        Mark all read
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="max-h-[480px] overflow-y-auto overflow-x-hidden">
                {loading ? (
                    <div className="py-20 flex flex-col items-center gap-3">
                        <Loader2 size={20} className="animate-spin text-primary" />
                        <p className="text-[10px] font-bold uppercase tracking-widest text-surface-body/40">Syncing...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    notifications.map(n => (
                        <NotificationItem key={n.id} notification={n} onMarkRead={handleMarkRead} onDelete={handleDelete} onNavigate={handleNavigate} />
                    ))
                ) : (
                    <div className="py-20 px-10 text-center">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-surface-body/30 mb-4">
                            <BellOff size={20} />
                        </div>
                        <p className="text-xs text-surface-body mt-1">No new activity to show right now.</p>
                    </div>
                )}
            </div>

            {/* Subtle Footer Spacer */}
            <div className="h-2 bg-gradient-to-t from-cream/50 to-transparent pointer-events-none" />
        </div>
    );
};

export default NotificationPopover;
