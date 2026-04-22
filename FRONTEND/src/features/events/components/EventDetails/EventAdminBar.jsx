import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

export default function EventAdminBar({ communityId, eventId, registeredCount, onDelete }) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between p-6 rounded-3xl bg-zinc-50 border border-zinc-100 mb-8 border-l-8 border-l-primary shadow-sm gap-4">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/20 rounded-2xl text-primary">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <span className="font-black text-base block">Organizer Command Center</span>
                    <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">{registeredCount} Participants Registered</span>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Link
                    to={`/community/${communityId}/manage/events/${eventId}/participants`}
                    className="px-6 py-2.5 rounded-xl bg-[#0d1f14] text-white text-xs font-black hover:bg-black transition-all shadow-lg shadow-zinc-200"
                >
                    Manage Participants
                </Link>
                <Link
                    to={`/community/${communityId}/manage/events/${eventId}/edit`}
                    className="px-6 py-2.5 rounded-xl bg-white border-2 border-zinc-200 text-xs font-black hover:bg-zinc-50 transition-all"
                >
                    Edit Event
                </Link>
                <button
                    onClick={onDelete}
                    className="px-6 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-black hover:bg-red-100 transition-all border-2 border-red-100"
                >
                    Delete
                </button>
            </div>
        </div>
    );
}