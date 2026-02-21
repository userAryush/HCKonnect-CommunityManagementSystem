import React from 'react';
import {
    FileText,
    Play,
    Download,
    Share2,
    MoreVertical,
    Edit,
    Trash2,
    File,
    ExternalLink
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/timeFormatter';

const getResourceIcon = (category) => {
    switch (category) {
        case 'slide':
            return <FileText className="text-blue-500" size={40} />;
        case 'video':
            return <Play className="text-red-500" size={40} />;
        case 'image':
            return <File className="text-green-500" size={40} />;
        default:
            return <File className="text-gray-500" size={40} />;
    }
};

const formatFileSize = (bytes) => {
    const numBytes = Number(bytes);
    if (isNaN(numBytes) || numBytes <= 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    if (i < 0) return '0 Bytes';
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ResourceCard({ resource, onEdit, onDelete }) {
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const canManage = user && (
        (user.role === 'community' && String(user.id) === String(resource.community)) ||
        (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(resource.community))
    );

    const handleShare = () => {
        const url = resource.category === 'video' ? resource.video_url : window.location.origin + resource.file;
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    const handleOpen = () => {
        const url = resource.category === 'video' ? resource.video_url : resource.file;
        window.open(url, '_blank');
    };

    return (
        <div className="group relative overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white p-5 shadow-sm transition hover:shadow-md break-words">
            <div className="flex items-start gap-4">
                {/* Icon Container */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#f4f5f2] transition group-hover:bg-[#eaf0e6]">
                    {getResourceIcon(resource.category)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide border ${resource.visibility === 'public'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'bg-gray-100 text-gray-600 border-gray-200'
                            }`}>
                            {resource.visibility}
                        </span>

                        <div className="flex items-center gap-1">
                            {canManage && (
                                <>
                                    <button
                                        onClick={() => onEdit(resource)}
                                        className="p-1 text-gray-400 hover:text-[#75C043] transition"
                                        title="Edit Resource"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        onClick={() => onDelete(resource.id)}
                                        className="p-1 text-gray-400 hover:text-red-500 transition"
                                        title="Delete Resource"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    <h3 className="mt-2 text-lg font-bold text-[#0d1f14] truncate" title={resource.title}>
                        {resource.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#4b4b4b] line-clamp-2 break-words">
                        {resource.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-[11px] text-[#4b4b4b]">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {resource.category === 'video' ? (
                                <span className="shrink-0">LINK</span>
                            ) : (
                                <>
                                    <span className="truncate max-w-[60px] uppercase">{resource.file_extension || 'FILE'}</span>
                                    <span>•</span>
                                    <span className="shrink-0">{formatFileSize(resource.file_size)}</span>
                                </>
                            )}
                        </div>
                        <span className="shrink-0 ml-2">{resource.time_ago}</span>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="mt-5 flex items-center gap-2 border-t border-[#f4f5f2] pt-4">
                <button
                    onClick={handleOpen}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0d1f14] py-2.5 text-xs font-semibold text-white transition hover:bg-[#0d1f14]/90"
                >
                    <ExternalLink size={14} />
                    {resource.category === 'video' ? 'Watch Video' : 'Open File'}
                </button>

                {resource.category !== 'video' && (
                    <a
                        href={resource.file}
                        download
                        className="flex items-center justify-center rounded-xl bg-[#f4f5f2] p-2.5 text-[#0d1f14] transition hover:bg-[#e5e7eb] shrink-0"
                        title="Download"
                    >
                        <Download size={16} />
                    </a>
                )}

                <button
                    onClick={handleShare}
                    className="flex items-center justify-center rounded-xl bg-[#f4f5f2] p-2.5 text-[#0d1f14] transition hover:bg-[#e5e7eb] shrink-0"
                    title="Share"
                >
                    <Share2 size={16} />
                </button>
            </div>
        </div>
    );
}
