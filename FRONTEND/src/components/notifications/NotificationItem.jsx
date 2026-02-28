import React from 'react';
import { User, Calendar, Megaphone, MessageSquare, FileText, CheckCircle, X } from 'lucide-react';

const NotificationItem = ({ notification, onMarkRead, onDelete }) => {
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
            className={`relative flex gap-3 p-4 border-b border-white/5 hover:bg-white/5 transition-colors group ${!is_read ? 'bg-white/[0.02]' : ''}`}
            onClick={() => !is_read && onMarkRead(id)}
        >
            <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden bg-white/10 relative">
                {actor_image ? (
                    <img src={actor_image} alt={actor_name} className="h-full w-full object-cover" />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-[#75C043]/20 text-[#75C043]">
                        {getIcon()}
                    </div>
                )}
                {!is_read && (
                    <div className="absolute top-0 right-0 h-2.5 w-2.5 bg-[#75C043] rounded-full border-2 border-[#0d1f14]"></div>
                )}
            </div>

            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className={`text-sm font-semibold truncate ${!is_read ? 'text-white' : 'text-white/70'}`}>
                        {title}
                    </h4>
                    <span className="text-[10px] text-white/40 whitespace-nowrap">
                        {formatTime(created_at)}
                    </span>
                </div>
                <p className="text-xs text-white/50 line-clamp-2 mb-1">
                    {message}
                </p>
            </div>

            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(id);
                    }}
                    className="p-1 hover:text-red-400 text-white/40"
                    title="Delete"
                >
                    <X size={14} />
                </button>
            </div>
        </div>
    );
};

export default NotificationItem;
