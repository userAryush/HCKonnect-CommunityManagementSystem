import { useState, useEffect } from 'react';
import { X, Upload, File, Loader2 } from 'lucide-react';
import apiClient from '../../services/apiClient';

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

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 shadow-2xl">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#0d1f14]">
                        {resource ? 'Edit Resource' : 'Upload New Resource'}
                    </h2>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-[#f4f5f2] hover:text-[#0d1f14]">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#4b4b4b]">Title</label>
                        <input
                            required
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#75C043]/20"
                            placeholder="e.g. Lecture Slides - Week 4"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-[#4b4b4b]">Description</label>
                        <textarea
                            required
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="h-32 w-full resize-none rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#75C043]/20"
                            placeholder="Provide a brief description of this resource..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#4b4b4b]">Visibility</label>
                            <select
                                value={formData.visibility}
                                onChange={(e) => setFormData({ ...formData, visibility: e.target.value })}
                                className="w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#75C043]/20"
                            >
                                <option value="public">Public</option>
                                <option value="private">Private</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-[#4b4b4b]">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#75C043]/20"
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
                            <label className="text-sm font-semibold text-[#4b4b4b]">Video URL</label>
                            <input
                                required
                                type="url"
                                value={formData.video_url}
                                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                                className="w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#75C043]/20"
                                placeholder="Paste YouTube/Vimeo/Direct link here..."
                            />
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-[#4b4b4b]">File</label>
                                <span className="text-[10px] text-[#75C043] font-bold">MAX 15MB</span>
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
                                <div className="flex w-full items-center justify-between rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm">
                                    <span className="truncate text-gray-500">
                                        {formData.file ? formData.file.name : (resource && !formData.file ? 'Keep current file' : 'Select file...')}
                                    </span>
                                    <Upload size={16} className="text-[#75C043]" />
                                </div>
                            </div>
                        </div>
                    )}

                    {error && <p className="text-xs text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-2xl bg-[#f4f5f2] py-3.5 text-sm font-bold text-[#0d1f14] transition hover:bg-[#e5e7eb]"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex flex-[2] items-center justify-center gap-2 rounded-2xl bg-[#0d1f14] py-3.5 text-sm font-bold text-white transition hover:bg-[#0d1f14]/90 disabled:opacity-70"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="animate-spin" size={18} />
                                    Processing...
                                </>
                            ) : (
                                resource ? 'Save Changes' : 'Upload Resource'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
