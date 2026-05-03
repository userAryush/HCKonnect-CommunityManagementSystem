import { useState } from 'react';
import authService from '../../../authentication/service/authService';
import ModalWrapper from '../../../../shared/components/modals/ModalWrapper';
import ModalHeader from '../../../../shared/components/modals/ModalHeader';
import Button from '../../../../shared/components/ui/Button';
import { useToast } from '../../../../shared/components/ui/ToastContext';

export default function ChangePasswordModal({ isOpen, onClose }) {
  const { showToast } = useToast();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setLoading(false);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      showToast('Please fill in all password fields.', 'error');
      return;
    }
    if (newPassword.length < 8) {
      showToast('New password must be at least 8 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(oldPassword, newPassword);
      showToast('Password changed successfully.', 'success');
      handleClose();
    } catch (error) {
      const msg = error.response?.data?.old_password?.[0]
        || error.response?.data?.new_password?.[0]
        || 'Failed to change password.';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={handleClose} className="max-w-xl">
      <ModalHeader
        title="Change Password"
        subtitle="Update your account password."
        onClose={handleClose}
      />
      <form onSubmit={handleSubmit} className="space-y-5 p-8">
        <div>
          <label className="mb-2 block text-sm font-bold text-surface-dark">Current Password</label>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="w-full input-standard"
            required
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-surface-dark">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full input-standard"
            required
            minLength={8}
          />
        </div>
        <div>
          <label className="mb-2 block text-sm font-bold text-surface-dark">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full input-standard"
            required
            minLength={8}
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-surface-border">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading} loadingText="Changing...">
            Change Password
          </Button>
        </div>
      </form>
    </ModalWrapper>
  );
}
