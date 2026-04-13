import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Mail, ChevronLeft, Download, User, Eye, X, AlertCircle } from 'lucide-react';
import vacancyService from '../../services/vacancyService';

export default function VacancyApplicantsPage() {
    const { id, vacancyId } = useParams();
    const [vacancy, setVacancy] = useState(null);
    const [applicants, setApplicants] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedApplicant, setSelectedApplicant] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [vData, aData] = await Promise.all([
                    vacancyService.getVacancy(vacancyId),
                    vacancyService.getApplicants(vacancyId)
                ]);
                setVacancy(vData);
                setApplicants(aData.results || aData || []);
            } catch (err) {
                setError('Failed to load applicant data.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [vacancyId]);

    const exportToCSV = () => {
        if (applicants.length === 0) return;
        const headers = ["Applicant Name,Email,Username,Applied Date,Cover Letter Length,Resume Provided"];
        const csvData = applicants.map(p => {
            const date = new Date(p.applied_at).toLocaleDateString().replace(/,/g, '');
            const msgLen = p.message ? p.message.length + ' chars' : 'None';
            const resumeStatus = p.resume ? 'Yes' : 'No';
            return `"${p.full_name}","${p.email}","${p.username}","${date}","${msgLen}","${resumeStatus}"`;
        });
        const csvString = [headers, ...csvData].join("\n");
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `applicants-${vacancy?.title || 'vacancy'}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

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
                <Link to={`/community/${id}/dashboard`} className="bg-[#0d1f14] text-white px-6 py-2 rounded-xl font-bold">
                    Back to Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fa]">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-12">

                {/* Header Section */}
                <div className="mb-10">
                    <Link to={`/community/${id}/dashboard`} className="inline-flex items-center text-sm font-semibold text-gray-400 hover:text-[#75C043] transition-colors mb-6 group">
                        <ChevronLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-[#0d1f14] tracking-tight">Applications</h1>
                            <p className="text-gray-500 mt-2 text-lg">
                                Managing candidates for <span className="text-[#75C043] font-bold">{vacancy?.title}</span>
                            </p>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={exportToCSV}
                                disabled={applicants.length === 0}
                                className="bg-white hover:bg-gray-50 text-[#0d1f14] px-5 py-2.5 rounded-xl border border-gray-200 flex items-center gap-2 shadow-sm font-bold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download size={16} />
                                Export CSV
                            </button>
                            <div className="bg-white px-5 py-2.5 rounded-xl border border-gray-200 flex items-center gap-3 shadow-sm">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Applicants</span>
                                <span className="text-lg font-black text-[#0d1f14]">{applicants.length}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#fcfdfa] border-b border-gray-100">
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Applicant Name</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Email</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest">Applied Date</th>
                                    <th className="px-8 py-5 text-xs font-bold text-gray-400 uppercase tracking-widest text-center">Coverletter / Resume</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {applicants.length > 0 ? (
                                    applicants.map((p) => (
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
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-20 text-center text-gray-400">
                                            No applicants found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            {/* Modal Logic */}
            {selectedApplicant && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1f14]/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-xl bg-white rounded-[32px] p-8 shadow-2xl">
                        <div className="flex justify-between mb-6">
                            <h3 className="text-2xl font-bold">Cover Letter</h3>
                            <button onClick={() => setSelectedApplicant(null)}><X /></button>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl text-sm leading-relaxed text-gray-600 whitespace-pre-wrap max-h-96 overflow-y-auto">
                            {selectedApplicant.message}
                        </div>
                        <button onClick={() => setSelectedApplicant(null)} className="w-full mt-6 py-3 bg-gray-100 rounded-xl font-bold">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}