import { useEffect, useMemo, useState } from 'react';
import { Mail, Search, Loader2 } from 'lucide-react';
import apiClient from '../../services/apiClient';
import ModalWrapper from './ModalWrapper';
import ModalHeader from './ModalHeader';
import { getInitials } from '../../../utils/userUtils';

function sortCommunitiesForPicker(communities, currentCommunityId, isPlatform) {
    const others = communities.filter((c) => String(c.id) !== String(currentCommunityId));

    if (isPlatform) {
        return others
            .filter((c) => !c.is_platform_community)
            .sort((a, b) => (a.community_name || '').localeCompare(b.community_name || ''));
    }

    const platform = others.find((c) => c.is_platform_community);
    const studentCommunities = others
        .filter((c) => !c.is_platform_community)
        .sort((a, b) => (a.community_name || '').localeCompare(b.community_name || ''));

    return platform ? [platform, ...studentCommunities] : studentCommunities;
}

export default function CommunityMessagePickerModal({
    isOpen,
    onClose,
    currentCommunityId,
    isPlatform,
    onSelect,
}) {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectingId, setSelectingId] = useState(null);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    useEffect(() => {
        if (!isOpen) {
            setSearch('');
            setError('');
            setSelectingId(null);
            return;
        }

        let mounted = true;
        setLoading(true);
        setError('');

        apiClient
            .get('/communities/communities-list/')
            .then((res) => {
                if (!mounted) return;
                setCommunities(Array.isArray(res.data) ? res.data : res.data?.results || []);
            })
            .catch(() => {
                if (!mounted) return;
                setError('Could not load communities. Please try again.');
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => {
            mounted = false;
        };
    }, [isOpen]);

    const sorted = useMemo(
        () => sortCommunitiesForPicker(communities, currentCommunityId, isPlatform),
        [communities, currentCommunityId, isPlatform],
    );

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return sorted;
        return sorted.filter((c) =>
            (c.community_name || '').toLowerCase().includes(q) ||
            (c.community_description || '').toLowerCase().includes(q),
        );
    }, [sorted, search]);

    const handleSelect = async (community) => {
        setSelectingId(community.id);
        setError('');
        try {
            const res = await apiClient.get(`/communities/dashboard/${community.id}/`);
            onSelect({
                id: community.id,
                community_name: community.community_name || res.data.community_name,
                email: res.data.email,
            });
        } catch {
            setError('Could not load community details. Please try again.');
        } finally {
            setSelectingId(null);
        }
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={onClose} className="max-w-6xl">
            <ModalHeader
                title="Send a Message"
                subtitle={
                    isPlatform
                        ? 'Choose a community to contact'
                        : 'Platform organization listed first, then other communities'
                }
                onClose={onClose}
            />

            <div className="px-6 pb-6 space-y-4">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-muted" />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search communities..."
                        className="w-full input-standard pl-2"
                    />
                </div>

                {error && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
                        {error}
                    </p>
                )}

                <div className="max-h-[min(24rem,50vh)] overflow-y-auto space-y-2 pr-1">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-surface-muted">
                            <Loader2 size={28} className="animate-spin text-primary mb-2" />
                            <p className="text-sm">Loading communities...</p>
                        </div>
                    ) : filtered.length === 0 ? (
                        <p className="text-center text-sm text-surface-muted py-10">
                            {search ? 'No communities match your search.' : 'No communities available to message.'}
                        </p>
                    ) : (
                        filtered.map((c) => {
                            const isSelecting = selectingId === c.id;
                            return (
                                <button
                                    key={c.id}
                                    type="button"
                                    disabled={Boolean(selectingId)}
                                    onClick={() => handleSelect(c)}
                                    className="w-full flex items-center gap-3 rounded-xl border border-surface-border/70 bg-[var(--surface-card)] p-3 text-left transition hover:border-primary/30 hover:bg-primary/5 disabled:opacity-60"
                                >
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-surface-border/60 bg-secondary">
                                        {c.community_logo ? (
                                            <img
                                                src={c.community_logo}
                                                alt=""
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <span className="text-xs font-bold text-surface-muted">
                                                {getInitials(c.community_name || 'C')}
                                            </span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-semibold text-surface-dark truncate">
                                                {c.community_name}
                                            </span>
                                            {c.is_platform_community && (
                                                <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                                                    Platform
                                                </span>
                                            )}
                                        </div>
                                        {c.community_description && (
                                            <p className="text-xs text-surface-muted line-clamp-1 mt-0.5">
                                                {c.community_description}
                                            </p>
                                        )}
                                    </div>
                                    {isSelecting ? (
                                        <Loader2 size={18} className="shrink-0 animate-spin text-primary" />
                                    ) : (
                                        <Mail size={18} className="shrink-0 text-primary opacity-70" />
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>
            </div>
        </ModalWrapper>
    );
}
