import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import Navbar from '../../components/Navbar';
import { User, Mail, Calendar, CheckCircle, XCircle, Plus, ChevronLeft, Search, Download, Save } from 'lucide-react';
import { formatTimeAgo } from '../../utils/timeFormatter';

export default function EventParticipantsPage() {
    const { id, eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [manualEmail, setManualEmail] = useState('');
    const [addingParticipant, setAddingParticipant] = useState(false);
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

    // Batch attendance tracking
    const [pendingChanges, setPendingChanges] = useState({}); // { registrationId: newStatus }
    const [savingAttendance, setSavingAttendance] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [eventData, participantsData] = await Promise.all([
                    eventService.getEvent(eventId),
                    eventService.getParticipants(eventId)
                ]);
                setEvent(eventData);
                setParticipants(participantsData.results || participantsData || []);
            } catch (err) {
                setError('Failed to load participants data.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [eventId]);

    // Handle local attendance change (no API call yet)
    const handleAttendanceChange = (registrationId, newStatus) => {
        // Find original value to avoid marking unchanged items
        const original = participants.find(p => p.id === registrationId);
        const originalAttendance = original?.attendance;

        setPendingChanges(prev => {
            const updated = { ...prev };
            if (newStatus === originalAttendance) {
                delete updated[registrationId]; // Revert = no pending change
            } else {
                updated[registrationId] = newStatus;
            }
            return updated;
        });
    };

    // Get the displayed attendance (pending override or original)
    const getDisplayedAttendance = (p) => {
        return pendingChanges[p.id] !== undefined ? pendingChanges[p.id] : p.attendance;
    };

    // Save all pending changes
    const handleSaveAttendance = async () => {
        const entries = Object.entries(pendingChanges);
        if (entries.length === 0) return;

        setSavingAttendance(true);
        try {
            await Promise.all(
                entries.map(([regId, status]) => eventService.updateAttendance(regId, status))
            );
            // Update local participants state with saved values
            setParticipants(prev => prev.map(p =>
                pendingChanges[p.id] !== undefined ? { ...p, attendance: pendingChanges[p.id] } : p
            ));
            setPendingChanges({});
            showStatus('success', `Attendance updated for ${entries.length} participant${entries.length > 1 ? 's' : ''}.`);
        } catch (err) {
            showStatus('error', 'Failed to save some attendance updates. Please try again.');
        } finally {
            setSavingAttendance(false);
        }
    };

    // Export to Excel (CSV)
    const handleExportExcel = () => {
        if (participants.length === 0) return;

        const headers = ['Name', 'Username', 'Email', 'Course', 'Semester', 'Registered At', 'Attendance'];
        const attendanceMap = { 'P': 'Present', 'A': 'Absent', 'NA': 'Not Marked' };

        const rows = participants.map(p => {
            const name = `${p.first_name || ''} ${p.last_name || ''}`.trim() || p.username;
            const attendance = getDisplayedAttendance(p);
            return [
                name,
                p.username,
                p.email || '',
                p.course || 'N/A',
                p.semester || 'N/A',
                p.registered_at ? new Date(p.registered_at).toLocaleString() : '',
                attendanceMap[attendance] || attendance
            ];
        });

        // Build CSV with BOM for Excel compatibility
        const csvContent = '\uFEFF' + [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${event?.title || 'event'}_participants.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleManualAdd = async (e) => {
        e.preventDefault();
        if (!manualEmail) return;

        try {
            setAddingParticipant(true);
            await eventService.manualAddParticipant(eventId, manualEmail);

            const updatedParticipants = await eventService.getParticipants(eventId);
            setParticipants(updatedParticipants.results || updatedParticipants || []);

            setManualEmail('');
            setAddModalOpen(false);
            showStatus('success', 'Participant added successfully.');
        } catch (err) {
            const msg = err.response?.data?.email?.[0] || err.response?.data?.non_field_errors?.[0] || 'Failed to add participant.';
            showStatus('error', msg);
        } finally {
            setAddingParticipant(false);
        }
    };

    const showStatus = (type, text) => {
        setStatusMessage({ type, text });
        setTimeout(() => setStatusMessage({ type: '', text: '' }), 4000);
    };

    const filteredParticipants = participants.filter(p => {
        const displayed = getDisplayedAttendance(p);
        const matchesFilter = filter === 'All' ||
            (filter === 'Present' && displayed === 'P') ||
            (filter === 'Absent' && displayed === 'A') ||
            (filter === 'Not Marked' && displayed === 'NA');

        const searchLower = searchQuery.toLowerCase();
        const fullName = `${p.first_name || ''} ${p.last_name || ''}`.trim();
        const matchesSearch = fullName.toLowerCase().includes(searchLower) ||
            (p.email || '').toLowerCase().includes(searchLower) ||
            (p.username || '').toLowerCase().includes(searchLower);

        return matchesFilter && matchesSearch;
    });

    const hasPendingChanges = Object.keys(pendingChanges).length > 0;

    if (loading) return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-[#75C043] border-t-transparent rounded-full"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 text-center">
            <XCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
            <Link to={`/events/${eventId}`} className="text-[#75C043] font-bold hover:underline">
                Back to Event
            </Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            {/* <Navbar navSolid /> */}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
                {/* Header */}
                <div className="mb-8">
                    <Link to={`/events/${eventId}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors mb-4">
                        <ChevronLeft size={16} className="mr-1" /> Back to Event
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-[#0d1f14]">Participants Management</h1>
                            <p className="text-gray-500 mt-1">{event?.title} • {participants.length} Total Registered</p>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={handleExportExcel}
                                disabled={participants.length === 0}
                                className="inline-flex items-center px-5 py-2.5 bg-white border border-gray-200 text-[#0d1f14] font-bold rounded-xl hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
                            >
                                <Download size={18} className="mr-2" /> Export CSV
                            </button>
                            <button
                                onClick={() => setAddModalOpen(true)}
                                className="inline-flex items-center px-5 py-2.5 bg-[#75C043] text-white font-bold rounded-xl hover:bg-[#68ae3b] transition-all shadow-lg shadow-green-100"
                            >
                                <Plus size={18} className="mr-2" /> Add Participant
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status Banner */}
                {statusMessage.text && (
                    <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 ${statusMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                        {statusMessage.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                        <p className="text-sm font-semibold">{statusMessage.text}</p>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">


                    <div className="flex items-center gap-3 overflow-x-auto pb-1 md:pb-0">
                        {['All', 'Present', 'Absent', 'Not Marked'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${filter === f
                                    ? 'bg-[#0d1f14] text-white shadow-md'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                    }`}
                            >
                                {f} {f === 'All' ? `(${participants.length})` :
                                    f === 'Present' ? `(${participants.filter(p => getDisplayedAttendance(p) === 'P').length})` :
                                        f === 'Absent' ? `(${participants.filter(p => getDisplayedAttendance(p) === 'A').length})` :
                                            `(${participants.filter(p => getDisplayedAttendance(p) === 'NA').length})`}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Participants Table */}
                <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#f8f9fa] border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider">Participant</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider">Email</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider">Registered At</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-400 tracking-wider">Attendance</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredParticipants.length > 0 ? (
                                    filteredParticipants.map((p) => {
                                        const displayed = getDisplayedAttendance(p);
                                        const isChanged = pendingChanges[p.id] !== undefined;
                                        return (
                                            <tr key={p.id} className={`hover:bg-[#fcfdfa] transition-colors group ${isChanged ? 'bg-amber-50/40' : ''}`}>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                                                            {p.profile_image ? (
                                                                <img src={p.profile_image} alt={`${p.first_name} ${p.last_name}`} className="h-full w-full object-cover" />
                                                            ) : (
                                                                <User size={20} className="text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-[#0d1f14]">{p.first_name && p.last_name ? `${p.first_name} ${p.last_name}` : p.username}</p>
                                                            <p className="text-xs text-gray-500">@{p.username}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Mail size={14} className="text-gray-400" />
                                                        {p.email}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {formatTimeAgo(p.registered_at)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <select
                                                        value={displayed}
                                                        onChange={(e) => handleAttendanceChange(p.id, e.target.value)}
                                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border outline-none shadow-sm cursor-pointer transition-all ${displayed === 'P' ? 'bg-green-100 text-green-700 border-green-200' :
                                                            displayed === 'A' ? 'bg-red-100 text-red-700 border-red-200' :
                                                                'bg-gray-100 text-gray-600 border-gray-200'
                                                            } ${isChanged ? 'ring-2 ring-amber-300' : ''}`}
                                                    >
                                                        <option value="NA">Not Marked</option>
                                                        <option value="P">Present</option>
                                                        <option value="A">Absent</option>
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center gap-2">
                                                <Search size={32} className="text-gray-200" />
                                                <p className="text-lg font-medium">No participants found</p>
                                                <p className="text-sm">Try adjusting your filters or search query.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Sticky Save Button */}
                    {hasPendingChanges && (
                        <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-amber-600 font-medium">
                                {Object.keys(pendingChanges).length} unsaved change{Object.keys(pendingChanges).length > 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setPendingChanges({})}
                                    className="px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSaveAttendance}
                                    disabled={savingAttendance}
                                    className="inline-flex items-center px-6 py-2.5 bg-[#75C043] text-white font-bold rounded-xl hover:bg-[#68ae3b] transition-all shadow-lg shadow-green-100 disabled:opacity-50"
                                >
                                    {savingAttendance ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={16} className="mr-2" />
                                            Save Attendance
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Manual Add Modal */}
            {addModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1f14]/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md overflow-hidden rounded-[32px] bg-white p-8 shadow-2xl animate-in zoom-in duration-200">
                        <div className="mb-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-2xl font-bold text-[#0d1f14]">Add Participant</h3>
                                    <p className="text-gray-500 mt-1 text-sm">Enter the student's email to add them.</p>
                                </div>
                                <button onClick={() => setAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <Plus className="rotate-45" size={24} />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleManualAdd} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Student Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="email"
                                        required
                                        placeholder="student@example.com"
                                        value={manualEmail}
                                        onChange={(e) => setManualEmail(e.target.value)}
                                        className="w-full bg-[#f8f9fa] border border-gray-100 rounded-2xl pl-12 pr-4 py-3.5 text-sm outline-none focus:border-[#75C043] focus:bg-white transition-all shadow-sm"
                                    />
                                </div>
                                <p className="text-[10px] text-gray-400 italic px-1">Note: The student must be a registered member of HCKonnect.</p>
                            </div>

                            <div className="flex flex-col gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={addingParticipant || !manualEmail}
                                    className="w-full py-4 bg-[#75C043] text-white font-bold rounded-2xl hover:bg-[#68ae3b] transition-all shadow-lg shadow-green-100 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {addingParticipant ? (
                                        <>
                                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Adding...
                                        </>
                                    ) : 'Add Participant'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setAddModalOpen(false)}
                                    className="w-full py-4 text-gray-500 font-bold rounded-2xl hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
