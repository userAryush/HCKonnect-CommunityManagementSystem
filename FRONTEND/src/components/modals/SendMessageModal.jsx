import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import apiClient from '../../services/apiClient';
import Button from '../shared/Button'; // Import the Button component

export default function SendMessageModal({
  isOpen,
  onClose,
  communityName,
  communityEmail,
  senderEmail,
  communityId
}) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await apiClient.post('/communities/send-message/', {
        community_id: communityId,
        subject,
        message
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setSubject('');
        setMessage('');
      }, 2000);
    } catch (err) {
      console.error("Failed to send message", err);
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div
        className="bg-white w-full max-w-3xl rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-secondary px-8 py-6 border-b border-surface-border flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black text-surface-dark">Send a Message</h2>
            <p className="text-xs font-bold text-primary tracking-widest mt-1">To: {communityName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 transition-colors text-surface-muted"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8">
          {success ? (
            <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={32} />
              </div>
              <h3 className="text-2xl font-black text-surface-dark">Message Sent!</h3>
              <p className="text-surface-muted font-medium">Your message has been delivered to {communityName}.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-sm font-bold rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-muted uppercase tracking-wider ml-1">To</label>
                  <input
                    type="email"
                    value={communityEmail}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-100 text-sm text-surface-muted font-medium cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-surface-muted uppercase tracking-wider ml-1">From</label>
                  <input
                    type="email"
                    value={senderEmail}
                    readOnly
                    className="w-full px-4 py-3 rounded-xl bg-zinc-50 border border-zinc-100 text-sm text-surface-muted font-medium cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-muted uppercase tracking-wider ml-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="What is this about?"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm text-surface-dark font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-surface-muted uppercase tracking-wider ml-1">Message</label>
                <textarea
                  rows="5"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message here..."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 text-sm text-surface-dark font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={loading}
                  loadingText="Sending..."
                  className="flex-[2]"
                >
                  <Send size={16} className="mr-2" />
                  Send Message
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
