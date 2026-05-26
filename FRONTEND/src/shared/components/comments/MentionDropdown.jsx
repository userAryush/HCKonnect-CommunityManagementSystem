import { AtSign } from 'lucide-react';

/**
 * Suggestion dropdown rendered directly below a comment textarea.
 * Controlled entirely by the parent via props from useMention.
 */
export default function MentionDropdown({ suggestions, activeIndex, onSelect }) {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div
            role="listbox"
            aria-label="Mention suggestions"
            className="absolute z-50 left-0 right-0 mt-1 rounded-xl border border-surface-border bg-[var(--surface-card)] shadow-lg dark:shadow-xl dark:shadow-black/40 overflow-hidden"
        >
            {suggestions.map((user, i) => (
                <button
                    key={user.id}
                    type="button"
                    role="option"
                    aria-selected={i === activeIndex}
                    onMouseDown={(e) => {
                        // Prevent textarea blur before selection
                        e.preventDefault();
                        onSelect(user);
                    }}
                    className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors
                        ${i === activeIndex
                            ? 'bg-primary/10 dark:bg-primary/20'
                            : 'hover:bg-[var(--surface-muted-bg)] dark:hover:bg-zinc-700/60'
                        }`}
                >
                    {user.avatar ? (
                        <img
                            src={user.avatar}
                            alt={user.username}
                            className="w-7 h-7 rounded-full object-cover flex-shrink-0 ring-1 ring-white/20"
                        />
                    ) : (
                        <div className="w-7 h-7 rounded-full flex-shrink-0 bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                            <AtSign size={13} className="text-emerald-600 dark:text-emerald-400" />
                        </div>
                    )}
                    <div className="min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--app-text)] truncate leading-tight">
                            {user.full_name}
                        </p>
                        <p className="text-[11px] text-[var(--surface-muted-text)] truncate leading-tight">
                            @{user.username}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
}
