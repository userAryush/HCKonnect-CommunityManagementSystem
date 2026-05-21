import { Link } from 'react-router-dom';
import Button from '../../../shared/components/ui/Button';
import { ExternalLink } from 'lucide-react';
import { getInitials } from '../../../utils/userUtils';

export default function DashboardHeader({ communityId, community, term = 'Spring 2026' }) {
    const logo = community?.community_logo;
    const title = community?.community_name;

    return (
        <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-8">
                {logo ? (
                    <img
                        src={logo}
                        alt={title}
                        className="h-24 w-auto max-w-[180px] object-contain"
                    />
                ) : (
                    <div className="flex h-24 w-36 items-center justify-center rounded-2xl bg-primary/10">
                        <span className="font-display text-3xl font-bold text-primary">
                            {getInitials(title || 'Community')}
                        </span>
                    </div>
                )}
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-extrabold tracking-tight text-surface-dark">
                            {title} Dashboard
                        </h1>
                        <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full border border-primary/20">
                            Current Term: {term}
                        </span>
                    </div>
                    <p className="mt-2 text-lg text-surface-body">Manage your community workspace</p>
                </div>
            </div>
            <Link to={`/community/${communityId}`}>
                <Button variant="secondary" className="gap-2">
                    View Public Page <ExternalLink size={16} />
                </Button>
            </Link>
        </header>
    );
}
