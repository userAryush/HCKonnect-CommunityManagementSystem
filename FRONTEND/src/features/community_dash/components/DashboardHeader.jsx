import { Link } from 'react-router-dom';
import Button from '../../../shared/components/ui/Button';
import { ExternalLink } from 'lucide-react';

export default function DashboardHeader({ communityId, community, term = 'Spring 2026' }) {
    const logo = community?.community_logo;
    const title = community?.community_name;

    return (
        <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                {logo ? (
                    <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white border border-surface-border shadow-sm">
                        <img
                            src={logo}
                            alt={title}
                            className="h-28 w-28 rounded-full object-contain"
                        />
                    </div>
                ) : (
                    <div className="flex h-36 w-36 items-center justify-center rounded-full bg-zinc-100 text-4xl font-bold text-zinc-400">
                        {(title || 'CO').slice(0, 2).toUpperCase()}
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
