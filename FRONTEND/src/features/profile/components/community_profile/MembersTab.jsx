import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Skeleton } from '../../../../shared/components/layout/Skeleton';

export default function MembersTab({ members, loading }) {
    return (
        <section className="rounded-xl bg-secondary overflow-hidden">
            <div className="flex items-center justify-between gap-4 border-b border-surface-border/40 px-5 py-4">
                <h2 className="text-lg font-semibold text-surface-dark flex items-center gap-2">
                    <Users size={20} className="text-primary" />
                    Community Members
                </h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                    {loading ? '...' : members.length} Total
                </span>
            </div>

            {loading ? (
                <ul className="divide-y divide-surface-border/30">
                    {[1, 2, 3, 4, 5].map(i => (
                        <li key={i} className="flex items-center gap-4 px-5 py-4">
                            <Skeleton variant="avatar" />
                            <div className="flex-1 space-y-2">
                                <Skeleton variant="text" className="w-1/3 h-4" />
                                <Skeleton variant="text" className="w-1/4 h-3" />
                            </div>
                            <Skeleton variant="rect" className="w-16 h-6 rounded-full" />
                        </li>
                    ))}
                </ul>
            ) : (
                <ul className="divide-y divide-surface-border/30">
                    {members.map((member) => (
                        <li key={member.membership_id} className="transition-colors hover:bg-surface-muted-bg/40">
                            <Link to={`/profile/${member.user_id}`} className="flex items-center gap-4 px-5 py-4">
                                {member.profile_image ? (
                                    <img
                                        src={member.profile_image}
                                        alt={member.first_name}
                                        className="h-12 w-12 rounded-full border border-surface-border/70 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-dark text-sm font-bold text-white">
                                        {member.first_name ? member.first_name[0].toUpperCase() : member.username[0].toUpperCase()}
                                        {member.last_name ? member.last_name[0].toUpperCase() : ''}
                                    </div>
                                )}
                                <div className="min-w-0 flex-1">
                                    <h4 className="text-sm font-semibold text-surface-dark">
                                        {member.first_name ? `${member.first_name} ${member.last_name}` : member.username}
                                    </h4>
                                    <p className="text-xs text-surface-muted">@{member.username}</p>
                                </div>
                                <span
                                    className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                                        member.role === 'representative'
                                            ? 'border-primary/20 bg-primary/10 text-primary'
                                            : 'border-surface-border/70 bg-surface-muted-bg/60 text-surface-muted'
                                    }`}
                                >
                                    {member.role}
                                </span>
                            </Link>
                        </li>
                    ))}
                    {members.length === 0 && (
                        <li className="py-12 text-center text-surface-muted">No members found.</li>
                    )}
                </ul>
            )}
        </section>
    );
}
