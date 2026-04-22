import React, { useState } from 'react';
import { Send } from 'lucide-react';
import apiClient from '../../services/apiClient';
import Button from '../ui/Button';
import ModalWrapper from './ModalWrapper';
import ModalHeader from './ModalHeader';

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

  const handleClose = () => {
    setSuccess(false);
    setSubject('');
    setMessage('');
    onClose();
  };

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
      setTimeout(handleClose, 2000);
    } catch (err) {
      console.error("Failed to send message", err);
      setError(err.response?.data?.error || 'Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} className="max-w-3xl">
      <ModalHeader
        title="Send a Message"
        subtitle={`To: ${communityName}`}
        onClose={handleClose}
      />

      <div className="p-8">
        {success ? (
          <div className="py-12 text-center space-y-4 animate-in zoom-in-95 duration-500">
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Send size={32} />
            </div>
            <h3 className="text-title text-2xl">Message Sent!</h3>
            <p className="text-body text-surface-muted">Your message has been delivered to {communityName}.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50/50 border border-red-200/50 text-red-600 text-body rounded-xl">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-metadata uppercase tracking-wider ml-1">To</label>
                <input
                  type="email"
                  value={communityEmail}
                  readOnly
                  className="w-full input-standard text-surface-muted text-body cursor-not-allowed"
                />
              </div>
              <div className="space-y-2">
                <label className="text-metadata uppercase tracking-wider ml-1">From</label>
                <input
                  type="email"
                  value={senderEmail}
                  readOnly
                  className="w-full input-standard text-surface-muted text-body cursor-not-allowed"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-metadata uppercase tracking-wider ml-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What is this about?"
                required
                className="w-full px-4 py-3 rounded-xl border border-surface-border text-body text-surface-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none input-standard"
              />
            </div>

            <div className="space-y-2">
              <label className="text-metadata uppercase tracking-wider ml-1">Message</label>
              <textarea
                rows="5"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message here..."
                required
                className="w-full px-4 py-3 rounded-xl border border-surface-border text-body text-surface-dark focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none resize-none input-standard"
              ></textarea>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                isLoading={loading}
                loadingText="Sending..."
                className="w-2/3"
              >
                <Send size={16} className="mr-2" />
                Send Message
              </Button>
            </div>
          </form>
        )}
      </div>
    </ModalWrapper>
  );
}
