import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { membersAPI, tournamentsAPI, matchesAPI } from '../services/api'

export default function RecordMatch() {
  const navigate = useNavigate()
  
  const [tournaments, setTournaments] = useState([])
  const [members, setMembers] = useState([])
  const [formData, setFormData] = useState({
    tournament_id: '',
    player1_id: '',
    player2_id: '',
    set1_team1_score: '',
    set1_team2_score: '',
    set2_team1_score: '',
    set2_team2_score: '',
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

    // Validate all scores are filled
    if (!formData.set1_team1_score || !formData.set1_team2_score || 
        !formData.set2_team1_score || !formData.set2_team2_score) {
      alert('Please fill in all score fields')
      return
    }

    setLoading(true)

    try {
      // Convert scores to integers
      const matchData = {
        ...formData,
        set1_team1_score: parseInt(formData.set1_team1_score),
        set1_team2_score: parseInt(formData.set1_team2_score),
        set2_team1_score: parseInt(formData.set2_team1_score),
        set2_team2_score: parseInt(formData.set2_team2_score),
      }

      console.log('📝 Recording match...', matchData)
      const response = await matchesAPI.create(matchData)
      console.log('✅ Match recorded successfully!', response.data)
      
      alert('Match recorded successfully! Check the Rankings page to see updated scores.')
      
      // Navigate to rankings page with state to trigger refresh
      navigate('/rankings', { state: { refresh: Date.now() } })
    } catch (error) {
      console.error('❌ Match recording error:', error)
      alert(`Failed to record match: ${error.response?.data?.error || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const calculateWinner = () => {
    const set1Winner = parseInt(formData.set1_team1_score || 0) > parseInt(formData.set1_team2_score || 0) ? 1 : (parseInt(formData.set1_team2_score || 0) > parseInt(formData.set1_team1_score || 0) ? 2 : 0)
    const set2Winner = parseInt(formData.set2_team1_score || 0) > parseInt(formData.set2_team2_score || 0) ? 1 : (parseInt(formData.set2_team2_score || 0) > parseInt(formData.set2_team1_score || 0) ? 2 : 0)
    
    const team1Sets = (set1Winner === 1 ? 1 : 0) + (set2Winner === 1 ? 1 : 0)
    const team2Sets = (set1Winner === 2 ? 1 : 0) + (set2Winner === 2 ? 1 : 0)
    
    if (team1Sets > team2Sets) return formData.player1_id
    if (team2Sets > team1Sets) return formData.player2_id
    return null
  }
  
  const winner = calculateWinner()

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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set 1 *
                </label>
                <input
                  type="number"
                  value={formData.set1_team1_score}
                  onChange={(e) => setFormData({ ...formData, set1_team1_score: e.target.value })}
                  placeholder="0"
                  min="0"
                  max="21"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set 2 *
                </label>
                <input
                  type="number"
                  value={formData.set2_team1_score}
                  onChange={(e) => setFormData({ ...formData, set2_team1_score: e.target.value })}
                  placeholder="0"
                  min="0"
                  max="21"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                  required
                />
              </div>
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set 1 *
                </label>
                <input
                  type="number"
                  value={formData.set1_team2_score}
                  onChange={(e) => setFormData({ ...formData, set1_team2_score: e.target.value })}
                  placeholder="0"
                  min="0"
                  max="21"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Set 2 *
                </label>
                <input
                  type="number"
                  value={formData.set2_team2_score}
                  onChange={(e) => setFormData({ ...formData, set2_team2_score: e.target.value })}
                  placeholder="0"
                  min="0"
                  max="21"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                  required
                />
              </div>
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
