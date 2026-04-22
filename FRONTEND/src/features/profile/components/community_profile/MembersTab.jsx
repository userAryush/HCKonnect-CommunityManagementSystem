import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';
import { Skeleton } from '../../../../shared/components/layout/Skeleton';

// Reusable Soft Container Component
const SoftContainer = ({ children, className = '' }) => (
    <div className={`bg-white border border-gray-200 rounded-xl p-5 ${className}`}>
        {children}
    </div>
);

export default function MembersTab({ members, loading }) {
    return (
        <SoftContainer className="!p-0 overflow-hidden">
            <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-surface-dark flex items-center gap-2">
                    <Users size={20} className="text-primary" />
                    Community Members
                </h2>
                <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">{loading ? '...' : members.length} Total</span>
            </div>

            {loading ? (
                <ul className="divide-y divide-gray-100 flex flex-col">
                    {[1, 2, 3, 4, 5].map(i => (
                        <li key={i} className="flex items-center gap-4 px-6 py-4">
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
                <ul className="divide-y divide-gray-100 flex flex-col">
                    {members.map((member) => (
                        <li key={member.membership_id} className="hover:bg-gray-50 transition-colors">
                            <Link to={`/profile/${member.user_id}`} className="flex items-center gap-4 px-6 py-4">
                                {member.profile_image ? (
                                    <img src={member.profile_image} alt={member.first_name} className="w-12 h-12 rounded-full border border-gray-200 object-cover" />
                                ) : (
                                    <div className="w-12 h-12 rounded-full bg-surface-dark text-white flex items-center justify-center font-bold text-sm">
                                        {member.first_name ? member.first_name[0].toUpperCase() : member.username[0].toUpperCase()}
                                        {member.last_name ? member.last_name[0].toUpperCase() : ''}
                                    </div>
                                )}
                                <div className="flex-1">
                                    <h4 className="text-sm font-semibold text-surface-dark">
                                        {member.first_name ? `${member.first_name} ${member.last_name}` : member.username}
                                    </h4>
                                    <p className="text-xs text-surface-muted">@{member.username}</p>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${member.role === 'representative' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-gray-100 text-surface-muted border-gray-200'}`}>
                                        {member.role}
                                    </span>
                                </div>
                            </Link>
                        </li>
                    ))}
                    {members.length === 0 && (
                        <div className="py-12 text-center text-surface-muted">No members found.</div>
                    )}
                </ul>
            )}
        </SoftContainer>
    );
}