import { Users } from 'lucide-react';

export default function EventSpeakers({ speakers }) {
    if (!speakers || speakers.length === 0) {
        return null;
    }

    return (
        <section aria-label="Speakers">
            <div className="mb-6 flex flex-wrap items-center gap-3">
                <div className="h-5 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                <h2 className="text-xl font-semibold tracking-tight text-surface-dark">Guest speakers</h2>
                <span className="rounded-full border border-surface-border bg-secondary px-2.5 py-0.5 text-metadata font-medium">
                    {speakers.length}
                </span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
                {speakers.map((speaker, idx) => (
                    <div
                        key={idx}
                        className="card-border flex items-center gap-4 !p-5 transition-shadow hover:shadow-md"
                    >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/15 text-primary">
                            <Users size={22} strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-title !text-base text-surface-dark">{speaker.name}</h3>
                            <p className="mt-1 text-metadata font-medium uppercase tracking-wide text-primary">
                                {speaker.profession}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}