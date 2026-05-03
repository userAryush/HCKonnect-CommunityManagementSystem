import { Calendar, Clock, MapPin } from 'lucide-react';

export default function EventHero({ title, image, format, deadlinePassed, eventMeta }) {
    return (
        <div className="relative w-full h-[450px] md:h-[550px] overflow-hidden">
            <img
                src={image || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"}
                alt="Event Banner"
                className="absolute inset-0 h-full w-full object-cover"
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-zinc-950" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />

            {/* Hero Content */}
            <div className="absolute inset-0 flex items-end">
                <div className="mx-auto w-full max-w-7xl px-4 pb-12">
                    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-6 duration-700">
                        <div className="mb-6 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary shadow-lg shadow-primary/25">
                                {format || 'In-Person'}
                            </span>
                            <span
                                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary ${deadlinePassed ? 'border-red-400 bg-red-600/90' : 'border-white/25 bg-white/10 backdrop-blur-md'
                                    }`}
                            >
                                {deadlinePassed ? 'Registration closed' : 'Upcoming'}
                            </span>
                        </div>

                        <h1 className="mb-8 text-3xl font-bold leading-tight tracking-tight text-white md:text-5xl">
                            {title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                            <div className="group flex items-center gap-3">
                                <div className="rounded-xl border border-white/15 bg-white/10 p-2 backdrop-blur-md transition-colors group-hover:border-primary/40 group-hover:bg-primary/15">
                                    <Calendar size={20} className="text-primary" strokeWidth={2} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-white/65">Date</span>
                                    <span className="text-sm font-medium text-white">{eventMeta.date}</span>
                                </div>
                            </div>
                            <div className="group flex items-center gap-3">
                                <div className="rounded-xl border border-white/15 bg-white/10 p-2 backdrop-blur-md transition-colors group-hover:border-primary/40 group-hover:bg-primary/15">
                                    <Clock size={20} className="text-primary" strokeWidth={2} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-white/65">Time</span>
                                    <span className="text-sm font-medium text-white">{eventMeta.time}</span>
                                </div>
                            </div>
                            <div className="group flex items-center gap-3">
                                <div className="rounded-xl border border-white/15 bg-white/10 p-2 backdrop-blur-md transition-colors group-hover:border-primary/40 group-hover:bg-primary/15">
                                    <MapPin size={20} className="text-primary" strokeWidth={2} />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-white/65">Location</span>
                                    <span className="text-sm font-medium text-white" title={eventMeta.location}>
                                        {eventMeta.location}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}