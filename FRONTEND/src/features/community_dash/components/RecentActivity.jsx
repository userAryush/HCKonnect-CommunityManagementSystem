export default function RecentActivity({ activities }) {
    return (
        <div>
            <h3 className="text-title mb-4">Recent Activity</h3>
            <div className="card-border !p-6">
                <div className="space-y-6">
                    {activities.length > 0 ? (
                        activities.map((activity) => (
                            <div
                                key={activity.id}
                                className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-primary"
                            >
                                <p className="text-body font-medium flex items-center justify-between">
                                    <span className="line-clamp-1 pr-2">{activity.content}</span>
                                </p>
                                <p className="text-metadata mt-1">{activity.time}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-body">No recent activity.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
