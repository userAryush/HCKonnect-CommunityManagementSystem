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
import { getInitials, getDisplayName, getRoleLabel, getProfileImage } from '../../utils/userUtils';
import Badge from '../shared/Badge';
import Dropdown from '../shared/Dropdown';
import { useNavigate } from 'react-router-dom';

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
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || 'null');

    const canManage = user && (
        (user.role === 'community' && String(user.id) === String(resource.community?.id || resource.community)) ||
        (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(resource.community?.id || resource.community))
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
            <header className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-500 font-bold overflow-hidden border border-zinc-200 uppercase text-xs tracking-wider">
                        {getProfileImage(resource) ? (
                            <img src={getProfileImage(resource)} alt={getDisplayName(resource)} className="h-full w-full object-cover" />
                        ) : (
                            <span>{getInitials(getDisplayName(resource))}</span>
                        )}
                    </div>
                    <div>
                        <p
                            className="text-sm font-semibold text-surface-dark cursor-pointer transition-all duration-200 ease-out hover:font-bold"

                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/community/${resource.community?.id || resource.community}`);
                            }}
                        >
                            {getDisplayName(resource)}
                        </p>
                        <p className="text-metadata">
                            {getRoleLabel(resource)} • {formatTimeAgo(resource.created_at || new Date())}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="orange">Resource</Badge>
                    {resource.visibility && (
                        <Badge variant={resource.visibility === 'public' ? 'success' : 'gray'}>
                            {resource.visibility}
                        </Badge>
                    )}
                </div>
            </header>

            <div className="flex items-start gap-4">
                {/* Icon Container */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#f4f5f2] transition group-hover:bg-[#eaf0e6]">
                    {getResourceIcon(resource.category)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-title transition-transform duration-200 ease-out group-hover:-translate-y-0.5" title={resource.title}>
                            {resource.title}
                        </h3>

                        <div className="flex items-center gap-1">
                            {canManage && (
                                <Dropdown
                                    actions={[
                                        {
                                            label: 'Edit',
                                            icon: <Edit size={14} />,
                                            onClick: () => onEdit(resource)
                                        },
                                        {
                                            label: 'Delete',
                                            icon: <Trash2 size={14} />,
                                            onClick: () => onDelete(resource.id),
                                            variant: 'danger'
                                        }
                                    ]}
                                />
                            )}
                        </div>
                    </div>

                    <p className="mt-1 text-xs text-[#4b4b4b] line-clamp-2 break-words leading-relaxed">
                        {resource.description}
                    </p>

                    <div className="mt-4 flex items-center justify-between text-[11px] text-[#4b4b4b]">
                        <div className="flex items-center gap-2 overflow-hidden">
                            {resource.category === 'video' ? (
                                <span className="shrink-0 font-bold text-primary">LINK</span>
                            ) : (
                                <>
                                    <span className="truncate max-w-[60px] uppercase font-bold">{resource.file_extension || 'FILE'}</span>
                                    <span>•</span>
                                    <span className="shrink-0 font-medium">{formatFileSize(resource.file_size)}</span>
                                </>
                            )}
                        </div>
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
