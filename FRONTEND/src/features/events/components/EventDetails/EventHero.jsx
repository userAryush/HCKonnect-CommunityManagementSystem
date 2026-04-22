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
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                            <span className="px-3 py-1 rounded-full bg-primary text-white text-[11px] font-black uppercase tracking-wider shadow-lg shadow-primary/20">
                                {format || 'In-Person'}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-white text-[11px] font-black uppercase tracking-wider border ${deadlinePassed ? 'bg-red-500 border-red-400' : 'bg-white/10 backdrop-blur-md border-white/20'
                                }`}>
                                {deadlinePassed ? 'Registration Closed' : 'Upcoming'}
                            </span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white mb-8 leading-[1.1] tracking-tight">
                            {title}
                        </h1>

                        <div className="flex flex-wrap items-center gap-y-4 gap-x-8 text-white/90">
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-primary/20 transition-colors">
                                    <Calendar size={20} className="text-primary-light" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-wide">Date</span>
                                    <span className="font-bold">{eventMeta.date}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-primary/20 transition-colors">
                                    <Clock size={20} className="text-primary-light" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-wide">Time</span>
                                    <span className="font-bold">{eventMeta.time}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 group">
                                <div className="p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 group-hover:bg-primary/20 transition-colors">
                                    <MapPin size={20} className="text-primary-light" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold text-white/50 uppercase tracking-wide">Location</span>
                                    <span className="font-bold" title={eventMeta.location}>{eventMeta.location}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}