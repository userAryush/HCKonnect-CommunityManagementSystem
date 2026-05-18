import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../../shared/components/layout/Navbar';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import eventService from '../../events/service/eventService';
import announcementService from '../../announcement/service/announcementService';
import apiClient from '../../../shared/services/apiClient';
import { CommunityDashboardSkeleton } from '../../../shared/components/layout/Skeleton';
import MetricCard from '../components/MetricCardDashboard';
import CreateVacancyModal from '../../vacancy/components/CreateVacancyModal';
import CreateEventModal from '../../events/components/CreateEventModal';
import CreateAnnouncementModal from '../../announcement/components/CreateAnnouncementModal';
import {
    Calendar,
    Users,
    Bell,
    MessageSquare,
    Briefcase,
    TrendingUp,
    Activity,
    GraduationCap,
    Building2,
    Mail,
} from 'lucide-react';
import CommunityMessagePickerModal from '../../../shared/components/modals/CommunityMessagePickerModal';
import SendMessageModal from '../../../shared/components/modals/SendMessageModal';
import vacancyService from '../../vacancy/service/vacancyService';
import { useToast } from '../../../shared/components/ui/ToastContext';
import analyticsService from '../service/analyticsService';
import Footer from '../../../shared/components/layout/Footer';
import DashboardHeader from '../components/DashboardHeader';
import AnalyticsGrid from '../components/AnalyticsGrid';
import UpcomingSchedule from '../components/UpcomingSchedule';
import ActiveVacancies from '../components/ActiveVacancies';
import QuickActions from '../components/QuickActions';
import RecentActivity from '../components/RecentActivity';
import { isPlatformCommunity } from '../../../utils/communityUtils';

export default function CommunityDashboard() {
    const { id } = useParams();
    const { showToast } = useToast();
    const [menuOpen, setMenuOpen] = useState(false);
    const [community, setCommunity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [dashboardEvents, setDashboardEvents] = useState([]);
    const [dashboardAnnouncements, setDashboardAnnouncements] = useState([]);
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(true);
    const [analyticsError, setAnalyticsError] = useState(null);
    const [vacancies, setVacancies] = useState([]);
    const [vacanciesLoading, setVacanciesLoading] = useState(false);
    const [vacancyActionLoadingId, setVacancyActionLoadingId] = useState(null);
    const [vacancyToClose, setVacancyToClose] = useState(null);
    const [isCreateVacancyModalOpen, setCreateVacancyModalOpen] = useState(false);
    const [isCreateEventModalOpen, setCreateEventModalOpen] = useState(false);
    const [isCreateAnnouncementModalOpen, setCreateAnnouncementModalOpen] = useState(false);
    const [isMessagePickerOpen, setMessagePickerOpen] = useState(false);
    const [isSendMessageOpen, setSendMessageOpen] = useState(false);
    const [messageRecipient, setMessageRecipient] = useState(null);

    const buildQuickActions = (platform) => {
        const actions = [
            {
                label: 'Post Notice',
                path: '#',
                onClick: () => setCreateAnnouncementModalOpen(true),
                icon: <Bell size={20} />,
                colorIcon: 'text-blue-500',
                hoverClass: 'hover:border-blue-500 hover:bg-blue-50/50 group-hover:bg-blue-500',
            },
            {
                label: 'Schedule Event',
                path: '#',
                onClick: () => setCreateEventModalOpen(true),
                icon: <Calendar size={20} />,
                colorIcon: 'text-emerald-500',
                hoverClass: 'hover:border-emerald-500 hover:bg-emerald-50/50 group-hover:bg-emerald-500',
            },
            {
                label: 'Start Discussion',
                path: `/community/${id}?tab=Discussions`,
                icon: <MessageSquare size={20} />,
                colorIcon: 'text-purple-500',
                hoverClass: 'hover:border-purple-500 hover:bg-purple-50/50 group-hover:bg-purple-500',
            },
            {
                label: 'Send Message',
                path: '#',
                onClick: () => setMessagePickerOpen(true),
                icon: <Mail size={20} />,
                colorIcon: 'text-sky-500',
                hoverClass: 'hover:border-sky-500 hover:bg-sky-50/50 group-hover:bg-sky-500',
            },
        ];
        if (!platform) {
            actions.splice(2, 0, {
                label: 'Manage Members',
                path: `/community/${id}/manage/members`,
                icon: <Users size={20} />,
                colorIcon: 'text-amber-500',
                hoverClass: 'hover:border-amber-500 hover:bg-amber-50/50 group-hover:bg-amber-500',
            });
            actions.push({
                label: 'Create Vacancy',
                path: '#',
                onClick: () => setCreateVacancyModalOpen(true),
                icon: <Briefcase size={20} />,
                colorIcon: 'text-orange-500',
                hoverClass: 'hover:border-orange-500 hover:bg-orange-50/50 group-hover:bg-orange-500',
            });
        }
        return actions;
    };

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError('');

        const fetchVacancies = async (platform) => {
            if (platform) {
                setVacancies([]);
                return;
            }
            setVacanciesLoading(true);
            try {
                const data = await vacancyService.getVacancies(id);
                if (mounted) setVacancies(data.results || data || []);
            } catch (err) {
                console.error('Failed to load vacancies', err);
                if (mounted) showToast('Failed to load vacancies.', 'error');
            } finally {
                if (mounted) setVacanciesLoading(false);
            }
        };

        const fetchDashboard = async () => {
            setAnalyticsLoading(true);
            setAnalyticsError(null);
            try {
                const [
                    communityRes,
                    eventsData,
                    announcementsData,
                    eventStats,
                    announcementStats,
                    analyticsData,
                ] = await Promise.all([
                    apiClient.get(`/communities/dashboard/${id}/`),
                    eventService.getEvents(id),
                    announcementService.getAnnouncements(1, id),
                    eventService.getEventStats(id),
                    announcementService.getAnnouncementStats(id),
                    analyticsService.getCommunityAnalytics(id).catch((err) => {
                        console.error('Community analytics failed', err);
                        return null;
                    }),
                ]);

                if (!mounted) return;

                const communityData = communityRes.data;
                const platform = isPlatformCommunity(communityData);
                setCommunity(communityData);
                setDashboardEvents(eventsData.results || []);
                setDashboardAnnouncements(announcementsData.results || []);

                setStats({
                    members: platform ? 0 : communityData.member_count,
                    newMembers: platform ? 0 : (communityData.new_members_this_month || 0),
                    announcements: announcementStats.total_announcements,
                    events: eventStats.total_events,
                    upcomingEvents: eventStats.upcoming_events,
                });

                if (analyticsData === null) {
                    setAnalytics(null);
                    setAnalyticsError('Failed to load analytics data.');
                } else {
                    setAnalytics(analyticsData);
                    setAnalyticsError(null);
                }

                await fetchVacancies(platform);
            } catch (err) {
                if (!mounted) return;
                setError('Failed to load community data.');
                console.error(err);
            } finally {
                if (!mounted) return;
                setLoading(false);
                setAnalyticsLoading(false);
            }
        };

        fetchDashboard();
        return () => {
            mounted = false;
        };
    }, [id, showToast]);

    const reloadVacancies = async () => {
        setVacanciesLoading(true);
        try {
            const data = await vacancyService.getVacancies(id);
            setVacancies(data.results || data || []);
        } catch (err) {
            console.error('Failed to load vacancies', err);
            showToast('Failed to refresh vacancies.', 'error');
        } finally {
            setVacanciesLoading(false);
        }
    };

    const reloadDashboardEvents = async () => {
        try {
            const [eventsData, eventStats] = await Promise.all([
                eventService.getEvents(id),
                eventService.getEventStats(id),
            ]);
            setDashboardEvents(eventsData.results || []);
            setStats((prev) => ({
                ...prev,
                events: eventStats.total_events,
                upcomingEvents: eventStats.upcoming_events,
            }));
        } catch (err) {
            console.error('Failed to refresh events', err);
            showToast('Could not refresh events list.', 'error');
        }
    };

    const reloadDashboardAnnouncements = async () => {
        try {
            const [announcementsData, announcementStats] = await Promise.all([
                announcementService.getAnnouncements(1, id),
                announcementService.getAnnouncementStats(id),
            ]);
            setDashboardAnnouncements(announcementsData.results || []);
            setStats((prev) => ({
                ...prev,
                announcements: announcementStats.total_announcements,
            }));
        } catch (err) {
            console.error('Failed to refresh announcements', err);
            showToast('Could not refresh announcements.', 'error');
        }
    };

    const handleCloseVacancy = async () => {
        if (!vacancyToClose) return;
        try {
            setVacancyActionLoadingId(vacancyToClose.id);
            await vacancyService.updateVacancy(vacancyToClose.id, { status: 'CLOSED' });
            await reloadVacancies();
            showToast(`"${vacancyToClose.title}" closed successfully.`, 'success');
            setVacancyToClose(null);
        } catch (err) {
            console.error('Failed to close vacancy', err);
            const message =
                err.response?.data?.detail ||
                err.response?.data?.error ||
                'Failed to close vacancy.';
            showToast(message, 'error');
        } finally {
            setVacancyActionLoadingId(null);
        }
    };

    const combinedActivity = [
        ...dashboardAnnouncements.map((a) => ({
            id: `ann-${a.id}`,
            type: 'announcement',
            content: `Announcement: ${a.title}`,
            time: new Date(a.created_at).toLocaleDateString(),
        })),
        ...dashboardEvents.map((e) => ({
            id: `evt-${e.id}`,
            type: 'event',
            content: `Event: ${e.title}`,
            time: e.created_at ? new Date(e.created_at).toLocaleDateString() : 'Recently',
        })),
    ]
        .sort((a, b) => new Date(b.time) - new Date(a.time))
        .slice(0, 5);

    const platform = isPlatformCommunity(community);
    const quickActions = buildQuickActions(platform);

    const statCards = platform
        ? [
            {
                label: 'Total Students',
                value: analytics?.platform_overview?.total_students ?? 0,
                meta: 'Active students on HCKonnect',
                icon: <GraduationCap className="text-blue-500" size={20} />,
            },
            {
                label: 'Total Communities',
                value: analytics?.platform_overview?.total_communities ?? 0,
                meta: 'Registered student communities',
                icon: <Building2 className="text-violet-500" size={20} />,
            },
            {
                label: 'Upcoming Events',
                value: stats?.upcomingEvents || 0,
                meta: 'Your scheduled events',
                icon: <Calendar className="text-amber-500" size={20} />,
            },
            {
                label: 'Platform Engagements',
                value: analytics?.total_engagements || 0,
                meta: 'System-wide activity this week',
                icon: <Activity className="text-rose-500" size={20} />,
            },
        ]
        : [
            {
                label: 'Total Members',
                value: stats?.members || 0,
                meta: `+ ${stats?.newMembers || 0} new members this month`,
                icon: <Users className="text-blue-500" size={20} />,
            },
            {
                label: 'Weekly Engagement',
                value:
                    analytics?.posts_last_7_days?.[analytics.posts_last_7_days.length - 1]?.count || 0,
                meta: 'Last 7 days activity',
                icon: <TrendingUp className="text-emerald-500" size={20} />,
            },
            {
                label: 'Upcoming Events',
                value: stats?.upcomingEvents || 0,
                meta: 'Scheduled this term',
                icon: <Calendar className="text-amber-500" size={20} />,
            },
            {
                label: 'Community Engagements',
                value: analytics?.total_engagements || 0,
                meta: 'Combined activity this week',
                icon: <Activity className="text-rose-500" size={20} />,
            },
        ];

    const MEMBER_CHART_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'];

    const engagementData = platform
        ? (analytics?.community_member_counts ?? []).map((entry, index) => ({
            name: entry.name,
            value: entry.value,
            color: MEMBER_CHART_COLORS[index % MEMBER_CHART_COLORS.length],
        }))
        : [
            { name: 'Notices', value: analytics?.engagement?.announcements ?? 0, color: '#3b82f6' },
            { name: 'Events', value: analytics?.engagement?.events ?? 0, color: '#10b981' },
            { name: 'Posts', value: analytics?.engagement?.posts ?? 0, color: '#f59e0b' },
            { name: 'Threads', value: analytics?.engagement?.discussions ?? 0, color: '#ef4444' },
        ];

    const engagementChartTitle = platform ? 'Community member counts' : undefined;
    const engagementChartBadge = platform ? 'By Community' : undefined;
    const engagementChartEmpty = platform
        ? {
            title: 'No community members yet',
            description: 'Member counts will appear once students join communities.',
        }
        : undefined;
    const engagementTooltipLabel = platform ? 'Members' : undefined;
    const engagementRotateLabels = platform;

    const hasEngagement = platform
        ? engagementData.length > 0
        : engagementData.some((d) => d.value > 0);

    const leaderboardData = analytics?.comparison || [];
    const maxLeaderScore = Math.max(...leaderboardData.map((d) => d.score), 1);

    const topMembers = analytics?.top_members || [];
    const memberRows = Array.from({ length: 10 }, (_, i) => topMembers[i] || null);

    return (
        <div className="min-h-screen bg-secondary text-surface-body">
            <Navbar
                menuOpen={menuOpen}
                toggleMenu={() => setMenuOpen((v) => !v)}
                closeMenu={() => setMenuOpen(false)}
                navSolid={true}
            />

            <main className="pt-24 pb-16">
                {loading ? (
                    <CommunityDashboardSkeleton />
                ) : error ? (
                    <div className="p-10 text-center">
                        <p className="text-red-500 font-bold">{error}</p>
                    </div>
                ) : !community ? (
                    <div className="p-10 text-center text-surface-muted">No community found.</div>
                ) : (
                    <div className="mx-auto w-full max-w-6xl px-4">
                        <DashboardHeader communityId={id} community={community} />

                        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {statCards.map((stat) => (
                                <MetricCard
                                    key={stat.label}
                                    label={stat.label}
                                    value={stat.value}
                                    meta={stat.meta}
                                    icon={stat.icon}
                                />
                            ))}
                        </div>

                        <AnalyticsGrid
                            engagementData={engagementData}
                            analyticsLoading={analyticsLoading}
                            analyticsError={analyticsError}
                            hasEngagement={hasEngagement}
                            leaderboardData={leaderboardData}
                            maxLeaderScore={maxLeaderScore}
                            memberRows={memberRows}
                            hideTopMembers={platform}
                            leaderboardTitle={platform ? 'All communities engagement' : undefined}
                            engagementChartTitle={engagementChartTitle}
                            engagementChartBadge={engagementChartBadge}
                            engagementChartEmpty={engagementChartEmpty}
                            engagementTooltipLabel={engagementTooltipLabel}
                            engagementRotateLabels={engagementRotateLabels}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3 space-y-8">
                                <UpcomingSchedule events={dashboardEvents.slice(0, 3)} />

                                {!platform && (
                                    <ActiveVacancies
                                        communityId={id}
                                        vacancies={vacancies}
                                        vacanciesLoading={vacanciesLoading}
                                        onAction={setVacancyToClose}
                                        vacancyActionLoadingId={vacancyActionLoadingId}
                                    />
                                )}

                                <QuickActions actions={quickActions} />
                            </div>

                            <div className="lg:col-span-2">
                                <RecentActivity activities={combinedActivity} />
                            </div>
                        </div>
                    </div>
                )}
            </main>

            <Footer />

            <CreateAnnouncementModal
                isOpen={isCreateAnnouncementModalOpen}
                onClose={() => setCreateAnnouncementModalOpen(false)}
                onCreated={reloadDashboardAnnouncements}
            />

            <CreateEventModal
                isOpen={isCreateEventModalOpen}
                onClose={() => setCreateEventModalOpen(false)}
                communityId={id}
                onCreated={reloadDashboardEvents}
            />

            <CreateVacancyModal
                isOpen={isCreateVacancyModalOpen}
                onClose={() => setCreateVacancyModalOpen(false)}
                communityId={id}
                onVacancyCreated={reloadVacancies}
            />

            <ConfirmationModal
                isOpen={Boolean(vacancyToClose)}
                onClose={() => {
                    if (!vacancyActionLoadingId) setVacancyToClose(null);
                }}
                onConfirm={handleCloseVacancy}
                title="Close vacancy?"
                message="Applicants will still be visible, but this vacancy will stop accepting new applications."
                confirmText="Close Vacancy"
                isLoading={Boolean(vacancyActionLoadingId)}
            />

            <CommunityMessagePickerModal
                isOpen={isMessagePickerOpen}
                onClose={() => setMessagePickerOpen(false)}
                currentCommunityId={id}
                isPlatform={platform}
                onSelect={(recipient) => {
                    setMessageRecipient(recipient);
                    setMessagePickerOpen(false);
                    setSendMessageOpen(true);
                }}
            />

            <SendMessageModal
                isOpen={isSendMessageOpen}
                onClose={() => {
                    setSendMessageOpen(false);
                    setMessageRecipient(null);
                }}
                communityId={messageRecipient?.id}
                communityName={messageRecipient?.community_name}
                communityEmail={messageRecipient?.email}
                senderEmail={community?.email}
            />
        </div>
    );
}
