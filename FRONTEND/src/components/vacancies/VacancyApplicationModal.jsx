import React, { useState } from 'react';
import { X, Upload, Send, FileText } from 'lucide-react';
import vacancyService from '../../services/vacancyService';

export default function VacancyApplicationModal({ vacancy, onClose, onSuccess }) {
  const [resume, setResume] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit.');
        return;
      }
      setResume(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please write a short cover letter.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('vacancy', vacancy.id);
      if (resume) {
        formData.append('resume', resume);
      }
      formData.append('message', message);

      await vacancyService.applyToVacancy(formData);
      onSuccess('Application submitted successfully!');
      onClose();
    } catch (err) {
      console.error(err);
      let errorMsg = 'Failed to submit application. You may have already applied.';
      if (err.response?.data) {
        const data = err.response.data;
        if (data.detail) errorMsg = data.detail;
        else if (data.error) errorMsg = data.error;
        else if (data.non_field_errors && data.non_field_errors.length > 0) errorMsg = data.non_field_errors[0];
        else {
          const firstVal = Object.values(data)[0];
          if (Array.isArray(firstVal) && firstVal.length > 0) errorMsg = firstVal[0];
          else if (typeof firstVal === 'string') errorMsg = firstVal;
        }
      }
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-300 rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 p-6">
          <div>
            <h2 className="text-xl font-bold text-[#0d1f14]">Apply for Position</h2>
            <p className="text-sm font-medium text-gray-500">{vacancy.title}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="rounded-xl bg-red-100 p-4 text-sm font-medium text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0d1f14]">Cover Letter</label>
            <textarea
              rows="5"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us why you are a good fit for this role..."
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 p-4 text-sm outline-none transition-all focus:border-[#75C043] focus:bg-white focus:ring-4 focus:ring-[#75C043]/10"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-[#0d1f14]">Resume (Optional - PDF, Max 5MB)</label>
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                id="resume-upload"
              />
              <label
                htmlFor="resume-upload"
                className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${resume ? 'border-[#75C043] bg-[#75C043]/5' : 'border-gray-200 hover:border-[#75C043] hover:bg-gray-50'
                  }`}
              >
                {resume ? (
                  <div className="flex items-center gap-3 text-[#75C043]">
                    <FileText size={32} />
                    <div className="text-left">
                      <p className="text-sm font-bold">{resume.name}</p>
                      <p className="text-xs">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload size={32} className="mb-2 text-gray-400" />
                    <p className="text-sm font-bold text-[#0d1f14]">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PDF, DOC up to 5MB</p>
                  </>
                )}
              </label>
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-600 transition hover:bg-gray-50 active:scale-95"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] flex h-[48px] items-center justify-center gap-2 rounded-xl bg-[#75C043] text-sm font-bold text-white shadow-lg shadow-[#75C043]/20 transition-all hover:bg-[#68ae3b] hover:shadow-xl active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Send size={18} />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
