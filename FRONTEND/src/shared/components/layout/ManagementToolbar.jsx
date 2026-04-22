import React, { useState } from 'react';

const ManagementToolbar = ({ filterOptions, onFilterChange, initialFilter = 'All' }) => {
    const [activeFilter, setActiveFilter] = useState(initialFilter);

    const handleFilterClick = (filter) => {
        setActiveFilter(filter.label);
        onFilterChange(filter.label);
    };

    return (
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            {/* Filter Buttons */}
            <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
                {filterOptions.map((filter) => (
                    <button
                        key={filter.label}
                        onClick={() => handleFilterClick(filter)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeFilter === filter.label
                            ? 'bg-primary/70 text-white shadow-md'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                            }`}
                    >
                        {filter.label} {filter.count !== undefined && `(${filter.count})`}
                    </button>
                ))}
            </div>

        </div>
    );
};

export default ManagementToolbar;