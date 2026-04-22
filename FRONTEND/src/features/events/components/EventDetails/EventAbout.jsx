export default function EventAbout({ description }) {
    return (
        <section aria-label="About the event">
            <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1.5 rounded-full bg-primary" />
                <h2 className="text-3xl font-black tracking-tight">About this event</h2>
            </div>
            <div className="prose prose-zinc max-w-none prose-p:leading-relaxed prose-p:text-zinc-600 prose-p:text-lg">
                <p className="whitespace-pre-wrap">{description}</p>
            </div>
        </section>
    );
}