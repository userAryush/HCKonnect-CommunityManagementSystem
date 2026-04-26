import { Link } from 'react-router-dom';
import { Calendar, Users, FolderKanban, Briefcase } from 'lucide-react';
import { formatTimeAgo } from '../../../../utils/timeFormatter';
import Button from '../../../../shared/components/ui/Button';
import { Skeleton } from '../../../../shared/components/layout/Skeleton';

// Reusable Soft Container Component
const SoftContainer = ({ children, className = '' }) => (
    <div className={`community-soft-card bg-[var(--surface-card)] border border-surface-border/10 rounded-xl p-5 ${className}`}>
        {children}
    </div>
);

export default function OverviewTab({ communityData, tabData, loadingTab, canManageContent, handleTabChange }) {
    return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* LEFT: Primary Content (70%) */}
            <div className="lg:col-span-2 space-y-6">
                {/* About Section */}
                <SoftContainer>
                    <h2 className="text-lg font-semibold text-surface-dark mb-3">About</h2>
                    <p className="text-sm leading-relaxed text-surface-muted whitespace-pre-line">
                        {communityData.community_description}
                    </p>
                </SoftContainer>

                {/* Upcoming Schedule Section */}
                <SoftContainer>
                    <div className="flex items-center justify-between mb-6 border-b border-surface-border/60 pb-3">
                        <h2 className="text-lg font-semibold text-surface-dark">Upcoming Schedule</h2>
                    </div>

                    <div className="space-y-4">
                        {loadingTab ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="card-border flex items-center !p-4 gap-4">
                                        <Skeleton variant="rect" className="w-14 h-14 rounded-xl" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton variant="text" className="w-3/4 h-4" />
                                            <Skeleton variant="text" className="w-1/2 h-3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : tabData.events.length === 0 ? (
                            <div className="card-border text-center text-surface-muted !py-8">No upcoming events scheduled.</div>
                        ) : (
                            <div className="space-y-4">
                                {tabData.events.slice(0, 3).map(event => (
                                    <div key={event.id} className="card-border flex flex-col sm:flex-row sm:items-center justify-between !p-4 gap-4 transition-all hover:bg-zinc-50/50">
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
                                        {(canManageContent === true) && (
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
                                        onClick={() => handleTabChange('Events')}
                                        className="text-xs font-bold text-primary hover:text-primary/80 transition-colors inline-block w-full text-center mt-2"
                                    >
                                        View all events
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </SoftContainer>

                {/* Open Vacancies Section */}
                <SoftContainer>
                    <div className="flex items-center justify-between mb-6 border-b border-surface-border/60 pb-3">
                        <h2 className="text-lg font-semibold text-surface-dark">Open Vacancies</h2>
                        <button
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
                                    <div key={i} className="card-border h-24 bg-zinc-50/50 animate-pulse rounded-2xl" />
                                ))}
                            </div>
                        ) : tabData.vacancies.length === 0 ? (
                            <div className="card-border text-center text-surface-muted !py-8">No open vacancies at the moment.</div>
                        ) : (
                            <div className="space-y-3">
                                {tabData.vacancies.slice(0, 2).map(vacancy => (
                                    <div 
                                        key={vacancy.id} 
                                        onClick={() => handleTabChange('Vacancies')}
                                        className="card-border flex items-center justify-between !p-4 cursor-pointer transition-all hover:bg-zinc-50/50"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#75C043]/10 text-[#75C043]">
                                                <Briefcase size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-sm text-surface-dark">{vacancy.title}</h4>
                                                <p className="text-[10px] text-surface-muted mt-0.5 line-clamp-1">
                                                    {vacancy.description.slice(0, 60)}...
                                                </p>
                                            </div>
                                        </div>
                                        <div className="rounded-full bg-[#75C043]/10 px-3 py-1 text-[10px] font-bold text-[#75C043] uppercase">
                                            Apply
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </SoftContainer>
            </div>

            {/* RIGHT: Sidebar (30%) */}
            <aside className="space-y-6 sticky top-28">
                {/* Recent Announcements */}
                <SoftContainer>
                    <div className="flex items-center justify-between mb-4 border-b border-surface-border pb-2">
                        <h3 className="text-metadata tracking-[0.05em] uppercase font-bold text-zinc-500">Recent News</h3>
                        <button
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
                                    className="group p-3 rounded-xl hover:bg-secondary/40 border border-transparent hover:border-surface-border/70 hover:shadow-sm transition-all"
                                    onClick={() => handleTabChange('Announcements')}
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

                {/* Quick Actions */}
                <SoftContainer>
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-surface-muted mb-4">
                        Quick Actions
                    </h3>
                    <div className="flex flex-col space-y-2">
                        <Button
                            variant="outline"
                            onClick={() => handleTabChange('Members')}
                            className="w-full !justify-start !py-2.5 !px-4"
                        >
                            <Users size={16} className="mr-3 text-primary" />
                            View Members
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleTabChange('Resources')}
                            className="w-full !justify-start !py-2.5 !px-4"
                        >
                            <FolderKanban size={16} className="mr-3 text-primary" />
                            Access Resources
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleTabChange('Vacancies')}
                            className="w-full !justify-start !py-2.5 !px-4"
                        >
                            <Briefcase size={16} className="mr-3 text-[#75C043]" />
                            Explore Vacancies
                        </Button>
                    </div>
                </SoftContainer>
            </aside>
        </div>
    );
}