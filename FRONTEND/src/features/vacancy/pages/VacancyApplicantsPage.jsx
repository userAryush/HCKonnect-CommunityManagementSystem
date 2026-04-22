import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Download, User, Eye, AlertCircle } from 'lucide-react';
import vacancyService from '../service/vacancyService';
import Button from '../../../shared/components/ui/Button';
import { useToast } from '../../../shared/components/ui/ToastContext';
import apiClient from '../../../shared/services/apiClient';
import PageHeader from '../../../shared/components/layout/PageHeader';
import ManagementTable from '../../../shared/components/layout/ManagementTable';
import { exportToCSV } from '../../../utils/exportUtils';
import ApplicantMessageModal from '../components/ApplicantMessageModal';

export default function VacancyApplicantsPage() {
    const { id, vacancyId } = useParams();
    const { showToast } = useToast();
    const [vacancy, setVacancy] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApplicant, setSelectedApplicant] = useState(null);
    const [communityName, setCommunityName] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [vData, aData, cData] = await Promise.all([
                    vacancyService.getVacancy(vacancyId),
                    vacancyService.getApplicants(vacancyId),
                    apiClient.get(`/communities/dashboard/${id}/`)
                ]);
                setVacancy(vData);
                setApplicants(aData.results || aData || []);
                setCommunityName(cData.data.community_name);
            } catch (err) {
                setError('Failed to load applicant data.');
                showToast('Failed to load applicant data.', 'error');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [vacancyId, showToast]);

    const exportApplicantsToCSV = () => {
        const headers = ["Applicant Name", "Email", "Username", "Applied Date", "Cover Letter Length", "Resume Provided"];

        const rowMapper = (p) => {
            const date = new Date(p.applied_at).toLocaleDateString();
            const msgLen = p.message ? `${p.message.length} chars` : 'None';
            const resumeStatus = p.resume ? 'Yes' : 'No';
            return [p.full_name, p.email, p.username, date, msgLen, resumeStatus];
        };

        exportToCSV(headers, applicants, rowMapper, `applicants-${vacancy?.title || 'vacancy'}.csv`);
    };

    const tableColumns = ["Applicant Name", "Email", "Applied Date", "Actions"];

    const renderApplicantRow = (p) => (
        <tr key={p.id} className="hover:bg-[#75C043]/5 transition-colors group">
            <td className="px-8 py-5">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center">
                        <User size={20} />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#0d1f14]">{p.full_name}</p>
                        <p className="text-xs text-gray-400">@{p.username}</p>
                    </div>
                </div>
            </td>
            <td className="px-8 py-5">
                <div className="text-sm text-gray-600 flex items-center gap-2">
                    <Mail size={14} className="text-gray-300" />
                    {p.email}
                </div>
            </td>
            <td className="px-8 py-5">
                <div className="text-sm text-gray-600 font-medium">
                    {new Date(p.applied_at).toLocaleDateString()}
                </div>
            </td>
            <td className="px-8 py-5">
                <div className="flex items-center justify-center gap-2">
                    {p.message && (
                        <button onClick={() => setSelectedApplicant(p)}
                            className="p-2 border border-gray-200 rounded-lg hover:border-[#75C043] hover:text-[#75C043] transition-all" title="View Cover letter">
                            <Eye size={16} />
                        </button>
                    )}
                    {p.resume ? (
                        <a href={p.resume} target="_blank" rel="noopener noreferrer"
                            className="p-2 bg-[#0d1f14] text-white rounded-lg hover:bg-black transition-colors" title="Download Resume">
                            <Download size={16} />
                        </a>
                    ) : (
                        <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded">No Resume</span>
                    )}
                </div>
            </td>
        </tr>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
                <div className="animate-spin h-10 w-10 border-4 border-[#75C043] border-t-transparent rounded-full" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 text-center">
                <AlertCircle size={48} className="text-red-500 mb-4" />
                <h2 className="text-xl font-bold mb-4">{error}</h2>
                <BackLink to={`/community/${id}/dashboard`} text="Back to Dashboard" className="mb-4" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">

                <PageHeader
                    title="Applications"
                    subtitle={`Reviewing candidates for the ${vacancy?.title} role at ${communityName}.`}
                    backLinkTo={`/community/${id}/dashboard`}
                    backLinkText="Dashboard"
                >
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={exportApplicantsToCSV}
                            disabled={applicants.length === 0}
                            variant="outline"
                            className="border-gray-200 bg-white text-[#0d1f14] shadow-sm !py-2.5"
                        >
                            <Download size={16} />
                            Export CSV
                        </Button>
                        <div className="bg-white px-5 py-2.5 rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm">
                            <span className="text-[14px] font-bold text-gray-400  tracking-widest">Applicants</span>
                            <span className="text-lg font-black text-[#0d1f14]">{applicants.length}</span>
                        </div>
                        <div className={`rounded-xl border px-4 py-2 text-xs font-bold uppercase tracking-wider ${vacancy?.is_open ? 'border-[#75C043]/20 bg-[#75C043]/10 text-[#75C043]' : 'border-red-200 bg-red-50 text-red-500'}`}>
                            {vacancy?.is_open ? 'Open' : 'Closed'}
                        </div>
                    </div>
                </PageHeader>


                <ManagementTable
                    columns={tableColumns}
                    items={applicants}
                    renderRow={renderApplicantRow}
                    emptyStateMessage="No applicants have applied for this vacancy yet."
                />
            </main>

            <ApplicantMessageModal
                isOpen={!!selectedApplicant}
                onClose={() => setSelectedApplicant(null)}
                applicant={selectedApplicant}
            />
        </div>
    );
}
