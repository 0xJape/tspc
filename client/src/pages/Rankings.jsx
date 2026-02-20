import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Filter, RefreshCw } from 'lucide-react'
import RankingTable from '../components/RankingTable'
import { rankingsAPI, tournamentsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Demo data

const genderFilters = ['All', 'Male', 'Female']

export default function Rankings() {
  const { isAdmin } = useAuth()
  const location = useLocation()
  const [players, setPlayers] = useState([])
  const [tournaments, setTournaments] = useState([])
  const [tournamentFilter, setTournamentFilter] = useState('All')
  const [genderFilter, setGenderFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Fetch tournaments
  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const res = await tournamentsAPI.getAll()
        if (res.data) {
          setTournaments(res.data)
        }
      } catch (error) {
        console.error('Failed to fetch tournaments:', error)
      }
    }
    fetchTournaments()
  }, [])

  // Detect navigation from match recording
  useEffect(() => {
    if (location.state?.refresh) {
      console.log('🔄 Match recorded! Triggering refresh...', location.state.refresh)
      setRefreshTrigger(location.state.refresh)
    }
  }, [location.state])

  // Fetch rankings when filters change or when navigating to this page
  useEffect(() => {
    const fetchRankings = async () => {
      console.log('📊 Fetching rankings...', { tournamentFilter, genderFilter, refreshTrigger })
      setLoading(true)
      try {
        const params = {}
        if (tournamentFilter !== 'All') {
          params.tournament = tournamentFilter
        }
        if (genderFilter !== 'All') {
          params.gender = genderFilter
        }

        const res = await rankingsAPI.getAll(params)
        console.log('✅ Rankings fetched:', res.data?.length, 'players')
        if (res.data && res.data.length > 0) {
          setPlayers(res.data)
        } else {
          setPlayers([])
        }
      } catch (error) {
        console.error('❌ Failed to fetch rankings:', error)
        setPlayers([])
      } finally {
        setLoading(false)
      }
    }
    fetchRankings()
  }, [tournamentFilter, genderFilter, location.key, refreshTrigger])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Rankings</h1>
          <p className="text-gray-500">Tournament performance leaderboard</p>
        </div>
        <div className="flex items-center gap-2">

          <button
            onClick={() => setRefreshTrigger(Date.now())}
            className="flex items-center gap-2 px-4 py-2 bg-baseline-green text-white rounded-lg hover:bg-baseline-green/90 transition-colors"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-6">
        {/* Tournament Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Tournament</label>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1 flex-wrap">
              <button
                onClick={() => setTournamentFilter('All')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tournamentFilter === 'All'
                    ? 'bg-baseline-green text-white'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Overall
              </button>
              {tournaments.map((tournament) => (
                <button
                  key={tournament.id}
                  onClick={() => setTournamentFilter(tournament.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tournamentFilter === tournament.id
                      ? 'bg-baseline-green text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {tournament.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Gender</label>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <div className="flex gap-1">
              {genderFilters.map((gender) => (
                <button
                  key={gender}
                  onClick={() => setGenderFilter(gender)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    genderFilter === gender
                      ? 'bg-baseline-green text-white'
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-100 p-8 animate-pulse">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 py-4">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            </div>
          ))}
        </div>
      ) : players.length > 0 ? (
        <RankingTable 
          players={players} 
          isAdmin={isAdmin}
          tournamentId={tournamentFilter !== 'All' ? tournamentFilter : null}
          onUpdate={() => setRefreshTrigger(Date.now())}
        />
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-400">No players found for this filter.</p>
        </div>
      )}
    </div>
  )
}
