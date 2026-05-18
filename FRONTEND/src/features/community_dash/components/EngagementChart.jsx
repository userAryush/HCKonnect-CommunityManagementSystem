import { Loader2, AlertCircle, Activity, BarChart3 } from 'lucide-react';
import Badge from '../../../shared/components/ui/Badge';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from 'recharts';

export default function EngagementChart({
    engagementData,
    analyticsLoading,
    analyticsError,
    hasEngagement,
    title = 'Engagement Comparison',
    badgeLabel = 'By Content',
    emptyTitle = 'No engagement data yet',
    emptyDescription = 'Start posting announcements or events to see your stats.',
    tooltipLabel,
    rotateLabels = false,
}) {
    return (
        <div className="card-border !p-0 overflow-hidden flex-1">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
                <div className="flex items-center gap-2">
                    <h3 className="text-title">{title}</h3>
                    <Badge variant="primary" className="!rounded-full">
                        {badgeLabel}
                    </Badge>
                </div>
                <BarChart3 size={18} className="text-surface-muted" />
            </div>

            <div className="px-6 py-5" style={{ height: 240 }}>
                {analyticsLoading ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3">
                        <Loader2 className="animate-spin text-primary" size={28} />
                        <p className="text-sm text-surface-muted">Analyzing engagement metrics...</p>
                    </div>
                ) : analyticsError ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center gap-2">
                        <AlertCircle className="text-red-400" size={28} />
                        <p className="text-sm font-medium text-surface-dark">{analyticsError}</p>
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="text-xs text-primary font-bold hover:underline"
                        >
                            Retry
                        </button>
                    </div>
                ) : !hasEngagement ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center opacity-40">
                        <Activity size={40} className="mb-3 text-surface-muted" />
                        <p className="font-semibold text-surface-dark">{emptyTitle}</p>
                        <p className="text-xs max-w-[220px] mt-1">{emptyDescription}</p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={engagementData}
                            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                interval={0}
                                angle={rotateLabels ? -35 : 0}
                                textAnchor={rotateLabels ? 'end' : 'middle'}
                                height={rotateLabels ? 56 : 30}
                                tick={{ fontSize: rotateLabels ? 10 : 11, fontWeight: 600, fill: '#888' }}
                            />
                            <YAxis hide />
                            <Tooltip
                                formatter={
                                    tooltipLabel
                                        ? (value) => [value, tooltipLabel]
                                        : undefined
                                }
                                contentStyle={{
                                    backgroundColor: '#fff',
                                    borderRadius: 12,
                                    border: '1px solid #eee',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                }}
                                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                            />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={40}>
                                {engagementData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        fillOpacity={0.85}
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}
