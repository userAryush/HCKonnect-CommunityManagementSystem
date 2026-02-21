import { useState, useEffect } from 'react';
import apiClient from '../../services/apiClient';
import ResourceCard from '../../components/cards/ResourceCard';
import ResourceUploadModal from '../../components/modals/ResourceUploadModal';
import { Plus, Search, Filter } from 'lucide-react';

export default function ResourceList({ communityId, initialUploadOpen = false }) {
    const [resources, setResources] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [editingResource, setEditingResource] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const isCommunityAdmin = user && (
        (user.role === 'community' && String(user.id) === String(communityId)) ||
        (user.membership && user.membership.role === 'representative' && String(user.membership.community) === String(communityId))
    );

    const fetchResources = async () => {
        try {
            setLoading(true);
            const res = await apiClient.get(`/contents/resources/?community_id=${communityId}`);
            setResources(res.data.results || res.data);
            setError(null);
        } catch (err) {
            console.error("Failed to fetch resources", err);
            setError("Failed to load resources. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (communityId) {
            fetchResources();
        }
        if (initialUploadOpen && isCommunityAdmin) {
            setShowUploadModal(true);
        }
    }, [communityId, initialUploadOpen, isCommunityAdmin]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this resource?")) {
            try {
                await apiClient.delete(`/contents/resources/${id}/manage/`);
                setResources(resources.filter(r => r.id !== id));
            } catch (err) {
                console.error("Failed to delete resource", err);
                alert("Failed to delete resource");
            }
        }
    };

    const handleEdit = (resource) => {
        setEditingResource(resource);
        setShowUploadModal(true);
    };

    const filteredResources = resources.filter(resource =>
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-[#4b4b4b]">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#75C043] border-t-transparent"></div>
                <p className="mt-4 font-medium italic">Loading resources...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search resources..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-2xl border border-[#e5e7eb] bg-white py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#75C043]/20"
                    />
                </div>

                <div className="flex items-center gap-3">
                    {isCommunityAdmin && (
                        <button
                            onClick={() => {
                                setEditingResource(null);
                                setShowUploadModal(true);
                            }}
                            className="flex items-center gap-2 rounded-2xl bg-[#75C043] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#68ac3b]"
                        >
                            <Plus size={18} />
                            Upload New Resource
                        </button>
                    )}
                </div>
            </div>

            {error ? (
                <div className="rounded-3xl border border-red-100 bg-red-50 p-10 text-center text-red-600">
                    <p>{error}</p>
                </div>
            ) : filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredResources.map((resource) => (
                        <ResourceCard
                            key={resource.id}
                            resource={resource}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-3xl border border-[#e5e7eb] bg-white p-20 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f4f5f2] text-[#4b4b4b]">
                        <Search size={32} />
                    </div>
                    <h3 className="mt-4 text-lg font-bold">No resources found</h3>
                    <p className="mt-1 text-sm text-[#4b4b4b]">
                        {searchQuery ? "No resources match your search criteria." : "There are no resources available in this community yet."}
                    </p>
                </div>
            )}

            {showUploadModal && (
                <ResourceUploadModal
                    communityId={communityId}
                    resource={editingResource}
                    isOpen={showUploadModal}
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        fetchResources();
                    }}
                />
            )}
        </div>
    );
}
