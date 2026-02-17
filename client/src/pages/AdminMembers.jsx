import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { membersAPI } from '../services/api'
import MemberCard from '../components/MemberCard'

export default function AdminMembers() {
  const [members, setMembers] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await membersAPI.getAll()
      setMembers(res.data)
    } catch {
      // Use demo data
      setMembers([
        { id: '1', full_name: 'Anna Patrimonio', skill_level: 'Advanced', wins: 15, losses: 3, points: 1500, ranking_position: 1 },
        { id: '2', full_name: 'Arianne Gajasan', skill_level: 'Advanced', wins: 12, losses: 5, points: 1200, ranking_position: 2 },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return
    
    try {
      await membersAPI.delete(id)
      setMembers(members.filter(m => m.id !== id))
    } catch (error) {
      alert('Failed to delete member')
    }
  }

  const filtered = members.filter(m =>
    m.full_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Members</h1>
          <p className="text-gray-500">Add, edit, or remove club members</p>
        </div>
        <Link
          to="/admin/members/new"
          className="bg-baseline-green text-white px-5 py-2.5 rounded-xl font-medium hover:bg-baseline-green-dark transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Member</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search members..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
        />
      </div>

      {/* Members Grid */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <div key={member.id} className="relative group">
              <MemberCard member={member} />
              {/* Admin Actions Overlay */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/admin/members/edit/${member.id}`}
                  className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 transition"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </Link>
                <button
                  onClick={() => handleDelete(member.id)}
                  className="p-2 bg-white rounded-lg shadow-md hover:bg-red-50 transition"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
