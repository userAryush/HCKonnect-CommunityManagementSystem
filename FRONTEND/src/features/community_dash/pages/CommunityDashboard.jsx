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
import {
    Calendar,
    Users,
    Bell,
    MessageSquare,
    Briefcase,
    TrendingUp,
    Activity,
} from 'lucide-react';
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

    const quickActions = [
        {
            label: 'Post Notice',
            path: `/community/${id}/manage/announcements/create`,
            icon: <Bell size={20} />,
            colorIcon: 'text-blue-500',
            hoverClass: 'hover:border-blue-500 hover:bg-blue-50/50 group-hover:bg-blue-500',
        },
        {
            label: 'Schedule Event',
            path: `/community/${id}/manage/events/create`,
            icon: <Calendar size={20} />,
            colorIcon: 'text-emerald-500',
            hoverClass: 'hover:border-emerald-500 hover:bg-emerald-50/50 group-hover:bg-emerald-500',
        },
        {
            label: 'Manage Members',
            path: `/community/${id}/manage/members`,
            icon: <Users size={20} />,
            colorIcon: 'text-amber-500',
            hoverClass: 'hover:border-amber-500 hover:bg-amber-50/50 group-hover:bg-amber-500',
        },
        {
            label: 'Start Discussion',
            path: `/community/${id}?tab=Discussions`,
            icon: <MessageSquare size={20} />,
            colorIcon: 'text-purple-500',
            hoverClass: 'hover:border-purple-500 hover:bg-purple-50/50 group-hover:bg-purple-500',
        },
        {
            label: 'Create Vacancy',
            path: `#`,
            onClick: () => setCreateVacancyModalOpen(true),
            icon: <Briefcase size={20} />,
            colorIcon: 'text-orange-500',
            hoverClass: 'hover:border-orange-500 hover:bg-orange-50/50 group-hover:bg-orange-500',
        },
    ];

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        setError('');

        const fetchVacancies = async () => {
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

                setCommunity(communityRes.data);
                setDashboardEvents(eventsData.results || []);
                setDashboardAnnouncements(announcementsData.results || []);

                setStats({
                    members: communityRes.data.member_count,
                    newMembers: communityRes.data.new_members_this_month || 0,
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
        fetchVacancies();
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

    const statCards = [
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

    const engagementData = [
        { name: 'Notices', value: analytics?.engagement?.announcements ?? 0, color: '#3b82f6' },
        { name: 'Events', value: analytics?.engagement?.events ?? 0, color: '#10b981' },
        { name: 'Posts', value: analytics?.engagement?.posts ?? 0, color: '#f59e0b' },
        { name: 'Threads', value: analytics?.engagement?.discussions ?? 0, color: '#ef4444' },
    ];

    const hasEngagement = engagementData.some((d) => d.value > 0);

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
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            <div className="lg:col-span-3 space-y-8">
                                <UpcomingSchedule events={dashboardEvents.slice(0, 3)} />

                                <ActiveVacancies
                                    communityId={id}
                                    vacancies={vacancies}
                                    vacanciesLoading={vacanciesLoading}
                                    onAction={setVacancyToClose}
                                    vacancyActionLoadingId={vacancyActionLoadingId}
                                />

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
        </div>
    );
}
