import Navbar from './Navbar';
import BackLink from './BackLink';
import { Skeleton } from './Skeleton';

/**
 * DetailPageLayout
 *
 * Shared shell for Post and Discussion detail pages.
 * Handles the loading skeleton, navbar, back link, and main wrapper.
 *
 * @prop {boolean}   loading   - Show skeleton while true
 * @prop {string}    backTo    - Route for the BackLink e.g. '/feed'
 * @prop {string}    backText  - Label for the BackLink e.g. 'Feed'
 * @prop {ReactNode} children  - Page content (card + comment section)
 */
export default function DetailPageLayout({ loading, backTo, backText, children }) {
    if (loading) {
        return (
            <div className="min-h-screen bg-secondary pt-20">
                <Navbar navSolid={true} />
                <div className="max-w-6xl mx-auto px-4">
                    <Skeleton className="h-60 w-full mb-6" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary flex flex-col pt-16">
            <Navbar navSolid={true} />
            <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
                <BackLink to={backTo} text={backText} />
                {children}
            </main>
        </div>
    );
}