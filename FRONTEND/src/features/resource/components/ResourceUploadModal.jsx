import { useState, useEffect } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import apiClient from '../../../shared/services/apiClient';
import ModalWrapper from '../../../shared/components/modals/ModalWrapper';
import ModalHeader from '../../../shared/components/modals/ModalHeader';
import Button from '../../../shared/components/ui/Button';

export default function ResourceUploadModal({ communityId, resource, isOpen, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        visibility: 'public',
        category: 'slide',
        file: null,
        video_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (resource) {
            setFormData({
                title: resource.title,
                description: resource.description,
                visibility: resource.visibility,
                category: resource.category || 'slide',
                video_url: resource.video_url || '',
                file: null
            });
        } else {
            setFormData({
                title: '',
                description: '',
                visibility: 'public',
                category: 'slide',
                video_url: '',
                file: null
            });
        }
    }, [resource, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('visibility', formData.visibility);
        data.append('category', formData.category);
        if (formData.category === 'video') {
            data.append('video_url', formData.video_url);
        } else if (formData.file) {
            if (formData.file.size > 15 * 1024 * 1024) {
                setError("File size exceeds 15MB limit.");
                setLoading(false);
                return;
            }
            data.append('file', formData.file);
        }

        try {
            if (resource) {
                await apiClient.patch(`/contents/resources/${resource.id}/manage/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            } else {
                await apiClient.post(`/contents/resources/create/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }
            onSuccess();
        } catch (err) {
            console.error("Failed to save resource", err);
            setError(err.response?.data?.detail || "Failed to save resource. Please check the file type and size.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-lg">
            <ModalHeader
                title={resource ? 'Edit Resource' : 'Upload New Resource'}
                onClose={onClose}
            />
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div className="space-y-2">
                    <label className="text-body">Title</label>
                    <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full input-standard"
                        placeholder="e.g. Lecture Slides - Week 4"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-body">Description</label>
                    <textarea
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="h-32 w-full resize-none rounded-xl border border-surface-border bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Provide a brief description of this resource..."
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-body">Visibility</label>
                        <select
                            value={formData.visibility}
                            onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                            className="w-full input-standard"
                        >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-body">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full input-standard"
                        >
                            <option value="slide">Slide</option>
                            <option value="video">Video (Link Only)</option>
                            <option value="image">Image</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>

                {formData.category === 'video' ? (
                    <div className="space-y-2">
                        <label className="text-body">Video URL</label>
                        <input
                            required
                            type="url"
                            value={formData.video_url}
                            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                            className="w-full input-standard"
                            placeholder="Paste YouTube/Vimeo/Direct link here..."
                        />
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-body">File</label>
                            <span className="text-metadata text-primary">MAX 15MB</span>
                        </div>
                        <div className="relative">
                            <input
                                type="file"
                                required={!resource}
                                onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file && file.size > 15 * 1024 * 1024) {
                                        alert("This file is bigger than 15MB. Please upload a smaller file.");
                                        e.target.value = null;
                                        return;
                                    }
                                    setFormData({ ...formData, file });
                                }}
                                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                            />
                            <div className="flex w-full items-center justify-between rounded-xl border border-surface-border bg-white px-4 py-3 text-sm">
                                <span className="truncate text-surface-muted">
                                    {formData.file ? formData.file.name : (resource && !formData.file ? 'Keep current file' : 'Select file...')}
                                </span>
                                <Upload size={16} className="text-primary" />
                            </div>
                        </div>
                    </div>
                )}

                {error && <p className="text-xs text-red-600">{error}</p>}

                <div className="flex gap-3 pt-4">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="secondary"
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        isLoading={loading}
                        loadingText="Processing..."
                        className="w-2/3"
                    >
                        {resource ? 'Save Changes' : 'Upload Resource'}
                    </Button>
                </div>
            </form>
        </ModalWrapper>
    );
}
