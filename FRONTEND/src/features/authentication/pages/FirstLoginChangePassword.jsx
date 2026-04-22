import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { useToast } from '../../../shared/components/ui/ToastContext';
import authService from '../service/authService';
import Button from '../../../shared/components/ui/Button';
import logo from '../../../assets/favicon.png';

function FirstLoginChangePassword() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});

    const navigate = useNavigate();
    const { refreshUser } = useAuth();
    const { showToast } = useToast();

    const validate = () => {
        const validationErrors = {};
        if (!oldPassword) validationErrors.oldPassword = 'Old password (auto-generated) is required.';
        if (!newPassword) validationErrors.newPassword = 'New password is required.';
        else if (newPassword.length < 8) validationErrors.newPassword = 'Password must be at least 8 characters.';

        if (newPassword !== confirmPassword) validationErrors.confirmPassword = 'Passwords do not match.';

        setErrors(validationErrors);
        return Object.keys(validationErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        if (!validate()) return;

        try {
            setIsLoading(true);
            await authService.changePassword(oldPassword, newPassword);

            // Re-fetch user to clear must_change_password status
            const updatedUser = await refreshUser();

            showToast('Password changed successfully. Welcome!', 'success');

            if (updatedUser?.role === 'community') {
                navigate(`/community/${updatedUser.id}/dashboard`);
            } else if (updatedUser?.role === 'admin') {
                window.location.href = 'http://127.0.0.1:8000/admin/';
            } else {
                navigate('/feed');
            }
        } catch (error) {
            console.error("Change Password Error:", error);
            showToast(error.response?.data?.old_password?.[0] || 'Failed to change password.', 'error');
            if (error.response?.data) setErrors(error.response.data);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="theme-original">
            <div className="flex min-h-screen w-full items-center justify-center bg-secondary px-6 py-12 antialiased">
                <div className="w-full max-w-md">
                    <div className="card-border bg-surface p-10 shadow-xl">
                        <div className="mb-10 text-center">
                            <img src={logo} alt="HCKonnect" className="mx-auto h-12 w-12 mb-6" />
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary mb-2">Security Required</p>
                            <h1 className="text-3xl font-display font-bold tracking-tight text-surface-dark">Change Password</h1>
                            <p className="mt-3 text-sm text-surface-body leading-relaxed text-center">
                                For your security, please change the auto-generated password before proceeding.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-surface-body ml-1">Current Password</label>
                                <input
                                    type="password"
                                    placeholder="Enter auto-generated password"
                                    className="w-full rounded-button border border-surface-border bg-secondary/30 px-4 py-3 text-sm text-surface-dark placeholder:text-surface-body focus:border-primary focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all"
                                    value={oldPassword}
                                    onChange={(e) => {
                                        setOldPassword(e.target.value);
                                        setErrors(prev => ({ ...prev, oldPassword: '' }));
                                    }}
                                />
                                {errors.oldPassword && <p className="mt-1 text-xs text-red-600">{Array.isArray(errors.oldPassword) ? errors.oldPassword[0] : errors.oldPassword}</p>}
                                {errors.old_password && <p className="mt-1 text-xs text-red-600">{errors.old_password[0]}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-surface-body ml-1">New Password</label>
                                <input
                                    type="password"
                                    placeholder="8+ characters"
                                    className="w-full rounded-button border border-surface-border bg-secondary/30 px-4 py-3 text-sm text-surface-dark placeholder:text-surface-body focus:border-primary focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all"
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        setErrors(prev => ({ ...prev, newPassword: '' }));
                                    }}
                                />
                                {errors.newPassword && <p className="mt-1 text-xs text-red-600">{Array.isArray(errors.newPassword) ? errors.newPassword[0] : errors.newPassword}</p>}
                                {errors.new_password && <p className="mt-1 text-xs text-red-600">{errors.new_password[0]}</p>}
                            </div>

                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-surface-body ml-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    placeholder="Retype new password"
                                    className="w-full rounded-button border border-surface-border bg-secondary/30 px-4 py-3 text-sm text-surface-dark placeholder:text-surface-body focus:border-primary focus:ring-4 focus:ring-brand/10 focus:outline-none transition-all"
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        setErrors(prev => ({ ...prev, confirmPassword: '' }));
                                    }}
                                />
                                {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                            </div>

                            <Button
                                type="submit"
                                className="w-full shadow-md mt-6"
                                isLoading={isLoading}
                                loadingText="Saving..."
                            >
                                Change Password & Continue
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default FirstLoginChangePassword;
