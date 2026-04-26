import { Globe, Users } from 'lucide-react';

export default function EventSpeakers({ speakers }) {
    if (!speakers || speakers.length === 0) {
        return null;
    }

    return (
        <section aria-label="Speakers">
            <h2 className="text-2xl font-black mb-10 tracking-tight flex items-center gap-4 text-[var(--surface-heading)]">
                Guest Speakers
                <span className="text-sm font-bold px-3 py-1 bg-secondary border border-surface-border text-surface-muted rounded-full tracking-normal">{speakers.length}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {speakers.map((speaker, idx) => (
                    <div key={idx} className="group flex items-center gap-6 p-6 rounded-3xl bg-[var(--surface-card)] border border-surface-border hover:border-surface-border hover:shadow-md transition-all duration-300">
                        <div className="relative shrink-0">
                            <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-white transition-all duration-500 overflow-hidden shadow-inner">
                                <Users size={24} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-surface-heading mb-1 transition-colors">{speaker.name}</h3>
                            <p className="text-xs font-black text-primary uppercase tracking-widest mb-2 opacity-80">{speaker.profession}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}