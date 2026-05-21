import { Link } from 'react-router-dom';
import { Calendar, Users, FolderKanban, Briefcase } from 'lucide-react';
import { formatTimeAgo } from '../../../../utils/timeFormatter';
import Button from '../../../../shared/components/ui/Button';
import { Skeleton } from '../../../../shared/components/layout/Skeleton';
import { isPlatformCommunity } from '../../../../utils/communityUtils';

const ProfileSection = ({ children, className = '' }) => (
    <section className={`rounded-xl bg-secondary p-5 ${className}`.trim()}>
        {children}
    </section>
);

const SoftContainer = ({ children, className = '' }) => (
    <div className={`community-soft-card bg-[var(--surface-card)] border border-surface-border/10 rounded-xl p-5 ${className}`}>
        {children}
    </div>
);

export default function OverviewTab({ communityData, tabData, loadingTab, canManageContent, handleTabChange }) {
    const platform = isPlatformCommunity(communityData);

    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
                <ProfileSection>
                    <h2 className="text-lg font-semibold text-surface-dark mb-3">About</h2>
                    <p className="text-sm leading-relaxed text-surface-muted whitespace-pre-line">
                        {communityData.community_description}
                    </p>
                </ProfileSection>

                <ProfileSection>
                    <div className="flex items-center justify-between mb-6 border-b border-surface-border/40 pb-3">
                        <h2 className="text-lg font-semibold text-surface-dark">Upcoming Schedule</h2>
                    </div>

                    <div className="space-y-4">
                        {loadingTab ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-4 py-2">
                                        <Skeleton variant="rect" className="w-14 h-14 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton variant="text" className="w-3/4 h-4" />
                                            <Skeleton variant="text" className="w-1/2 h-3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : tabData.events.length === 0 ? (
                            <p className="py-8 text-center text-surface-muted">No upcoming events scheduled.</p>
                        ) : (
                            <div className="divide-y divide-surface-border/30">
                                {tabData.events.slice(0, 3).map(event => (
                                    <div
                                        key={event.id}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-0 last:pb-0"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/10 text-primary rounded-xl p-3 text-center min-w-[60px]">
                                                <p className="text-xs font-bold uppercase">{event.date ? new Date(event.date).toLocaleDateString('en-US', { month: 'short' }) : 'TBD'}</p>
                                                <p className="text-lg font-black leading-none">{event.date ? new Date(event.date).getDate() : '--'}</p>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-sm text-surface-dark line-clamp-1">{event.title}</h4>
                                                <p className="text-[10px] text-surface-muted flex items-center gap-1 mt-1 font-medium">
                                                    <Calendar size={12} /> {event.start_time || 'TBD'} • {event.location || 'Online'}
                                                </p>
                                            </div>
                                        </div>
                                        {canManageContent === true && (
                                            <Link to={`/events/${event.id}`}>
                                                <Button variant="secondary" className="!px-4 !py-1.5 !text-[11px] font-bold whitespace-nowrap text-center">
                                                    Manage
                                                </Button>
                                            </Link>
                                        )}
                                    </div>
                                ))}

                                {tabData.events.length > 3 && (
                                    <button
                                        type="button"
                                        onClick={() => handleTabChange('Events')}
                                        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors inline-block w-full text-center pt-2"
                                    >
                                        View all events
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </ProfileSection>

                {!platform && (
                    <ProfileSection>
                        <div className="flex items-center justify-between mb-6 border-b border-surface-border/40 pb-3">
                            <h2 className="text-lg font-semibold text-surface-dark">Open Vacancies</h2>
                            <button
                                type="button"
                                onClick={() => handleTabChange('Vacancies')}
                                className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                            >
                                VIEW ALL
                            </button>
                        </div>

                        <div className="space-y-4">
                            {loadingTab ? (
                                <div className="space-y-4">
                                    {[1, 2].map(i => (
                                        <div key={i} className="h-16 rounded-xl bg-surface-muted-bg/60 animate-pulse" />
                                    ))}
                                </div>
                            ) : tabData.vacancies.length === 0 ? (
                                <p className="py-8 text-center text-surface-muted">No open vacancies at the moment.</p>
                            ) : (
                                <div className="divide-y divide-surface-border/30">
                                    {tabData.vacancies.slice(0, 2).map(vacancy => (
                                        <div
                                            key={vacancy.id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => handleTabChange('Vacancies')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleTabChange('Vacancies');
                                                }
                                            }}
                                            className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0 cursor-pointer transition-colors hover:opacity-90"
                                        >
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                                    <Briefcase size={24} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-sm text-surface-dark">{vacancy.title}</h4>
                                                    <p className="text-[10px] text-surface-muted mt-0.5 line-clamp-1">
                                                        {vacancy.description.slice(0, 60)}...
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary uppercase">
                                                Apply
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </ProfileSection>
                )}
            </div>

            <aside className="space-y-6 sticky top-28">
                <SoftContainer>
                    <div className="flex items-center justify-between mb-4 border-b border-surface-border pb-2">
                        <h3 className="text-metadata tracking-[0.05em] uppercase font-bold text-zinc-500">Recent News</h3>
                        <button
                            type="button"
                            onClick={() => handleTabChange('Announcements')}
                            className="text-[11px] font-bold text-primary hover:text-primary/80 transition-colors"
                        >
                            VIEW ALL
                        </button>
                    </div>
                    <div className="space-y-1">
                        {loadingTab ? (
                            <div className="space-y-3 p-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton variant="text" className="w-full h-4" />
                                        <Skeleton variant="text" className="w-2/3 h-3" />
                                    </div>
                                ))}
                            </div>
                        ) : tabData.announcements.length === 0 ? (
                            <p className="text-metadata italic p-4 text-center">No new announcements lately.</p>
                        ) : (
                            tabData.announcements.slice(0, 3).map((ann) => (
                                <div
                                    key={ann.id}
                                    role="button"
                                    tabIndex={0}
                                    className="group p-3 rounded-xl hover:bg-secondary/40 border border-transparent hover:border-surface-border/70 hover:shadow-sm transition-all cursor-pointer"
                                    onClick={() => handleTabChange('Announcements')}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleTabChange('Announcements');
                                        }
                                    }}
                                >
                                    <h4 className="text-body font-semibold line-clamp-1 group-hover:text-primary transition-colors">{ann.title}</h4>
                                    <div className="flex items-center gap-2 mt-1">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tight">{ann.community_name}</p>
                                        <span className="text-[10px] text-zinc-400 font-medium">• {formatTimeAgo(ann.created_at)}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </SoftContainer>

                <SoftContainer>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-muted mb-4">
                        Quick Actions
                    </h3>
                    <div className="flex flex-col space-y-2">
                        {!platform && (
                            <Button
                                variant="outline"
                                onClick={() => handleTabChange('Members')}
                                className="w-full !justify-start !py-2.5 !px-4"
                            >
                                <Users size={16} className="mr-3 text-primary" />
                                View Members
                            </Button>
                        )}
                        <Button
                            variant="outline"
                            onClick={() => handleTabChange('Resources')}
                            className="w-full !justify-start !py-2.5 !px-4"
                        >
                            <FolderKanban size={16} className="mr-3 text-primary" />
                            Access Resources
                        </Button>
                        {!platform && (
                            <Button
                                variant="outline"
                                onClick={() => handleTabChange('Vacancies')}
                                className="w-full !justify-start !py-2.5 !px-4"
                            >
                                <Briefcase size={16} className="mr-3 text-primary" />
                                Explore Vacancies
                            </Button>
                        )}
                    </div>
                </SoftContainer>
            </aside>
        </div>
    );
}
