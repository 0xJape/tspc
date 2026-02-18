import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Trophy, Plus, Edit, Trash2 } from 'lucide-react'
import TournamentCard from '../components/TournamentCard'
import { tournamentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Demo data
const demoTournaments = [
  {
    id: '1',
    name: 'PPL Luzon Open 2026',
    date: '2026-03-15',
    location: 'Manila Sports Complex',
    category: 'Singles',
    skill_level: 'Advanced',
    registration_deadline: '2026-03-10',
    status: 'Upcoming',
    max_participants: 32,
    description: 'The biggest pickleball tournament in Luzon. Open to all advanced players.',
  },
  {
    id: '2',
    name: 'Mindanao Pickleball League',
    date: '2026-04-20',
    location: 'Davao Convention Center',
    category: 'Doubles',
    skill_level: 'Open',
    registration_deadline: '2026-04-15',
    status: 'Upcoming',
    max_participants: 64,
    description: 'Regional doubles tournament open to all skill levels.',
  },
  {
    id: '3',
    name: 'Club Championship 2026',
    date: '2026-05-10',
    location: 'Tupi Smash Pickleball Club Main Court',
    category: 'Singles',
    skill_level: 'Open',
    registration_deadline: '2026-05-05',
    status: 'Upcoming',
    max_participants: 16,
    description: 'Annual club championship. Members only.',
  },
  {
    id: '4',
    name: 'Summer Smash Invitational',
    date: '2026-01-20',
    location: 'Sports Arena',
    category: 'Mixed Doubles',
    skill_level: 'Intermediate',
    status: 'Finished',
    description: 'Invitational tournament for intermediate mixed doubles.',
  },
]

const statusFilters = ['All', 'Upcoming', 'Ongoing', 'Finished']

export default function Tournaments() {
  const { isAdmin } = useAuth()
  const [tournaments, setTournaments] = useState([])
  const [filtered, setFiltered] = useState([])
  const [statusFilter, setStatusFilter] = useState('All')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await tournamentsAPI.getAll()
        setTournaments(res.data || [])
      } catch (error) {
        console.error('Failed to fetch tournaments:', error)
        setTournaments([])
      } finally {
        setLoading(false)
      }
    }
    fetchTournaments()
  }, [])

  useEffect(() => {
    if (statusFilter === 'All') {
      setFiltered(tournaments)
    } else {
      setFiltered(tournaments.filter(t => t.status === statusFilter))
    }
  }, [statusFilter, tournaments])

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this tournament?')) return
    
    try {
      await tournamentsAPI.delete(id)
      setTournaments(tournaments.filter(t => t.id !== id))
    } catch (error) {
      alert('Failed to delete tournament')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Tournaments</h1>
          <p className="text-gray-500">Browse and register for upcoming tournaments</p>
        </div>
        {isAdmin && (
          <Link
            to="/tournaments/new"
            className="bg-baseline-green text-white px-5 py-2.5 rounded-xl font-medium hover:bg-baseline-green-dark transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Tournament</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex gap-1">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-baseline-green text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-400 mb-4">{filtered.length} tournaments</p>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-6" />
              <div className="h-10 bg-gray-200 rounded-lg w-full" />
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((tournament) => (
            <div key={tournament.id} className="relative group">
              <TournamentCard tournament={tournament} />
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link
                    to={`/tournaments/edit/${tournament.id}`}
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
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No tournaments found.</p>
        </div>
      )}
    </div>
  )
}
