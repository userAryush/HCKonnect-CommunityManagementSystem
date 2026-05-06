import Navbar from './Navbar';
import BackLink from './BackLink';
import { DetailPageLayoutSkeleton } from './Skeleton';

/**
 * DetailPageLayout
 *
 * Shared shell for Post and Discussion detail pages.
 * Handles the loading skeleton, navbar, back link, and main wrapper.
 *
 * @prop {boolean}   loading   - Show skeleton while true
 * @prop {string}    backTo    - Fallback route if there is no history to go back to e.g. '/feed'
 * @prop {ReactNode} children  - Page content (card + comment section)
 */
export default function DetailPageLayout({
    loading,
    backTo,
    children,
    hideBackLink = false,
    showNavbar = true,
    mainClassName = '',
}) {
    if (loading) {
        return (
            <div className={`min-h-screen bg-secondary ${showNavbar ? 'pt-20' : ''}`}>
                {showNavbar && <Navbar navSolid={true} />}
                <DetailPageLayoutSkeleton />
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-secondary flex flex-col ${showNavbar ? 'pt-16' : ''}`}>
            {showNavbar && <Navbar navSolid={true} />}
            <main className={`flex-1 w-full max-w-6xl mx-auto px-4 py-8 ${mainClassName}`.trim()}>
                {!hideBackLink && <BackLink to={backTo} />}
                {children}
            </main>
        </div>
    );
}