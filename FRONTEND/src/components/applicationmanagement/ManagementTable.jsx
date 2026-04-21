import React from 'react';
import { Search } from 'lucide-react';

const ManagementTable = ({ columns, items, renderRow, emptyStateMessage }) => {
    return (
        <div className="bg-white rounded-standard border border-surface-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-secondary/30 border-b border-surface-border">
                            {columns.map((col, index) => (
                                <th key={index} className="px-8 py-5 text-xs font-bold text-surface-muted uppercase tracking-widest text-center">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                        {items.length > 0 ? (
                            items.map((item, index) => renderRow(item, index))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-2 text-surface-muted">
                                        <Search size={32} className="text-surface-muted" />
                                        <p className="text-lg font-medium">No one found</p>
                                        <p className="text-sm">{emptyStateMessage || "There's nothing to show here."}</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManagementTable;