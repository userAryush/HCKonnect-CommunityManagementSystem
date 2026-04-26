export default function PaginationInfo({
    totalItems,
    itemsPerPage,
    currentPage,
    onItemsPerPageChange,
    itemsPerPageOptions = [5, 10, 15, 20, 25],
    className = ''
}) {
    if (totalItems === 0) return null

    const startItem = (currentPage - 1) * itemsPerPage + 1
    const endItem = Math.min(currentPage * itemsPerPage, totalItems)

    return (
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 ${className}`}>
            {/* Items per page */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-surface-muted">Show</span>
                <select
                    value={itemsPerPage}
                    onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                    className="px-3 py-1 text-sm border border-surface-border rounded-lg bg-[var(--surface-card)] text-[var(--app-text)] focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                    {itemsPerPageOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
                <span className="text-sm text-surface-muted">per page</span>
            </div>

            {/* Result count */}
            <div className="text-sm text-surface-muted">
                Showing {startItem} to {endItem} of {totalItems} results
            </div>
        </div>
    )
}