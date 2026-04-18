import React from 'react';
import { Search } from 'lucide-react';

const ManagementTable = ({ columns, items, renderRow, emptyStateMessage }) => {
    return (
        <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[#fcfdfa] border-b border-gray-100">
                            {columns.map((col, index) => (
                                <th key={index} className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">
                                    {col}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {items.length > 0 ? (
                            items.map((item) => renderRow(item))
                        ) : (
                            <tr>
                                <td colSpan={columns.length} className="px-8 py-20 text-center">
                                    <div className="flex flex-col items-center gap-2 text-gray-500">
                                        <Search size={32} className="text-gray-300" />
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