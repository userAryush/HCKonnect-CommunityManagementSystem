export default function EventAbout({ description }) {
    return (
        <section aria-label="About the event">
            <div className="mb-4 flex items-center gap-3">
                <div className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                <h2 className="text-xl font-semibold tracking-tight text-surface-dark">About this event</h2>
            </div>
            <div className="max-w-none rounded-2xl border border-surface-border/60 bg-[var(--surface-card)] p-6 shadow-sm">
                <p className="whitespace-pre-wrap text-base leading-relaxed text-surface-body">{description}</p>
            </div>
        </section>
    );
}