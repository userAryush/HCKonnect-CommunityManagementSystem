import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import StudentSelect from '../../components/communities/StudentSelect'


import axios from 'axios'

export default function MemberManagement() {
  const { id } = useParams()
  const [menuOpen, setMenuOpen] = useState(false)


  const [members, setMembers] = useState([])
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedRole, setSelectedRole] = useState('member')
  const [loadingAdd, setLoadingAdd] = useState(false)
  const [banner, setBanner] = useState({ type: '', msg: '' })
  const [loadingMembers, setLoadingMembers] = useState(true)
  const [errorMembers, setErrorMembers] = useState('')

  const handleRoleChange = async (membershipId, newRole) => {
    try {
      await axios.patch(`http://localhost:8000/communities/memberships/${membershipId}/approve/`, { role: newRole })
      setMembers(prev => prev.map(m => m.id === membershipId ? { ...m, role: newRole } : m))
    } catch (err) {
      console.error('Failed to update role', err)
      alert('Failed to update role')
    }
  }


  const handleRemove = async (membershipId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) return
    try {
      await axios.delete(`http://localhost:8000/communities/members/${membershipId}/`)
      setMembers(prev => prev.filter(m => m.id !== membershipId))
    } catch (err) {
      console.error('Failed to remove member', err)
      alert('Failed to remove member')
    }
  }


  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setLoadingMembers(true)
        const res = await axios.get(`http://localhost:8000/communities/${id}/members/`)
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

  const handleAddMember = async (e) => {
    e.preventDefault()
    setBanner({ type: '', msg: '' })
    if (!selectedStudent) {
      setBanner({ type: 'error', msg: 'Select a student.' })
      return
    }
    try {
      setLoadingAdd(true)
      await axios.post('http://localhost:8000/communities/members/add/', {
        user_id: selectedStudent,
        role: selectedRole,
        community_id: id,
      })
      // Refresh members
      const res = await axios.get(`http://localhost:8000/communities/${id}/members/`)
      setMembers(res.data || [])


      setBanner({ type: 'success', msg: 'Member added successfully.' })
      setAddModalOpen(false)
      setSelectedStudent('')
      setSelectedRole('member')
    } catch {
      setBanner({ type: 'error', msg: 'Failed to add member.' })
    } finally {
      setLoadingAdd(false)
      setTimeout(() => setBanner({ type: '', msg: '' }), 2000)
    }
  }


  return (
    <div className="min-h-screen bg-[#f4f5f2] text-[#0d1f14]">
      <Navbar
        menuOpen={menuOpen}
        toggleMenu={() => setMenuOpen((v) => !v)}
        closeMenu={() => setMenuOpen(false)}
        navSolid={true}
      />

      <main className="pt-24 pb-16">
        <div className="mx-auto w-full max-w-5xl px-4">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Manage Members</h1>
              <p className="text-[#4b4b4b]">View and manage community members and roles</p>
            </div>
            <Link to={`/community/${id}/dashboard`} className="rounded-xl border border-[#e5e7eb] bg-white px-6 py-2 text-sm font-bold text-[#0d1f14] transition hover:bg-[#f4f5f2]">
              Back to Dashboard
            </Link>
          </header>

          {banner.msg && (
            <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${banner.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {banner.msg}
            </div>
          )}

          <div className="mb-4 flex justify-end gap-2">
            <button
              onClick={() => setAddModalOpen(true)}
              className="rounded-xl bg-[#75C043] px-4 py-2 text-sm font-bold text-[#0f1a12] shadow-lg shadow-[#75C043]/20 transition hover:bg-[#68ae3b]"
            >
              Add Member
            </button>

            <Link
              to={`/community/${id}/manage/vacancies/create`}
              className="rounded-xl bg-[#3B82F6] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#3B82F6]/20 transition hover:bg-[#2563EB]"
            >
              Create Vacancy
            </Link>
          </div>


          <div className="overflow-hidden rounded-3xl border border-[#e5e7eb] bg-white shadow-sm">
            <div className="overflow-x-auto">
              {loadingMembers ? (
                <div className="p-8 text-center">Loading members…</div>
              ) : errorMembers ? (
                <div className="p-8 text-center text-red-600">{errorMembers}</div>
              ) : members.length === 0 ? (
                <div className="p-8 text-center text-[#4b4b4b]">No members found.</div>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#f4f5f2] text-[#4b4b4b]">
                    <tr>
                      <th className="px-6 py-4 font-bold">Name</th>
                      <th className="px-6 py-4 font-bold">Email</th>
                      <th className="px-6 py-4 font-bold">Role</th>
                      <th className="px-6 py-4 font-bold">Join Date</th>
                      <th className="px-6 py-4 font-bold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f4f5f2]">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-[#f9fafb]">
                        <td className="px-6 py-4 font-medium">{member.username}</td>
                        <td className="px-6 py-4 text-[#4b4b4b]">{member.email}</td>
                        <td className="px-6 py-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${member.role === 'leader' ? 'bg-purple-100 text-purple-700' :
                            member.role === 'moderator' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                            {member.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#4b4b4b]">{member.created_at ? new Date(member.created_at).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <select
                              value={member.role}
                              onChange={(e) => handleRoleChange(member.id, e.target.value)}
                              className="rounded-lg border border-[#e5e7eb] bg-white px-2 py-1 text-xs outline-none focus:border-[#75C043]"
                            >
                              <option value="member">Member</option>
                              <option value="moderator">Moderator</option>
                              <option value="leader">Leader</option>
                            </select>
                            <button
                              onClick={() => handleRemove(member.id)}
                              className="rounded-lg bg-red-100 px-3 py-1 text-xs font-bold text-red-600 hover:bg-red-200"
                            >
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

      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="bg-[#f4f5f2] px-6 py-4 border-b border-[#e5e7eb] flex justify-between items-center">
              <h3 className="text-lg font-semibold text-[#0d1f14]">Add Member</h3>
              <button onClick={() => setAddModalOpen(false)} className="text-[#6d6e70] hover:text-[#0d1f14] font-bold text-xl">&times;</button>
            </div>
            <form onSubmit={handleAddMember} className="p-6 space-y-4">
              <StudentSelect
                value={selectedStudent}
                onChange={setSelectedStudent}
              />

              <div>
                <label className="mb-2 block text-sm font-semibold">Select Role</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm outline-none focus:border-[#75C043]"
                >
                  <option value="member">Member</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-bold text-[#0d1f14] hover:bg-[#f4f5f2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAdd}
                  className="rounded-xl bg-[#75C043] px-4 py-2 text-sm font-bold text-[#0f1a12] shadow-lg shadow-[#75C043]/20 hover:bg-[#68ae3b] disabled:opacity-70"
                >
                  {loadingAdd ? 'Adding…' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
