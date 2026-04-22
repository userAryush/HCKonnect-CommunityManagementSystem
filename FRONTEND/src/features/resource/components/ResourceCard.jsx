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
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const canManage = user && (
        (user.role === 'community' && String(user.id) === String(resource.community?.id || resource.community)) ||
        (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(resource.community?.id || resource.community))
    );

    const handleOpen = (e) => {
        e.stopPropagation();
        const url = resource.category === 'video' ? resource.video_url : resource.file;
        window.open(url, '_blank');
    };

    const handleEdit = (e) => {
        if (e) e.stopPropagation();
        onEdit(resource);
    };

    const handleDelete = (e) => {
        if (e) e.stopPropagation();
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!onDelete) return;
        setIsDeleting(true);
        try {
            await onDelete(resource.id);
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Failed to delete resource', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const resourceUrl = resource.category === 'video' ? resource.video_url : window.location.origin + resource.file;

    return (
        <>
            <Card className="group relative break-words">
                <CardHeader
                    item={resource}
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
                        <p className="mt-1 text-xs text-surface-muted line-clamp-2 break-words leading-relaxed">
                            {resource.description}
                        </p>
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
                        <a
                            href={resource.file}
                            download
                            onClick={(e) => e.stopPropagation()}
                            title="Download"
                        >
                            <Button variant="ghost" className="!p-2.5">
                                <Download size={16} />
                            </Button>
                        </a>
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
