import React, { useState } from 'react';
import {
    FileText,
    Play,
    Download,
    File,
    ExternalLink
} from 'lucide-react';
import Card from '../../../shared/components/card/Card';
import CardHeader from '../../../shared/components/card/CardHeader';
import CardActionMenu from '../../../shared/components/card/CardActionMenu';
import Badge from '../../../shared/components/ui/Badge';
import Button from '../../../shared/components/ui/Button';
import ShareButton from '../../../shared/components/card/ShareButton';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import ExpandableDescription from '../../../shared/components/ui/ExpandableDescription';
import apiClient from '../../../shared/services/apiClient';
import { useToast } from '../../../shared/components/ui/ToastContext';
import { resourceAuthorItem } from '../../../utils/userUtils';
import { getApiErrorMessage } from '../../../utils/apiErrorUtils';

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
    if (isNaN(numBytes) || numBytes <= 0) return '—';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(numBytes) / Math.log(k));
    if (i < 0) return '0 Bytes';
    return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function ResourceCard({ resource, onEdit, onDelete }) {
    const { showToast } = useToast();
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const canManage = user && (
        (user.role === 'community' && String(user.id) === String(resource.community?.id || resource.community)) ||
        (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(resource.community?.id || resource.community))
    );

    const authorItem = resourceAuthorItem(resource);

    const apiBase = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/').replace(/\/$/, '');

    const resolveServePath = (disposition = 'inline') => {
        let path = resource.file_serve_url
            || `/contents/resources/${resource.id}/file/`;
        try {
            if (/^https?:\/\//i.test(path)) {
                const url = new URL(path);
                path = `${url.pathname}${url.search}`;
            }
        } catch {
            /* use path as-is */
        }
        if (!path.startsWith('/')) path = `/${path}`;
        const sep = path.includes('?') ? '&' : '?';
        return `${path}${sep}disposition=${disposition}`;
    };

    const buildFilename = () => {
        const ext = resource.file_extension
            ? `.${String(resource.file_extension).replace(/^\./, '')}`
            : '';
        return `${(resource.title || 'resource').replace(/[/\\?%*:|"<>]/g, '-')}${ext}`;
    };

    const handleOpen = (e) => {
        e.stopPropagation();
        if (resource.category === 'video') {
            if (resource.video_url) window.open(resource.video_url, '_blank', 'noopener,noreferrer');
            return;
        }
        window.open(`${apiBase}${resolveServePath('inline')}`, '_blank', 'noopener,noreferrer');
    };

    const handleDownload = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const filename = buildFilename();

        try {
            const res = await apiClient.get(resolveServePath('attachment'), {
                responseType: 'blob',
            });
            const blob =
                res.data instanceof Blob
                    ? res.data
                    : new Blob([res.data], {
                          type: res.headers['content-type'] || 'application/octet-stream',
                      });
            const blobUrl = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            link.rel = 'noopener';
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(blobUrl);
            showToast('Download started.', 'success');
        } catch (err) {
            console.error('Download failed', err);
            let message = getApiErrorMessage(
                err,
                'Download failed. Please try again.'
            );
            const blobData = err?.response?.data;
            if (blobData instanceof Blob) {
                try {
                    const parsed = JSON.parse(await blobData.text());
                    if (typeof parsed?.detail === 'string') message = parsed.detail;
                } catch {
                    /* keep fallback */
                }
            }
            showToast(message, 'error');
        }
    };

    const handleEdit = (e) => {
        if (e) e.stopPropagation();
        if (onEdit) onEdit(resource);
    };

    const handleDelete = (e) => {
        if (e) e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        setIsDeleting(true);
        try {
            await apiClient.delete(`/contents/resources/${resource.id}/manage/`);
            setIsDeleteModalOpen(false);
            showToast('Resource deleted successfully.', 'success');
            if (onDelete) onDelete(resource.id);
        } catch (error) {
            console.error('Failed to delete resource', error);
            showToast(getApiErrorMessage(error, 'Failed to delete resource.'), 'error');
        } finally {
            setIsDeleting(false);
        }
    };

    const resourceUrl =
        resource.category === 'video'
            ? resource.video_url
            : `${apiBase}${resolveServePath('inline')}`;

    return (
        <>
            <Card className="group relative break-words">
                <CardHeader
                    item={authorItem}
                    actions={
                        <CardActionMenu
                            canEdit={canManage}
                            onEdit={handleEdit}
                            canDelete={canManage}
                            onDelete={handleDelete}
                        />
                    }
                >
                    <Badge variant="orange">Resource</Badge>
                    {resource.visibility && (
                        <Badge variant={resource.visibility === 'public' ? 'success' : 'gray'}>
                            {resource.visibility}
                        </Badge>
                    )}
                </CardHeader>

                <div className="flex items-start gap-4">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-zinc-100 transition group-hover:bg-zinc-200/50">
                        {getResourceIcon(resource.category)}
                    </div>

                    <div className="flex-1 min-w-0 overflow-hidden">
                        <h3 className="text-title transition-transform duration-200 ease-out group-hover:-translate-y-0.5 truncate" title={resource.title}>
                            {resource.title}
                        </h3>
                        <ExpandableDescription
                            text={resource.description}
                            className="mt-1 text-xs text-surface-muted break-words"
                            as="p"
                        />
                        <div className="mt-4 flex items-center justify-between text-[11px] text-surface-muted">
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

                <div className="mt-5 flex items-center gap-2 border-t border-surface-border pt-4">
                    <Button
                        onClick={handleOpen}
                        className="flex-1 !py-2.5 !text-xs"
                    >
                        <ExternalLink size={14} className="mr-2" />
                        {resource.category === 'video' ? 'Watch Video' : 'Open File'}
                    </Button>

                    {resource.category !== 'video' && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="!p-2.5"
                            title="Download"
                            onClick={handleDownload}
                        >
                            <Download size={16} />
                        </Button>
                    )}

                    <ShareButton
                        url={resourceUrl}
                        title={resource.title}
                        text={`Check out this resource: ${resource.title}`}
                        className="!p-2.5"
                    />
                </div>
            </Card>

            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Delete resource?"
                message="This action cannot be undone."
                confirmText="Delete"
                isLoading={isDeleting}
                loadingText="Deleting..."
            />
        </>
    );
}
