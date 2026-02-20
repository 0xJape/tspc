import { useState } from 'react'
import { Link } from 'react-router-dom'
import { User, Medal, Edit2, X, Save } from 'lucide-react'
import { apiRequest } from '../services/api'

const rankColors = {
  1: 'text-yellow-500',
  2: 'text-gray-400',
  3: 'text-orange-600',
}

const rankBg = {
  1: 'bg-yellow-50',
  2: 'bg-gray-50',
  3: 'bg-orange-50',
}

export default function RankingTable({ players, isAdmin = false, tournamentId = null, onUpdate = () => {} }) {
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [editForm, setEditForm] = useState({ points: 0, totalGames: 0 })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  const handleEdit = (player, e) => {
    e.preventDefault()
    e.stopPropagation()
    const wins = player.total_wins || player.wins || 0
    const losses = player.total_losses || player.losses || 0
    const totalGames = wins + losses
    
    setEditingPlayer(player)
    setEditForm({
      points: player.total_points || player.points || 0,
      totalGames: totalGames
    })
    setMessage(null)
  }

  const calculateWinsLosses = (points, totalGames) => {
    // Formula based on point system: winners get 6 points, losers get 3 points
    // wins = (points - 3 * totalGames) / 3
    // losses = totalGames - wins
    const wins = Math.max(0, Math.round((points - 3 * totalGames) / 3))
    const losses = Math.max(0, totalGames - wins)
    return { wins, losses }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!tournamentId) {
      setMessage({ type: 'error', text: 'Please select a specific tournament to edit stats' })
      return
    }

    setSaving(true)
    setMessage(null)

    try {
      const { wins, losses } = calculateWinsLosses(parseInt(editForm.points), parseInt(editForm.totalGames))
      
      await apiRequest(
        `rankings/member/${editingPlayer.id}/tournament/${tournamentId}`,
        'PUT',
        {
          points: parseInt(editForm.points),
          wins: wins,
          losses: losses
        }
      )

      setMessage({ type: 'success', text: 'Stats updated successfully!' })
      setEditingPlayer(null)
      
      // Refresh the rankings
      setTimeout(() => {
        onUpdate()
        setMessage(null)
      }, 1500)
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update stats' })
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setEditingPlayer(null)
    setMessage(null)
  }

  return (
    <>
      {/* Success/Error Message */}
      {message && (
        <div
          className={`mb-4 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Edit Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={handleCancel}>
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Edit Stats - {editingPlayer.full_name}</h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!tournamentId && (
              <div className="mb-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-lg">
                ⚠️ Please select a specific tournament to edit stats
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points
                </label>
                <input
                  type="number"
                  value={editForm.points}
                  onChange={(e) => setEditForm({ ...editForm, points: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green"
                  required
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Total Games Played
                </label>
                <input
                  type="number"
                  value={editForm.totalGames}
                  onChange={(e) => setEditForm({ ...editForm, totalGames: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green"
                  required
                  min="0"
                />
              </div>

              {editForm.points && editForm.totalGames && (
                <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-lg">
                  <div className="font-medium mb-1">Calculated Stats:</div>
                  <div className="flex gap-4">
                    <span>Wins: {calculateWinsLosses(parseInt(editForm.points) || 0, parseInt(editForm.totalGames) || 0).wins}</span>
                    <span>Losses: {calculateWinsLosses(parseInt(editForm.points) || 0, parseInt(editForm.totalGames) || 0).losses}</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving || !tournamentId}
                  className="flex-1 bg-baseline-green text-white py-2 rounded-lg font-medium hover:bg-baseline-green-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-2 border border-gray-200 rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className={`hidden sm:grid gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100`} style={{ gridTemplateColumns: isAdmin ? '0.5fr 2.5fr 1fr 1fr 1fr 1fr' : '0.5fr 2.5fr 1fr 1fr 1fr' }}>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Rank
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Player
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
            Wins
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
            Losses
          </div>
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
            Points
          </div>
          {isAdmin && (
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
              Actions
            </div>
          )}
        </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {players.map((player, index) => {
          const rank = index + 1
          const isTopThree = rank <= 3

          return (
            <div
              key={player.id}
              className={`grid gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors ${
                isTopThree ? rankBg[rank] || '' : ''
              }`}
              style={{ gridTemplateColumns: isAdmin ? '0.5fr 2.5fr 1fr 1fr 1fr 1fr' : '0.5fr 2.5fr 1fr 1fr 1fr' }}
            >
              {/* Rank */}
              <div>
                {isTopThree ? (
                  <div className="flex items-center">
                    <Medal className={`w-5 h-5 ${rankColors[rank]}`} />
                  </div>
                ) : (
                  <span className="text-lg font-bold text-gray-400">{rank}</span>
                )}
              </div>

              {/* Player */}
              <Link
                to={`/members/${player.id}`}
                className="flex items-center space-x-3 hover:underline"
              >
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {player.profile_photo ? (
                    <img
                      src={player.profile_photo}
                      alt={player.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{player.full_name}</p>
                </div>
              </Link>

              {/* Stats */}
              <div className="text-center font-medium text-gray-700">
                {player.total_wins || player.wins || 0}
              </div>
              <div className="text-center font-medium text-gray-700">
                {player.total_losses || player.losses || 0}
              </div>
              <div className="text-center">
                <span className="font-bold text-baseline-green text-lg">{player.total_points || player.points || 0}</span>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="flex justify-center">
                  <button
                    onClick={(e) => handleEdit(player, e)}
                    className="p-2 text-gray-400 hover:text-baseline-green hover:bg-baseline-green/10 rounded-lg transition-colors"
                    title="Edit stats"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
    </>
  )
}
