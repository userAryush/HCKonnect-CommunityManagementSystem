export default function EventAbout({ description }) {
    return (
        <section aria-label="About the event">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1.5 rounded-full bg-primary" />
                <h2 className="text-3xl font-black tracking-tight text-[var(--surface-heading)]">About this event</h2>
            </div>
            <div className="prose prose-zinc max-w-none prose-headings:text-[var(--surface-heading)] prose-p:leading-relaxed prose-p:text-lg prose-p:text-[color:var(--app-text)] prose-strong:text-[var(--surface-heading)]">
                <p className="whitespace-pre-wrap text-[var(--app-text)]">{description}</p>
            </div>
        </section>
    );
}