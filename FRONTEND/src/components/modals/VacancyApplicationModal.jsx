import { useState } from 'react';
import { Upload, Send, FileText } from 'lucide-react';
import vacancyService from '../../services/vacancyService';
import Button from '../shared/Button';
import ModalWrapper from './ModalWrapper';
import ModalHeader from './ModalHeader';
import getApiErrorMessage from '../../utils/getApiErrorMessage';

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
      const errorMsg = getApiErrorMessage(
        err,
        'Failed to submit application. You may have already applied.'
      );
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper isOpen={!!vacancy} onClose={onClose} className="max-w-xl">
      <ModalHeader
        title="Apply for Position"
        subtitle={vacancy.title}
        onClose={onClose}
      />

      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        {error && (
          <div className="rounded-xl bg-red-50/50 p-4 text-body text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-body text-surface-dark">Cover Letter</label>
          <textarea
            rows="5"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us why you are a good fit for this role..."
            className="w-full rounded-2xl input-standard p-4 text-sm outline-none transition-all focus:border-primary focus:bg-white focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="space-y-2">
          <label className="text-body text-surface-dark">Resume (Optional - PDF, Max 5MB)</label>
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
              className={`flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${resume ? 'border-primary bg-primary/5' : 'border-surface-border hover:border-primary hover:bg-secondary'
                }`}
            >
              {resume ? (
                <div className="flex items-center gap-3 text-primary">
                  <FileText size={32} />
                  <div className="text-left">
                    <p className="text-body text-surface-dark">{resume.name}</p>
                    <p className="text-xs">{(resume.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload size={32} className="mb-2 text-surface-muted" />
                  <p className="text-body text-surface-dark">Click to upload or drag and drop</p>
                  <p className="text-xs text-surface-muted">PDF, DOC up to 5MB</p>
                </>
              )}
            </label>
          </div>
        </div>

        <div className="flex gap-4 pt-2">
          <Button
            variant="outline"
            type="button"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
            loadingText="Submitting..."
            className="w-2/3 h-12"
          >
            <Send size={18} className="mr-2" />
            Submit Application
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
