import { useState } from 'react';
import apiClient from '../../../shared/services/apiClient';
import Button from '../../../shared/components/ui/Button';
import StudentSelect from './StudentSelect';
import ModalWrapper from '../../../shared/components/modals/ModalWrapper';
import ModalHeader from '../../../shared/components/modals/ModalHeader';

const AddMemberModal = ({ isOpen, onClose, communityId, onMemberAdded }) => {
    const [selectedStudent, setSelectedStudent] = useState('');
    const [selectedRole, setSelectedRole] = useState('member');
    const [loadingAdd, setLoadingAdd] = useState(false);
    const [error, setError] = useState('');

    const handleAddMember = async (e) => {
        e.preventDefault();
        if (!selectedStudent) {
            setError('Please select a student.');
            return;
        }
        setError('');
        setLoadingAdd(true);

        try {
            await apiClient.post('/communities/members/add/', {
                user_id: selectedStudent,
                role: selectedRole,
                community_id: communityId,
            });

            onMemberAdded(); // Notify parent to refetch members
            handleClose(); // Close and reset modal
        } catch (err) {
            const errorMsg = err.response?.data?.non_field_errors?.[0] || 'Failed to add member.';
            setError(errorMsg);
        } finally {
            setLoadingAdd(false);
        }
    };

    const handleClose = () => {
        setSelectedStudent('');
        setSelectedRole('member');
        setError('');
        setLoadingAdd(false);
        onClose();
    };

    return (
        <ModalWrapper isOpen={isOpen} onClose={handleClose}>
            <ModalHeader
                title="Add Community Member"
                subtitle="Search for a student and assign their initial role."
                onClose={handleClose}
            />

            <div className="p-7 space-y-5">
                {error && (
                    <div className="rounded-lg bg-red-50/50 p-4 text-sm text-red-600 border border-red-200/50">
                        {error}
                    </div>
                )}

                <div className="space-y-1.5">
                    <label className="text-metadata uppercase tracking-wider">
                        Student
                    </label>
                    <StudentSelect value={selectedStudent} onChange={setSelectedStudent} />
                </div>

                <div className="space-y-1.5">
                    <label className="text-metadata uppercase tracking-wider">
                        Role
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { value: 'member', label: 'General member', desc: 'Standard access' },
                            { value: 'representative', label: 'Representative', desc: 'Can manage members' },
                        ].map((role) => (
                            <button
                                key={role.value}
                                type="button"
                                onClick={() => setSelectedRole(role.value)}
                                className={`text-left rounded-xl border-2 px-4 py-3 transition-all ${selectedRole === role.value
                                    ? 'border-primary bg-primary/5'
                                    : 'border-surface-border bg-secondary'
                                    }`}
                            >
                                <p className="text-body text-surface-dark">{role.label}</p>
                                <p className="text-xs text-surface-muted mt-0.5">{role.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-4 pt-6 border-t border-surface-border">
                    <Button
                        type="button"
                        onClick={handleClose}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loadingAdd || !selectedStudent}
                        isLoading={loadingAdd}
                        loadingText="Processing..."
                        variant="primary"
                    >
                        Confirm & Add Member
                    </Button>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default AddMemberModal;