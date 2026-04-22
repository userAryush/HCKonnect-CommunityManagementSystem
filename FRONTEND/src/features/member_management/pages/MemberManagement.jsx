import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../../../shared/components/layout/Navbar'
import apiClient from '../../../shared/services/apiClient'
import CreateVacancyModal from '../../vacancy/components/CreateVacancyModal'
import PageHeader from '../../../shared/components/layout/PageHeader'
import Button from '../../../shared/components/ui/Button'
import ManagementTable from '../../../shared/components/layout/ManagementTable'
import AddMemberModal from '../components/AddMemberModal'
import ConfirmationModal from '../../../shared/components/modals/ConfirmationModal'
import { UserX, UserCheck, Edit } from 'lucide-react'
import Dropdown from '../../../shared/components/ui/Dropdown'
import Badge from '../../../shared/components/ui/Badge'
import Toast from '../../../shared/components/ui/Toast'
import Footer from '../../../shared/components/layout/Footer'
import { TableSkeleton } from '../../../shared/components/layout/Skeleton'

export default function MemberManagement() {
  const { id } = useParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [addModalOpen, setAddModalOpen] = useState(false)

  // Status states
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [errorMembers, setErrorMembers] = useState('')
  const [isCreateVacancyModalOpen, setCreateVacancyModalOpen] = useState(false)

  // Confirmation Modal State
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState({});
  const [isConfirming, setIsConfirming] = useState(false);


  const fetchMembers = async () => {
    try {
      setLoadingMembers(true)
      const res = await apiClient.get(`/communities/${id}/members/`)
      setMembers(res.data || [])
    } catch (err) {
      console.error(err)
      setErrorMembers('Failed to fetch members')
    } finally {
      setLoadingMembers(false)
    }
  }

  // 1. Fetch Members
  useEffect(() => {
    fetchMembers()
  }, [id])

  const handleMemberAdded = () => {
    setToast({ type: 'success', message: 'Successfully added the new member!' });
    fetchMembers(); // Refetch members list
  }

  // Open modal for role change
  const promptRoleChange = (member, newRole) => {
    if (member.role === newRole) return;

    setConfirmModalProps({
      title: 'Change Member Role?',
      message: `Are you sure you want to change ${member.first_name}'s role from ${member.role} to ${newRole}?`,
      confirmText: 'Confirm Change',
      loadingText: 'Updating...',
      onConfirm: () => executeRoleChange(member.id, newRole),
    });
    setConfirmModalOpen(true);
  };

  // Open modal for removal
  const promptRemove = (member) => {
    setConfirmModalProps({
      title: 'Remove Member?',
      message: `Are you sure you want to remove ${member.first_name} ${member.last_name} from the community? This action cannot be undone.`,
      confirmText: 'Remove Member',
      loadingText: 'Removing...',
      onConfirm: () => executeRemove(member.id),
    });
    setConfirmModalOpen(true);
  };

  // Execution functions
  const executeRoleChange = async (membershipId, newRole) => {
    setIsConfirming(true);
    try {
      await apiClient.patch(`/communities/memberships/${membershipId}/change-role/`, { role: newRole });
      setMembers(prev => prev.map(m => m.id === membershipId ? { ...m, role: newRole } : m));
      setToast({ type: 'success', message: `Role updated successfully.` });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to update role' });
    } finally {
      setIsConfirming(false);
      setConfirmModalOpen(false);
    }
  };

  const executeRemove = async (membershipId) => {
    setIsConfirming(true);
    try {
      await apiClient.delete(`/communities/members/remove/${membershipId}/`);
      setMembers(prev => prev.filter(m => m.id !== membershipId));
      setToast({ type: 'success', message: 'Member removed successfully.' });
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to remove member' });
    } finally {
      setIsConfirming(false);
      setConfirmModalOpen(false);
    }
  };

  const tableColumns = ['S.N.', 'Name', 'Email', 'Role', 'Join Date', 'Actions'];

  const renderMemberRow = (member, index) => {
    const memberActions = [
      {
        label: 'Set as Member',
        icon: <UserCheck size={14} />,
        onClick: () => promptRoleChange(member, 'member'),
        disabled: member.role === 'member',
      },
      {
        label: 'Set as Representative',
        icon: <UserCheck size={14} />,
        onClick: () => promptRoleChange(member, 'representative'),
        disabled: member.role === 'representative',
      },
      {
        label: 'Remove Member',
        icon: <UserX size={14} />,
        onClick: () => promptRemove(member),
        variant: 'danger',
      },
    ];

    return (
      <tr key={member.id} className="hover:bg-secondary/50 transition-colors">
        <td className="px-8 py-5 text-body text-surface-dark whitespace-nowrap text-center">
          {index + 1}
        </td>
        <td className="px-8 py-5 text-body text-surface-dark whitespace-nowrap">
          {/* first name cha vane keep both else use username */}
          {member.first_name ? `${member.first_name} ${member.last_name}` : member.username}
        </td>
        <td className="px-8 py-5 text-surface-body">{member.email}</td>
        <td className="px-8 py-5">
          <Badge variant={member.role === 'representative' ? 'primary' : 'blue'}>
            {member.role}
          </Badge>
        </td>
        <td className="px-8 py-5 text-surface-body whitespace-nowrap">
          {member.join_date ? new Date(member.join_date).toLocaleDateString() : '-'}
        </td>
        <td className="px-8 py-5 text-right">
          <Dropdown
            actions={memberActions}
            align="right"
            trigger={
              <Button variant="ghost" className="!px-3 !py-1.5 !rounded-lg text-primary border-primary/30 hover:bg-primary/10">
                <Edit size={16} className="mr-1.5" />
                Edit
              </Button>
            }
          />
        </td>
      </tr>
    );
  }

  return (
    <div className="min-h-screen bg-secondary text-surface-dark">
      <Navbar menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} closeMenu={() => setMenuOpen(false)} navSolid />

      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-6xl px-4">
          <PageHeader
            title="Manage Members"
            subtitle="View and manage community members and roles"
            backLinkTo={`/community/${id}/dashboard`}
            backLinkText="Dashboard"
          >
            <div className="flex justify-end gap-3">
              <Button variant="primary" onClick={() => setAddModalOpen(true)}>
                Add Member
              </Button>
              <Button variant="secondary" onClick={() => setCreateVacancyModalOpen(true)}>
                Create Vacancy
              </Button>
            </div>
          </PageHeader>

          {loadingMembers ? (
            <TableSkeleton rows={7} columns={6} />
          ) : errorMembers ? (
            <div className="p-12 text-center text-red-600">{errorMembers}</div>
          ) : (
            <ManagementTable
              columns={tableColumns}
              items={members}
              renderRow={renderMemberRow}
              emptyStateMessage="No members found in this community."
            />
          )}
        </div>
      </main>
      {/* <Footer /> */}

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        isLoading={isConfirming}
        {...confirmModalProps}
      />

      <AddMemberModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        communityId={id}
        onMemberAdded={handleMemberAdded}
      />

      <CreateVacancyModal
        isOpen={isCreateVacancyModalOpen}
        onClose={() => setCreateVacancyModalOpen(false)}
        communityId={id}
        onVacancyCreated={() => {
        }}
      />

    </div>
  )

}


