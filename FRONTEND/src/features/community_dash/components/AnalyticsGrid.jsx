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
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-10">
            <div className="lg:col-span-3 flex flex-col gap-6">
                <EngagementChart
                    engagementData={engagementData}
                    analyticsLoading={analyticsLoading}
                    analyticsError={analyticsError}
                    hasEngagement={hasEngagement}
                />
                <CommunityLeaderboard
                    leaderboardData={leaderboardData}
                    analyticsLoading={analyticsLoading}
                    maxLeaderScore={maxLeaderScore}
                />
            </div>
            <TopMembersList memberRows={memberRows} analyticsLoading={analyticsLoading} />
        </div>
    );
}
