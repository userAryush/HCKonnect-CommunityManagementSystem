import { Activity, BarChart3 } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';

export default function CommunityLeaderboard({
    leaderboardData,
    analyticsLoading,
    maxLeaderScore,
    title = 'Communities Engagement Leaderboard',
}) {
    return (
        <div className="card-border !p-0 overflow-hidden flex-1">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
                <div className="flex items-center gap-2">
                    <h3 className="text-title">{title}</h3>
                    <Badge variant="primary" className="!rounded-full">
                        Global Rankings
                    </Badge>
                </div>
                <BarChart3 size={18} className="text-surface-muted" />
            </div>

            <div className="px-6 py-5 space-y-3">
                {analyticsLoading ? (
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-3 w-24 bg-zinc-100 rounded animate-pulse" />
                                <div className="flex-1 h-3 bg-zinc-100 rounded animate-pulse" />
                            </div>
                        ))}
                    </div>
                ) : leaderboardData.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-6 opacity-40">
                        <Activity size={28} className="mb-2 text-surface-muted" />
                        <p className="text-sm font-semibold text-surface-dark">Ranking unavailable</p>
                    </div>
                ) : (
                    leaderboardData.map((entry, idx) => {
                        const pct = Math.round((entry.score / maxLeaderScore) * 100);
                        return (
                            <div key={entry.name} className="flex items-center gap-3">
                                <span
                                    className={`w-5 text-right text-xs font-bold shrink-0 ${idx < 2 ? 'text-primary' : 'text-surface-muted'}`}
                                >
                                    {idx + 1}
                                </span>
                                <span
                                    className={`w-32 shrink-0 text-sm font-semibold truncate ${entry.isCurrent ? 'text-surface-dark' : 'text-surface-body'}`}
                                >
                                    {entry.name}
                                </span>
                                <div className="flex-1 h-2.5 bg-surface-border/40 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${pct}%`,
                                            backgroundColor: entry.isCurrent ? '#32CD32' : '#cbd5e1',
                                        }}
                                    />
                                </div>
                                <span className="w-10 text-right text-xs font-bold text-surface-muted shrink-0">
                                    {entry.score}
                                </span>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
