import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../authentication/components/AuthContext';
import { getDisplayName, getInitials, getProfileImage, getRoleLabel } from '../../../utils/userUtils';
import apiClient from '../../../shared/services/apiClient';
import postService from '../../posts/service/postService';
import eventService from '../../events/service/eventService';

export default function MiniProfileCard() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        posts: null,
        eventParticipated: null,
        discussions: null,
        membersCount: null,
        upcomingEvents: null,
    });

    if (!user) return null;

    const displayName = getDisplayName(user);
    const profileImage = getProfileImage(user);
    const initials = getInitials(displayName);
    const roleLabel = getRoleLabel(user);

    const membership = user.membership;
    const isMember = !!membership;
    const isCommunityAccount = user.role === 'community';
    const communityId = (isCommunityAccount ? user.id : null) ||
        membership?.community_id ||
        membership?.community?.id ||
        membership?.community;

    useEffect(() => {
        let isMounted = true;

        const countUserContent = async () => {
            try {
                const profileDetail = await apiClient.get(`/accounts/profile/${user.id}/`);
                const postedContent = profileDetail?.data?.posted_content || [];
                return {
                    posts: postedContent.filter((item) => item.type === 'post').length,
                    discussions: postedContent.filter((item) => item.type === 'discussion').length,
                };
            } catch (error) {
                return { posts: user.posts_count ?? 0, discussions: user.discussions_count ?? 0 };
            }
        };

        const countParticipatedEvents = async () => {
            try {
                let page = 1;
                let hasNext = true;
                let participated = 0;
                const maxPages = 20;

                while (hasNext && page <= maxPages) {
                    const eventData = await eventService.getEvents(null, page);
                    const eventResults = eventData?.results || [];
                    participated += eventResults.filter((event) => event.is_registered).length;
                    hasNext = Boolean(eventData?.next);
                    page += 1;
                }

                return participated;
            } catch (error) {
                return user.events_count ?? 0;
            }
        };

        const fetchStats = async () => {
            if (isCommunityAccount && communityId) {
                try {
                    const [communityRes, eventStats, communityPosts] = await Promise.all([
                        apiClient.get(`/communities/dashboard/${communityId}/`),
                        eventService.getEventStats(communityId),
                        postService.getPostsForCommunity(communityId),
                    ]);

                    if (!isMounted) return;

                    setStats({
                        posts: communityPosts?.count ?? communityPosts?.results?.length ?? user.posts_count ?? 0,
                        eventParticipated: null,
                        discussions: null,
                        membersCount: communityRes?.data?.member_count ?? 0,
                        upcomingEvents: eventStats?.upcoming_events ?? 0,
                    });
                } catch (error) {
                    if (!isMounted) return;
                    setStats({
                        posts: user.posts_count ?? 0,
                        eventParticipated: null,
                        discussions: null,
                        membersCount: null,
                        upcomingEvents: null,
                    });
                }
                return;
            }

            const [contentCounts, participatedEvents] = await Promise.all([
                countUserContent(),
                countParticipatedEvents(),
            ]);

            if (!isMounted) return;

            setStats({
                posts: contentCounts.posts,
                eventParticipated: participatedEvents,
                discussions: contentCounts.discussions,
                membersCount: null,
                upcomingEvents: null,
            });
        };

        fetchStats();
        return () => {
            isMounted = false;
        };
    }, [communityId, isCommunityAccount, user.discussions_count, user.events_count, user.id, user.posts_count]);

    const statItems = useMemo(() => {
        if (isCommunityAccount) {
            return [
                { num: stats.posts ?? '—', lbl: 'Posts' },
                { num: stats.membersCount ?? '—', lbl: 'Members' },
                { num: stats.upcomingEvents ?? '—', lbl: 'Next Events' },
            ];
        }

        return [
            { num: stats.posts ?? '—', lbl: 'Posts' },
            { num: stats.eventParticipated ?? '—', lbl: 'Event Attended' },
            { num: stats.discussions ?? '—', lbl: 'Discussions' },
        ];
    }, [isCommunityAccount, stats.discussions, stats.eventParticipated, stats.membersCount, stats.posts, stats.upcomingEvents]);

    return (
        <div className="mini-profile-card">

            <div className="relative p-6 flex flex-col items-center">
                {/* Avatar */}
                <div className="mb-3">
                    {profileImage ? (
                        <img
                            src={profileImage}
                            alt={displayName}
                            className="h-16 w-16 rounded-full object-cover mini-profile-avatar" />
                    ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full mini-profile-avatar-fallback">
                            <span className="text-lg font-bold uppercase tracking-wider text-white">
                                {initials}
                            </span>
                        </div>
                    )}
                </div>

                {/* Name + Role */}
                <div className="text-center">
                    <Link
                        to="/profile"
                        className="block text-[15px] tracking-[-0.01em] font-semibold text-white transition-opacity hover:opacity-80">
                        {displayName}
                    </Link>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-white/70">
                        {roleLabel}
                    </p>
                </div>

                {/* Stats row */}
                <div className="mt-5 w-full grid grid-cols-3 gap-2">
                    {statItems.map(({ num, lbl }) => (
                        <div key={lbl} className="mini-profile-stat">
                            <span className="text-[15px] font-bold text-white">{num}</span>
                            <span className="text-[9px] uppercase tracking-[0.07em] text-white/70">{lbl}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}