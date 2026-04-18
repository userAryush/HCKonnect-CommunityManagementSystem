import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import eventService from '../../services/eventService';
import { User, Mail, Calendar, XCircle, Plus, Download, Save } from 'lucide-react';
import { formatTimeAgo } from '../../utils/timeFormatter';
import ManagementTable from '../../components/applicationmanagement/ManagementTable';
import PageHeader from '../../components/shared/PageHeader';
import Button from '../../components/shared/Button';
import { exportToCSV } from '../../utils/exportUtils';
import ManagementToolbar from '../../components/applicationmanagement/ManagementToolbar';
import { useToast } from '../../context/ToastContext';
import AddParticipantModal from '../../components/modals/AddParticipantModal';

export default function EventParticipantsPage() {
    const { id, eventId } = useParams();
    const { showToast } = useToast();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('All');
    const [addModalOpen, setAddModalOpen] = useState(false);
    const [manualEmail, setManualEmail] = useState('');
    const [addingParticipant, setAddingParticipant] = useState(false);

    // Batch attendance tracking
    const [pendingChanges, setPendingChanges] = useState({}); // { registrationId: newStatus }
    const [savingAttendance, setSavingAttendance] = useState(false);

    // Get the displayed attendance (pending override or original)
    const getDisplayedAttendance = (p) => {
        return pendingChanges[p.id] !== undefined ? pendingChanges[p.id] : p.attendance;
    };

    const filterOptions = [
        { label: 'All', count: participants.length },
        { label: 'Present', count: participants.filter(p => getDisplayedAttendance(p) === 'P').length },
        { label: 'Absent', count: participants.filter(p => getDisplayedAttendance(p) === 'A').length },
        { label: 'Not Marked', count: participants.filter(p => getDisplayedAttendance(p) === 'NA').length },
    ];

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
            showToast(`Attendance updated for ${entries.length} participant${entries.length > 1 ? 's' : ''}.`);
        } catch (err) {
            showToast('Failed to save some attendance updates. Please try again.', 'error');
        } finally {
            setSavingAttendance(false);
        }
    };

    // Export to Excel (CSV)
    const handleExportExcel = () => {
        const headers = ['Name', 'Username', 'Email', 'Course', 'Semester', 'Registered At', 'Attendance'];
        const attendanceMap = { 'P': 'Present', 'A': 'Absent', 'NA': 'Not Marked' };

        const rowMapper = (p) => {
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
        };

        exportToCSV(headers, filteredParticipants, rowMapper, `${event?.title || 'event'}_participants.csv`);
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
            showToast('Participant added successfully.');
        } catch (err) {
            const msg = err.response?.data?.email?.[0] || err.response?.data?.non_field_errors?.[0] || 'Failed to add participant.';
            showToast(msg, 'error');
        } finally {
            setAddingParticipant(false);
        }
    };

    const filteredParticipants = participants.filter(p => {
        const displayed = getDisplayedAttendance(p);
        const matchesFilter = filter === 'All' ||
            (filter === 'Present' && displayed === 'P') ||
            (filter === 'Absent' && displayed === 'A') ||
            (filter === 'Not Marked' && displayed === 'NA');

        return matchesFilter;
    });

    const hasPendingChanges = Object.keys(pendingChanges).length > 0;

    const tableColumns = ["Participant", "Email", "Registered At", "Attendance"];

    const renderParticipantRow = (p) => {
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
                            } ${isChanged ? 'ring-2 ring-amber-300' : ''}`}>
                        <option value="NA">Not Marked</option>
                        <option value="P">Present</option>
                        <option value="A">Absent</option>
                    </select>
                </td>
            </tr>
        );
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-[#75C043] border-t-transparent rounded-full"></div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 text-center">
            <XCircle size={48} className="text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{error}</h2>
            <BackLink to={`/events/${eventId}`} text="Back to Event" className="mb-4" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">
                {/* Header */}
                <PageHeader
                    title="Participants Management"
                    subtitle={`${event?.title} • ${participants.length} Total Registered`}
                    backLinkTo={`/events/${eventId}`}
                    backLinkText="Event"
                >
                    <div className="flex items-center gap-3 flex-wrap">
                        <Button
                            onClick={handleExportExcel}
                            disabled={participants.length === 0}
                            variant="outline"
                            className="border-gray-200 bg-white text-[#0d1f14] shadow-sm"
                        >
                            <Download size={16} /> Export CSV
                        </Button>
                        <Button onClick={() => setAddModalOpen(true)}>
                            <Plus size={16} /> Add Participant
                        </Button>
                    </div>
                </PageHeader>


                <ManagementToolbar
                    filterOptions={filterOptions}
                    onFilterChange={setFilter}
                    initialFilter={filter}
                />

                {/* Participants Table */}
                <div className="bg-white rounded-[28px] border border-gray-100 shadow-sm overflow-hidden">
                    <ManagementTable
                        columns={tableColumns}
                        items={filteredParticipants}
                        renderRow={renderParticipantRow}
                        emptyStateMessage="No participants found. Try adjusting your filters or search query."
                    />

                    {/* Sticky Save Button */}
                    {hasPendingChanges && (
                        <div className="sticky bottom-0 p-4 bg-white border-t border-gray-100 flex items-center justify-between">
                            <p className="text-sm text-amber-600 font-medium">
                                {Object.keys(pendingChanges).length} unsaved change{Object.keys(pendingChanges).length > 1 ? 's' : ''}
                            </p>
                            <div className="flex items-center gap-3">
                                <Button
                                    onClick={() => setPendingChanges({})}
                                    variant="ghost"
                                >
                                    Discard
                                </Button>
                                <Button
                                    onClick={handleSaveAttendance}
                                    isLoading={savingAttendance}
                                    loadingText="Saving..."
                                >
                                    <Save size={16} />
                                    Save Attendance
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <AddParticipantModal
                isOpen={addModalOpen}
                onClose={() => setAddModalOpen(false)}
                onSubmit={handleManualAdd}
                isLoading={addingParticipant}
            />
        </div>
    );
}
