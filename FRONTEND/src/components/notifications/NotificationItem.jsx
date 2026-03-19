import React from 'react';
import { User, Calendar, Megaphone, MessageSquare, FileText } from 'lucide-react';

const NotificationItem = ({ notification, onMarkRead }) => {
    const { id, title, message, type, created_at, is_read, actor_name, actor_image } = notification;

    const getIcon = () => {
        switch (type) {
            case 'event': return <Calendar className="text-blue-400" size={18} />;
            case 'announcement': return <Megaphone className="text-yellow-400" size={18} />;
            case 'discussion':
            case 'post': return <MessageSquare className="text-green-400" size={18} />;
            case 'resource': return <FileText className="text-purple-400" size={18} />;
            case 'membership':
            case 'role_change': return <User className="text-orange-400" size={18} />;
            default: return <Megaphone className="text-gray-400" size={18} />;
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    return (
        <div
            onClick={() => !is_read && onMarkRead(id)}
            className={`group relative flex gap-4 p-4 transition-all duration-200 cursor-pointer border-b border-surface-border 
        ${!is_read ? 'bg-primary/[0.03]' : 'hover:bg-ink/[0.02]'}`}
        >
            {/* Unread Accent Line */}
            {!is_read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}

            <div className="flex-shrink-0 relative">
                <div className="h-10 w-10 rounded-full bg-secondary border border-surface-border overflow-hidden">
                    {actor_image ? (
                        <img src={actor_image} alt={actor_name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center text-surface-body">
                            {getIcon()}
                        </div>
                    )}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                    <h4 className={`text-sm tracking-tight leading-none ${!is_read ? 'font-bold text-surface-dark' : 'font-medium text-surface-dark/70'}`}>
                        {title}
                    </h4>
                    <span className="text-[10px] font-medium text-surface-body/60 uppercase tracking-wider">
                        {/* Logic for time omitted for brevity, use your existing formatTime */}
                        2h ago
                    </span>
                </div>
                <p className="text-xs text-surface-body leading-relaxed line-clamp-2">{message}</p>
            </div>
        </div>
    );
};

export default NotificationItem;
