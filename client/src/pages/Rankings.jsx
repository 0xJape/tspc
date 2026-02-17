import { useState, useEffect } from 'react'
import { Filter } from 'lucide-react'
import RankingTable from '../components/RankingTable'
import { rankingsAPI, tournamentsAPI } from '../services/api'

// Demo data
const demoPlayers = [
  { id: '1', full_name: 'Anna Clarice Patrimonio', gender: 'Female', skill_level: 'Advanced', wins: 15, losses: 3, points: 1500 },
  { id: '2', full_name: 'Arianne Gajasan', gender: 'Female', skill_level: 'Advanced', wins: 12, losses: 5, points: 1200 },
  { id: '3', full_name: 'Sophia P. Anh', gender: 'Female', skill_level: 'Advanced', wins: 10, losses: 6, points: 1000 },
  { id: '4', full_name: 'John Doe', gender: 'Male', skill_level: 'Intermediate', wins: 8, losses: 8, points: 800 },
  { id: '5', full_name: 'Mary Santos', gender: 'Female', skill_level: 'Intermediate', wins: 7, losses: 9, points: 700 },
  { id: '6', full_name: 'Jane Smith', gender: 'Female', skill_level: 'Beginner', wins: 5, losses: 10, points: 500 },
  { id: '7', full_name: 'Carlos Rivera', gender: 'Male', skill_level: 'Intermediate', wins: 6, losses: 7, points: 650 },
  { id: '8', full_name: 'Lisa Chen', gender: 'Female', skill_level: 'Beginner', wins: 3, losses: 12, points: 350 },
]

const genderFilters = ['All', 'Male', 'Female']

export default function Rankings() {
  const [players, setPlayers] = useState(demoPlayers)
  const [tournaments, setTournaments] = useState([])
  const [tournamentFilter, setTournamentFilter] = useState('All')
  const [genderFilter, setGenderFilter] = useState('All')
  const [loading, setLoading] = useState(true)

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

  // Fetch rankings when filters change
  useEffect(() => {
    const fetchRankings = async () => {
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
        if (res.data && res.data.length > 0) {
          setPlayers(res.data)
        } else {
          setPlayers([])
        }
      } catch (error) {
        console.error('Failed to fetch rankings:', error)
        setPlayers([])
      } finally {
        setLoading(false)
      }
    }
    fetchRankings()
  }, [tournamentFilter, genderFilter])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Rankings</h1>
        <p className="text-gray-500">Tournament performance leaderboard</p>
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
        <RankingTable players={players} />
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <p className="text-gray-400">No players found for this filter.</p>
        </div>
      )}
    </div>
  )
}
