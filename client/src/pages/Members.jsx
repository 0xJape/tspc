import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, Plus, Edit, Trash2 } from 'lucide-react'
import MemberCard from '../components/MemberCard'
import { membersAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Demo data
const demoMembers = [
  { id: '1', full_name: 'Anna Clarice Patrimonio', gender: 'Female', skill_level: 'Advanced', wins: 15, losses: 3, points: 1500, ranking_position: 1 },
  { id: '2', full_name: 'Arianne Gajasan', gender: 'Female', skill_level: 'Advanced', wins: 12, losses: 5, points: 1200, ranking_position: 2 },
  { id: '3', full_name: 'Sophia P. Anh', gender: 'Female', skill_level: 'Advanced', wins: 10, losses: 6, points: 1000, ranking_position: 3 },
  { id: '4', full_name: 'John Doe', gender: 'Male', skill_level: 'Intermediate', wins: 8, losses: 8, points: 800, ranking_position: 4 },
  { id: '5', full_name: 'Jane Smith', gender: 'Female', skill_level: 'Beginner', wins: 5, losses: 10, points: 500, ranking_position: 5 },
  { id: '6', full_name: 'Mary Santos', gender: 'Female', skill_level: 'Intermediate', wins: 7, losses: 9, points: 700, ranking_position: 6 },
]

const skillFilters = ['All', 'Beginner', 'Intermediate', 'Advanced']

export default function Members() {
  const { isAdmin } = useAuth()
  const [members, setMembers] = useState(demoMembers)
  const [filtered, setFiltered] = useState(demoMembers)
  const [search, setSearch] = useState('')
  const [skillFilter, setSkillFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const res = await membersAPI.getAll()
        if (res.data && res.data.length > 0) {
          setMembers(res.data)
          setFiltered(res.data)
        }
      } catch {
        // Use demo data
      } finally {
        setLoading(false)
      }
    }
    fetchMembers()
  }, [])

  useEffect(() => {
    let result = members

    if (skillFilter !== 'All') {
      result = result.filter(m => m.skill_level === skillFilter)
    }

    if (search.trim()) {
      result = result.filter(m =>
        m.full_name.toLowerCase().includes(search.toLowerCase())
      )
    }

    setFiltered(result)
  }, [search, skillFilter, members])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this member?')) return
    
    try {
      await membersAPI.delete(id)
      setMembers(members.filter(m => m.id !== id))
    } catch (error) {
      alert('Failed to delete member')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Members</h1>
          <p className="text-gray-500">Browse all club members and their profiles</p>
        </div>
        {isAdmin && (
          <Link
            to="/members/new"
            className="bg-baseline-green text-white px-5 py-2.5 rounded-xl font-medium hover:bg-baseline-green-dark transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Member</span>
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
          />
        </div>

        {/* Skill Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400 flex-shrink-0" />
          <div className="flex gap-1">
            {skillFilters.map((level) => (
              <button
                key={level}
                onClick={() => setSkillFilter(level)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  skillFilter === level
                    ? 'bg-baseline-green text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Members Count */}
      <p className="text-sm text-gray-400 mb-4">{filtered.length} members found</p>

      {/* Members Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((member) => (
            <div key={member.id} className="relative group">
              <MemberCard member={member} />
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/members/edit/${member.id}`}
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
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-400">No members found.</p>
        </div>
      )}
    </div>
  )
}
