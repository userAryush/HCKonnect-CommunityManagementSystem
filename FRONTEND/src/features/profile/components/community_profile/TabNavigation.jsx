export default function TabNavigation({ tabs, activeTab, handleTabChange }) {
    return (
        <div className="mt-8 flex gap-8 border-b border-surface-border/70">
            {tabs.map((tab) => (
                <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`-mb-px border-b-2 py-3 text-sm font-medium transition-colors whitespace-nowrap ${activeTab === tab
                        ? 'border-primary text-primary'
                        : 'border-transparent text-surface-muted hover:text-surface-dark'
                        }`}
                >
                    {tab}
                </button>
            ))}
        </div>
    );
}