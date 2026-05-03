import { Users } from 'lucide-react';

const RANK_STYLE = {
    0: { bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-400' },
    1: { bg: 'bg-zinc-100', text: 'text-zinc-500', dot: 'bg-zinc-400' },
    2: { bg: 'bg-orange-100', text: 'text-orange-700', dot: 'bg-orange-500' },
};

export default function TopMembersList({ memberRows, analyticsLoading }) {
    return (
        <div className="lg:col-span-2 card-border !p-0 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-surface-border">
                <h3 className="text-title">Top Active Members</h3>
                <Users size={18} className="text-surface-muted" />
            </div>

            <div className="divide-y divide-surface-border">
                {analyticsLoading ? (
                    <div className="p-6 space-y-4">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="h-9 w-9 rounded-full bg-zinc-200 animate-pulse shrink-0" />
                                <div className="space-y-1.5 flex-1">
                                    <div className="h-3.5 w-24 bg-zinc-200 rounded animate-pulse" />
                                    <div className="h-3 w-16 bg-zinc-100 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    memberRows.map((member, idx) => {
                        const rankStyle = RANK_STYLE[idx] || null;
                        return (
                            <div
                                key={idx}
                                className={`flex items-center justify-between px-4 py-3 transition-colors ${member ? 'hover:bg-zinc-50' : 'opacity-30'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        className={`w-5 text-right text-xs font-bold shrink-0 ${idx < 3 ? 'text-amber-500' : 'text-surface-muted'}`}
                                    >
                                        {idx + 1}
                                    </span>

                                    <div className="relative shrink-0">
                                        <div
                                            className={`h-9 w-9 rounded-full border border-surface-border flex items-center justify-center overflow-hidden ${member ? 'bg-zinc-100' : 'bg-zinc-50'}`}
                                        >
                                            {member?.profile_image ? (
                                                <img
                                                    src={member.profile_image}
                                                    alt={member.username}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : member ? (
                                                <span className="text-xs font-bold text-zinc-500">
                                                    {member.username.slice(0, 2).toUpperCase()}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-zinc-300">—</span>
                                            )}
                                        </div>
                                        {idx < 3 && member && (
                                            <div
                                                className={`absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white ${rankStyle.dot}`}
                                            />
                                        )}
                                    </div>

                                    <div>
                                        <p className="text-sm font-bold text-surface-dark leading-tight">
                                            {member ? member.username : 'Empty slot'}
                                        </p>
                                        <p className="text-xs text-surface-muted capitalize">
                                            {member ? member.role : 'Invite a member'}
                                        </p>
                                    </div>
                                </div>

                                {member && (
                                    <div className="text-right">
                                        <p className="text-sm font-black text-primary">{member.activity_score}</p>
                                        <p className="text-[10px] font-bold text-surface-muted uppercase tracking-wider">
                                            Posts
                                        </p>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
