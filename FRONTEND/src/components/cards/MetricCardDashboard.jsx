import React from 'react';

const MetricCard = ({ label, value, meta, icon, isLoading = false }) => {
    return (
        <div className="card-border relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-70 group-hover:opacity-100 transition-opacity">
                {icon}
            </div>
            {isLoading ? (
                <div className="space-y-2">
                    <div className="h-8 w-16 bg-zinc-200 animate-pulse rounded-lg"></div>
                    <div className="h-4 w-24 bg-zinc-100 animate-pulse rounded-md"></div>
                    <div className="h-3 w-32 bg-zinc-50 animate-pulse rounded-sm mt-4"></div>
                </div>
            ) : (
                <>
                    <p className="text-3xl font-bold text-surface-dark mb-1">{value}</p>
                    <p className="text-body font-medium">{label}</p>
                    <p className="mt-3 text-metadata font-semibold text-primary">
                        {meta}
                    </p>
                </>
            )}
        </div>
    );
};

export default MetricCard;