import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../../../shared/components/layout/Navbar';
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal';
import dashboardService from '../service/dashboardService';
import { CommunityDashboardSkeleton } from '../../../shared/components/layout/Skeleton';
import MetricCard from '../components/MetricCardDashboard';
import CreateVacancyModal from '../../vacancy/components/CreateVacancyModal';
import CreateEventModal from '../../events/components/CreateEventModal';
import CreateAnnouncementModal from '../../announcement/components/CreateAnnouncementModal';
import ResourceUploadModal from '../../resource/components/ResourceUploadModal';
import CreatePostModal from '../../posts/components/CreatePostModal';
import EditProfileModal from '../../profile/components/shared/EditProfileModal';
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
    FolderKanban,
    PenLine,
    Edit2,
} from 'lucide-react';
import CommunityMessagePickerModal from '../../../shared/components/modals/CommunityMessagePickerModal';
import SendMessageModal from '../../../shared/components/modals/SendMessageModal';
import vacancyService from '../../vacancy/service/vacancyService';
import { useToast } from '../../../shared/components/ui/ToastContext';
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
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    const [dashboardEvents, setDashboardEvents] = useState([]);
    const [dashboardAnnouncements, setDashboardAnnouncements] = useState([]);
    const [stats, setStats] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [analyticsError, setAnalyticsError] = useState(null);
    const [vacancies, setVacancies] = useState([]);
    const [vacanciesLoading, setVacanciesLoading] = useState(false);
    const [vacancyActionLoadingId, setVacancyActionLoadingId] = useState(null);
    const [vacancyToClose, setVacancyToClose] = useState(null);
    const [isCreateVacancyModalOpen, setCreateVacancyModalOpen] = useState(false);
    const [isCreateEventModalOpen, setCreateEventModalOpen] = useState(false);
    const [isCreateAnnouncementModalOpen, setCreateAnnouncementModalOpen] = useState(false);
    const [isResourceUploadModalOpen, setResourceUploadModalOpen] = useState(false);
    const [isCreatePostModalOpen, setCreatePostModalOpen] = useState(false);
    const [isEditProfileModalOpen, setEditProfileModalOpen] = useState(false);
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
                label: 'Add Post',
                path: '#',
                onClick: () => setCreatePostModalOpen(true),
                icon: <PenLine size={20} />,
                colorIcon: 'text-indigo-500',
                hoverClass: 'hover:border-indigo-500 hover:bg-indigo-50/50 group-hover:bg-indigo-500',
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
                label: 'Upload Resources',
                path: '#',
                onClick: () => setResourceUploadModalOpen(true),
                icon: <FolderKanban size={20} />,
                colorIcon: 'text-teal-500',
                hoverClass: 'hover:border-teal-500 hover:bg-teal-50/50 group-hover:bg-teal-500',
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
            {
                label: 'Edit Profile',
                path: '#',
                onClick: () => setEditProfileModalOpen(true),
                icon: <Edit2 size={20} />,
                colorIcon: 'text-rose-500',
                hoverClass: 'hover:border-rose-500 hover:bg-rose-50/50 group-hover:bg-rose-500',
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

    const applySummaryData = (data) => {
        const communityData = data.dashboard;
        const platform = isPlatformCommunity(communityData);

        setCommunity(communityData);
        setDashboardEvents(Array.isArray(data.events) ? data.events : []);
        setDashboardAnnouncements(Array.isArray(data.announcements) ? data.announcements : []);

        const eventStats = data.events_stats || {};
        const announcementStats = data.announcements_stats || {};

        setStats({
            members: platform ? 0 : communityData.member_count,
            newMembers: platform ? 0 : (communityData.new_members_this_month || 0),
            announcements: announcementStats.total_announcements ?? 0,
            events: eventStats.total_events ?? 0,
            upcomingEvents: eventStats.upcoming_events ?? 0,
        });

        const analyticsData = data.analytics;
        if (analyticsData && Object.keys(analyticsData).length > 0) {
            setAnalytics(analyticsData);
            setAnalyticsError(null);
        } else {
            setAnalytics(null);
            setAnalyticsError(null);
        }

        if (platform) {
            setVacancies([]);
        } else {
            setVacancies(Array.isArray(data.vacancies) ? data.vacancies : []);
        }
    };

    const reloadDashboard = async () => {
        try {
            const data = await dashboardService.getSummary(id);
            applySummaryData(data);
        } catch (err) {
            console.error('Failed to reload dashboard', err);
            showToast('Failed to refresh dashboard.', 'error');
        }
    };

    useEffect(() => {
        let mounted = true;

        const loadDashboard = async () => {
            setIsLoading(true);
            setError('');
            setAnalyticsError(null);

            try {
                const data = await dashboardService.getSummary(id);
                if (!mounted) return;
                applySummaryData(data);
            } catch (err) {
                if (!mounted) return;
                setError('Failed to load community data.');
                console.error('Dashboard summary failed', err);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        loadDashboard();
        return () => {
            mounted = false;
        };
    }, [id]);

    const reloadVacancies = async () => {
        setVacanciesLoading(true);
        try {
            const data = await dashboardService.getSummary(id);
            const platform = isPlatformCommunity(data.dashboard);
            if (!platform) {
                setVacancies(Array.isArray(data.vacancies) ? data.vacancies : []);
            }
        } catch (err) {
            console.error('Failed to load vacancies', err);
            showToast('Failed to refresh vacancies.', 'error');
        } finally {
            setVacanciesLoading(false);
        }
    };

    const reloadDashboardEvents = async () => {
        try {
            const data = await dashboardService.getSummary(id);
            setDashboardEvents(Array.isArray(data.events) ? data.events : []);
            const eventStats = data.events_stats || {};
            setStats((prev) => ({
                ...prev,
                events: eventStats.total_events ?? 0,
                upcomingEvents: eventStats.upcoming_events ?? 0,
            }));
        } catch (err) {
            console.error('Failed to refresh events', err);
            showToast('Could not refresh events list.', 'error');
        }
    };

    const reloadDashboardAnnouncements = async () => {
        try {
            const data = await dashboardService.getSummary(id);
            setDashboardAnnouncements(
                Array.isArray(data.announcements) ? data.announcements : []
            );
            const announcementStats = data.announcements_stats || {};
            setStats((prev) => ({
                ...prev,
                announcements: announcementStats.total_announcements ?? 0,
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
                {isLoading ? (
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
                            analyticsLoading={isLoading}
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

            <ResourceUploadModal
                communityId={id}
                isOpen={isResourceUploadModalOpen}
                onClose={() => setResourceUploadModalOpen(false)}
                onSuccess={() => {
                    setResourceUploadModalOpen(false);
                    showToast('Resource uploaded successfully.', 'success');
                }}
            />

            <CreatePostModal
                isOpen={isCreatePostModalOpen}
                onClose={() => setCreatePostModalOpen(false)}
            />

            <EditProfileModal
                isOpen={isEditProfileModalOpen}
                onClose={() => setEditProfileModalOpen(false)}
                profileId={id}
                onSaved={reloadDashboard}
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
