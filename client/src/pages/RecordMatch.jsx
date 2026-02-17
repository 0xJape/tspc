import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { membersAPI, tournamentsAPI } from '../services/api'

export default function RecordMatch() {
  const navigate = useNavigate()
  
  const [tournaments, setTournaments] = useState([])
  const [members, setMembers] = useState([])
  const [formData, setFormData] = useState({
    tournament_id: '',
    player1_id: '',
    player2_id: '',
    player1_score: '',
    player2_score: '',
    match_date: new Date().toISOString().split('T')[0],
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tournamentsRes, membersRes] = await Promise.all([
        tournamentsAPI.getAll(),
        membersAPI.getAll()
      ])
      setTournaments(tournamentsRes.data)
      setMembers(membersRes.data)
    } catch {
      // Use demo data
      setTournaments([
        { id: '1', name: 'Spring Championship 2024' },
        { id: '2', name: 'Doubles Challenge' }
      ])
      setMembers([
        { id: '1', full_name: 'Anna Patrimonio' },
        { id: '2', full_name: 'Arianne Gajasan' },
        { id: '3', full_name: 'Lance Mendez' },
      ])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.player1_id === formData.player2_id) {
      alert('Please select two different players')
      return
    }

    setLoading(true)

    try {
      // For now, we'll send to a matches endpoint (to be created in backend)
      const response = await fetch('http://localhost:3001/api/matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!response.ok) throw new Error('Failed to record match')
      
      alert('Match recorded successfully!')
      navigate('/')
    } catch (error) {
      alert('Failed to record match. Backend endpoint may not be ready yet.')
    } finally {
      setLoading(false)
    }
  }

  const winner = formData.player1_score && formData.player2_score
    ? parseInt(formData.player1_score) > parseInt(formData.player2_score)
      ? formData.player1_id
      : formData.player2_id
    : null

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Home
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Record Match Result
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tournament Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tournament *
            </label>
            <select
              value={formData.tournament_id}
              onChange={(e) => setFormData({ ...formData, tournament_id: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
              required
            >
              <option value="">Select tournament</option>
              {tournaments.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>

          {/* Match Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Match Date *
            </label>
            <input
              type="date"
              value={formData.match_date}
              onChange={(e) => setFormData({ ...formData, match_date: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
              required
            />
          </div>

          {/* Player 1 */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Player 1</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Player *
              </label>
              <select
                value={formData.player1_id}
                onChange={(e) => setFormData({ ...formData, player1_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                required
              >
                <option value="">Select player</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score *
              </label>
              <input
                type="number"
                value={formData.player1_score}
                onChange={(e) => setFormData({ ...formData, player1_score: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                required
              />
            </div>
            {winner === formData.player1_id && (
              <div className="text-sm font-medium text-baseline-green">
                ✓ Winner
              </div>
            )}
          </div>

          {/* VS Divider */}
          <div className="text-center text-gray-400 font-bold text-lg">VS</div>

          {/* Player 2 */}
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-gray-900">Player 2</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Player *
              </label>
              <select
                value={formData.player2_id}
                onChange={(e) => setFormData({ ...formData, player2_id: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                required
              >
                <option value="">Select player</option>
                {members.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Score *
              </label>
              <input
                type="number"
                value={formData.player2_score}
                onChange={(e) => setFormData({ ...formData, player2_score: e.target.value })}
                placeholder="0"
                min="0"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                required
              />
            </div>
            {winner === formData.player2_id && (
              <div className="text-sm font-medium text-baseline-green">
                ✓ Winner
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-baseline-green text-white py-3 rounded-xl font-medium hover:bg-baseline-green-dark transition-colors flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{loading ? 'Recording...' : 'Record Match'}</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
