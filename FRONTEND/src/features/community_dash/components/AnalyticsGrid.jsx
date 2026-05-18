import EngagementChart from './EngagementChart';
import CommunityLeaderboard from './CommunityLeaderboard';
import TopMembersList from './TopMembersList';

export default function AnalyticsGrid({
    engagementData,
    analyticsLoading,
    analyticsError,
    hasEngagement,
    leaderboardData,
    maxLeaderScore,
    memberRows,
    hideTopMembers = false,
    leaderboardTitle,
    engagementChartTitle,
    engagementChartBadge,
    engagementChartEmpty,
    engagementTooltipLabel,
    engagementRotateLabels,
}) {
    return (
        <div className={`grid grid-cols-1 gap-6 mb-10 ${hideTopMembers ? '' : 'lg:grid-cols-5'}`}>
            <div className={`flex flex-col gap-6 ${hideTopMembers ? '' : 'lg:col-span-3'}`}>
                <EngagementChart
                    engagementData={engagementData}
                    analyticsLoading={analyticsLoading}
                    analyticsError={analyticsError}
                    hasEngagement={hasEngagement}
                    title={engagementChartTitle}
                    badgeLabel={engagementChartBadge}
                    emptyTitle={engagementChartEmpty?.title}
                    emptyDescription={engagementChartEmpty?.description}
                    tooltipLabel={engagementTooltipLabel}
                    rotateLabels={engagementRotateLabels}
                />
                <CommunityLeaderboard
                    leaderboardData={leaderboardData}
                    analyticsLoading={analyticsLoading}
                    maxLeaderScore={maxLeaderScore}
                    title={leaderboardTitle}
                />
            </div>
            {!hideTopMembers && (
                <TopMembersList memberRows={memberRows} analyticsLoading={analyticsLoading} />
            )}
        </div>
    );
}
