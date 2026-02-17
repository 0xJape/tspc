import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Edit, Trash2, Search } from 'lucide-react'
import { tournamentsAPI } from '../services/api'
import TournamentCard from '../components/TournamentCard'

export default function AdminTournaments() {
  const [tournaments, setTournaments] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTournaments()
  }, [])

  const fetchTournaments = async () => {
    try {
      const res = await tournamentsAPI.getAll()
      setTournaments(res.data)
    } catch {
      // Use demo data
      setTournaments([
        {
          id: '1',
          name: 'Spring Championship 2024',
          start_date: '2024-03-15',
          location: 'Main Court',
          category: 'Singles',
          skill_level: 'Advanced',
          max_participants: 32,
          current_participants: 28,
          status: 'Open'
        },
        {
          id: '2',
          name: 'Doubles Challenge',
          start_date: '2024-03-22',
          location: 'Court 2 & 3',
          category: 'Doubles',
          skill_level: 'Intermediate',
          max_participants: 16,
          current_participants: 12,
          status: 'Open'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return
    
    try {
      await tournamentsAPI.delete(id)
      setTournaments(tournaments.filter(t => t.id !== id))
    } catch (error) {
      alert('Failed to delete tournament')
    }
  }

  const filtered = tournaments.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Manage Tournaments</h1>
          <p className="text-gray-500">Create, edit, or remove tournaments</p>
        </div>
        <Link
          to="/admin/tournaments/new"
          className="bg-baseline-green text-white px-5 py-2.5 rounded-xl font-medium hover:bg-baseline-green-dark transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Tournament</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search tournaments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
        />
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tournament) => (
            <div key={tournament.id} className="relative group">
              <TournamentCard tournament={tournament} />
              {/* Admin Actions Overlay */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/admin/tournaments/edit/${tournament.id}`}
                  className="p-2 bg-white rounded-lg shadow-md hover:bg-blue-50 transition"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                </Link>
                <button
                  onClick={() => handleDelete(tournament.id)}
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
