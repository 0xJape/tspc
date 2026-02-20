import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save, Trophy } from 'lucide-react'
import { membersAPI, apiRequest } from '../services/api'

export default function MemberForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    age: '',
    gender: '',
    skill_level: 'Beginner',
    profile_photo: '',
  })
  const [loading, setLoading] = useState(false)
  const [tournaments, setTournaments] = useState([])
  const [memberStats, setMemberStats] = useState([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [savingStats, setSavingStats] = useState(false)
  const [statsMessage, setStatsMessage] = useState(null)

  useEffect(() => {
    if (isEdit && id) {
      fetchMember()
      loadTournaments()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEdit])

  useEffect(() => {
    if (isEdit && id && tournaments.length > 0) {
      loadMemberStats()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id, tournaments.length])

  const fetchMember = async () => {
    try {
      const res = await membersAPI.getById(id)
      setFormData(res.data)
    } catch (error) {
      alert('Failed to load member')
    }
  }

  const loadTournaments = async () => {
    try {
      const data = await apiRequest('tournaments/')
      setTournaments(data)
    } catch (error) {
      console.error('Error loading tournaments:', error)
    }
  }

  const loadMemberStats = async () => {
    setStatsLoading(true)
    try {
      const statsPromises = tournaments.map(async (tournament) => {
        try {
          const rankings = await apiRequest(`rankings/?tournament=${tournament.id}`)
          const memberRanking = rankings.find(r => r.id === id)
          
          const wins = memberRanking?.total_wins || memberRanking?.wins || 0
          const losses = memberRanking?.total_losses || memberRanking?.losses || 0
          
          return {
            tournament,
            stats: memberRanking ? {
              total_points: memberRanking.total_points || memberRanking.points || 0,
              total_games: wins + losses
            } : {
              total_points: 0,
              total_games: 0
            }
          }
        } catch (error) {
          return {
            tournament,
            stats: {
              total_points: 0,
              total_games: 0
            }
          }
        }
      })

      const stats = await Promise.all(statsPromises)
      setMemberStats(stats)
    } catch (error) {
      console.error('Error loading member stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleStatChange = (tournamentId, field, value) => {
    setMemberStats(prevStats =>
      prevStats.map(stat =>
        stat.tournament.id === tournamentId
          ? {
              ...stat,
              stats: {
                ...stat.stats,
                [field]: parseInt(value) || 0
              }
            }
          : stat
      )
    )
  }

  const calculateWinsLosses = (points, totalGames) => {
    // Formula based on point system: winners get 6 points, losers get 3 points
    // wins = (points - 3 * totalGames) / 3
    // losses = totalGames - wins
    const wins = Math.max(0, Math.round((points - 3 * totalGames) / 3))
    const losses = Math.max(0, totalGames - wins)
    return { wins, losses }
  }

  const handleSaveTournamentStats = async (tournamentId) => {
    const stat = memberStats.find(s => s.tournament.id === tournamentId)
    if (!stat) return

    setSavingStats(true)
    setStatsMessage(null)

    try {
      const { wins, losses } = calculateWinsLosses(
        stat.stats.total_points,
        stat.stats.total_games
      )
      
      await apiRequest(
        `rankings/member/${id}/tournament/${tournamentId}`,
        'PUT',
        {
          points: stat.stats.total_points,
          wins: wins,
          losses: losses
        }
      )

      setStatsMessage({ type: 'success', text: `Successfully updated stats for ${stat.tournament.name}` })
      
      // Reload stats to get updated data
      loadMemberStats()
    } catch (error) {
      setStatsMessage({ type: 'error', text: `Error updating stats: ${error.message}` })
    } finally {
      setSavingStats(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isEdit) {
        await membersAPI.update(id, formData)
      } else {
        await membersAPI.create(formData)
      }
      navigate('/members')
    } catch (error) {
      console.error('Error details:', error)
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error'
      alert(`Failed to ${isEdit ? 'update' : 'create'} member: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <button
        onClick={() => navigate('/members')}
        className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Members
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Edit Member' : 'Add New Member'}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
            />
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Level *
            </label>
            <select
              value={formData.skill_level}
              onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
              required
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Profile Photo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Photo URL
            </label>
            <input
              type="url"
              value={formData.profile_photo}
              onChange={(e) => setFormData({ ...formData, profile_photo: e.target.value })}
              placeholder="https://example.com/photo.jpg"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-baseline-green text-white py-3 rounded-xl font-medium hover:bg-baseline-green-dark transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Saving...' : isEdit ? 'Update Member' : 'Add Member'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/members')}
              className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Tournament Stats Section (Only for Edit) */}
      {isEdit && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8 mt-6">
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Tournament Statistics</h2>
          </div>

          {statsMessage && (
            <div
              className={`mb-4 p-4 rounded-lg ${
                statsMessage.type === 'success'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {statsMessage.text}
            </div>
          )}

          {statsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading tournament stats...</p>
            </div>
          ) : memberStats.length > 0 ? (
            <div className="space-y-4">
              {memberStats.map(({ tournament, stats }) => (
                <div key={tournament.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{tournament.name}</h3>
                    <p className="text-sm text-gray-600">
                      {tournament.category} • {tournament.skill_level}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Points
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stats.total_points}
                        onChange={(e) => handleStatChange(tournament.id, 'total_points', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total Games Played
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={stats.total_games}
                        onChange={(e) => handleStatChange(tournament.id, 'total_games', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {stats.total_points > 0 && stats.total_games > 0 && (
                    <div className="mb-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                      <div className="font-medium mb-1">Calculated Stats:</div>
                      <div className="flex gap-4">
                        <span>Wins: {calculateWinsLosses(stats.total_points, stats.total_games).wins}</span>
                        <span>Losses: {calculateWinsLosses(stats.total_points, stats.total_games).losses}</span>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => handleSaveTournamentStats(tournament.id)}
                    disabled={savingStats}
                    className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    {savingStats ? 'Saving...' : 'Save Tournament Stats'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-600">
              No tournament data available
            </div>
          )}
        </div>
      )}
    </div>
  )
}
