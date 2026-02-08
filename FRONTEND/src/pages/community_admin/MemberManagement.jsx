import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import StudentSelect from '../../components/communities/StudentSelect'
import apiClient from '../../services/apiClient'

export default function MemberManagement() {
  const { id } = useParams()
  const [menuOpen, setMenuOpen] = useState(false)
  const [members, setMembers] = useState([])
  const [addModalOpen, setAddModalOpen] = useState(false)

  // States for adding a member
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedRole, setSelectedRole] = useState('member')
  const [loadingAdd, setLoadingAdd] = useState(false)

  // Status states
  const [banner, setBanner] = useState({ type: '', msg: '' })
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [errorMembers, setErrorMembers] = useState('')

  // 1. Fetch Members
  useEffect(() => {
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
    fetchMembers()
  }, [id])

  // 2. Change Role
  const handleRoleChange = async (membershipId, newRole) => {
    try {
      const memberToUpdate = members.find(m => m.id === membershipId)
      const displayName = memberToUpdate?.first_name
        ? `${memberToUpdate.first_name} ${memberToUpdate.last_name}`
        : memberToUpdate?.username || 'Member'

      await apiClient.patch(`/communities/memberships/${membershipId}/change-role/`, { role: newRole })

      setMembers(prev => prev.map(m => m.id === membershipId ? { ...m, role: newRole } : m))
      setBanner({ type: 'success', msg: `${displayName}'s role updated to ${newRole}!` })
    } catch (err) {
      setBanner({ type: 'error', msg: 'Failed to update role' })
    }
  }

  // 3. Remove Member
  const handleRemove = async (membershipId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return
    try {
      await apiClient.delete(`/communities/members/remove/${membershipId}/`)
      setMembers(prev => prev.filter(m => m.id !== membershipId))
      setBanner({ type: 'success', msg: 'Member removed successfully.' })
    } catch (err) {
      alert('Failed to remove member')
    }
  }

  // 4. Add Member
  const handleAddMember = async (e) => {
    e.preventDefault()
    if (!selectedStudent) return setBanner({ type: 'error', msg: 'Please select a student.' })

    try {
      setLoadingAdd(true)
      await apiClient.post('/communities/members/add/', {
        user_id: selectedStudent,
        role: selectedRole,
        community_id: id,
      })

      const res = await apiClient.get(`/communities/${id}/members/`)
      setMembers(res.data || [])
      setBanner({ type: 'success', msg: 'Successfully added the new member!' })
      setAddModalOpen(false)
      setSelectedStudent('')
      setSelectedRole('member')
    } catch (err) {
      const errorMsg = err.response?.data?.non_field_errors?.[0] || 'Failed to add member.'
      setBanner({ type: 'error', msg: errorMsg })
    } finally {
      setLoadingAdd(false)
      setTimeout(() => setBanner({ type: '', msg: '' }), 4000)
    }

  }


  // NEW: Modal control states
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: '', // 'role' or 'remove'
    member: null,
    tempRole: ''
  });

  // Open modal for role change
  const promptRoleChange = (member, newRole) => {
    // If the role didn't actually change, don't open modal
    if (member.role === newRole) return;

    setConfirmModal({
      isOpen: true,
      type: 'role',
      member: member,
      tempRole: newRole
    });
  };

  // Open modal for removal
  const promptRemove = (member) => {
    setConfirmModal({
      isOpen: true,
      type: 'remove',
      member: member,
      tempRole: ''
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, type: '', member: null, tempRole: '' });
  };

  // Execution functions (called when user clicks "Confirm" in the modal)
  const executeRoleChange = async () => {
    const { member, tempRole } = confirmModal;
    try {
      await apiClient.patch(`/communities/memberships/${member.id}/change-role/`, { role: tempRole });
      setMembers(prev => prev.map(m => m.id === member.id ? { ...m, role: tempRole } : m));
      setBanner({ type: 'success', msg: `Role updated for ${member.first_name || member.username}` });
    } catch (err) {
      setBanner({ type: 'error', msg: 'Failed to update role' });
    } finally {
      closeConfirmModal();
    }
  };

  const executeRemove = async () => {
    const { member } = confirmModal;
    try {
      await apiClient.delete(`/communities/members/remove/${member.id}/`);
      setMembers(prev => prev.filter(m => m.id !== member.id));
      setBanner({ type: 'success', msg: 'Member removed successfully.' });
    } catch (err) {
      setBanner({ type: 'error', msg: 'Failed to remove member' });
    } finally {
      closeConfirmModal();
    }
  };
  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#0d1f14]">
      <Navbar menuOpen={menuOpen} toggleMenu={() => setMenuOpen(!menuOpen)} closeMenu={() => setMenuOpen(false)} navSolid />

      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-6xl px-4"> {/* Increased max-w for better fit */}
          <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Manage Members</h1>
              <p className="text-[#4b4b4b]">View and manage community members and roles</p>
            </div>
            <Link to={`/community/${id}/dashboard`} className="rounded-xl border border-[#e5e7eb] bg-white px-6 py-2 text-sm font-bold transition hover:bg-gray-50 text-center">
              Back to Dashboard
            </Link>
          </header>

          {banner.msg && (
            <div className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${banner.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
              {banner.msg}
            </div>
          )}

          <div className="mb-4 flex justify-end gap-3">
            <button onClick={() => setAddModalOpen(true)} className="rounded-xl bg-[#75C043] px-5 py-2.5 text-sm font-bold text-[#0f1a12] shadow-lg shadow-[#75C043]/20 hover:bg-[#68ae3b] transition-all">
              Add Member
            </button>
            <Link to={`/community/${id}/manage/vacancies/create`} className="rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/20 hover:bg-[#2563EB] transition-all">
              Create Vacancy
            </Link>
          </div>

          <div className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
            <div className="overflow-x-auto">
              {loadingMembers ? (
                <div className="p-12 text-center text-gray-500">Loading members...</div>
              ) : errorMembers ? (
                <div className="p-12 text-center text-red-600">{errorMembers}</div>
              ) : members.length === 0 ? (
                <div className="p-12 text-center text-gray-500">No members found in this community.</div>
              ) : (
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-[#f9fafb] text-[#4b4b4b] border-b border-[#e5e7eb]">
                    <tr>
                      <th className="px-6 py-4 font-bold">Name</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 font-bold">Role</th>
                      <th className="px-6 py-4 font-bold">Join Date</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-gray-50/50 transition-colors">
                        {/* white-space: nowrap keeps the name on one line */}
                        <td className="px-6 py-4 font-semibold text-[#0d1f14] whitespace-nowrap">
                          {member.first_name ? `${member.first_name} ${member.last_name}` : member.username}
                        </td>
                        <td className="px-6 py-4 text-[#4b4b4b]">{member.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider ${member.role === 'representative' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                            }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#4b4b4b] whitespace-nowrap">
                          {member.join_date || '-'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-end items-center gap-3">
                            <select
                              value={member.role}
                              onChange={(e) => promptRoleChange(member, e.target.value)}
                              className="..."
                            >
                              <option value="member">Member</option>
                              <option value="representative">Representative</option>
                            </select>
                            <button onClick={() => promptRemove(member)} className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">
                              Remove
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0d1f14]/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] bg-white p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              {/* Icon / Visual Indicator */}
              <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${confirmModal.type === 'remove' ? 'bg-red-100' : 'bg-blue-100'}`}>
                {confirmModal.type === 'remove' ? (
                  <span className="text-2xl">⚠️</span>
                ) : (
                  <span className="text-2xl">🔄</span>
                )}
              </div>

              <h3 className="mb-2 text-xl font-bold text-[#0d1f14]">
                {confirmModal.type === 'remove' ? 'Remove Member?' : 'Change Member Role?'}
              </h3>

              <p className="mb-8 text-[#4b4b4b]">
                {confirmModal.type === 'remove' ? (
                  <>Are you sure you want to remove <strong>{confirmModal.member?.first_name} {confirmModal.member?.last_name}</strong> from the community?</>
                ) : (
                  <>Change <strong>{confirmModal.member?.first_name}</strong>'s role from <span className="capitalize">{confirmModal.member?.role}</span> to <strong>{confirmModal.tempRole}</strong>?</>
                )}
              </p>

              <div className="flex flex-col gap-3">
                <button
                  onClick={confirmModal.type === 'remove' ? executeRemove : executeRoleChange}
                  className={`w-full rounded-2xl py-3 text-sm font-bold text-white transition-all shadow-lg ${confirmModal.type === 'remove' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-[#75C043] hover:bg-[#68ae3b] shadow-green-100'
                    }`}
                >
                  Confirm Action
                </button>
                <button
                  onClick={closeConfirmModal}
                  className="w-full rounded-2xl border-2 border-[#e5e7eb] py-3 text-sm font-bold text-[#4b4b4b] hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1f14]/40 p-4 backdrop-blur-md">
          {/* Increased width to max-w-2xl and added better padding */}
          <div className="w-full max-w-2xl overflow-hidden rounded-[32px] bg-white shadow-2xl transition-all">

            {/* Header Section */}
            <div className="bg-[#f4f5f2] px-8 py-6 border-b border-[#e5e7eb] flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-[#0d1f14]">Add Community Member</h3>
                <p className="text-sm text-[#4b4b4b]">Search for a student and assign their initial role.</p>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-200 text-[#6d6e70] transition-colors text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleAddMember} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Left Side: Student Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-[#4b4b4b]">
                    1. Search Student
                  </label>
                  <div className="relative">
                    {/* Ensure your StudentSelect handles searching internally */}
                    <StudentSelect
                      value={selectedStudent}
                      onChange={setSelectedStudent}
                    />
                    <p className="mt-2 text-xs text-[#666]">
                      Tip: Type the student's name or email to filter the list.
                    </p>
                  </div>
                </div>

                {/* Right Side: Role Assignment */}
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider text-[#4b4b4b]">
                    2. Assign Role
                  </label>
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full rounded-2xl border-2 border-[#e5e7eb] bg-white px-4 py-3 text-base outline-none focus:border-[#75C043] transition-all appearance-none cursor-pointer"
                    style={{ backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1rem center', backgroundSize: '1em' }}
                  >
                    <option value="member">General Member</option>
                    <option value="representative">Community Representative</option>
                  </select>
                  <p className="mt-2 text-xs text-[#666]">
                    Permissions can be adjusted later in the management table.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-4 pt-6 border-top border-[#f4f5f2]">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-2xl border-2 border-[#e5e7eb] bg-white px-8 py-3 text-sm font-bold text-[#0d1f14] hover:bg-[#f4f5f2] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAdd || !selectedStudent}
                  className="rounded-2xl bg-[#75C043] px-10 py-3 text-sm font-bold text-[#0f1a12] shadow-xl shadow-[#75C043]/30 hover:bg-[#68ae3b] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loadingAdd ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Processing...
                    </span>
                  ) : 'Confirm & Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )

}


