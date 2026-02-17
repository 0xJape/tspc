import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { User, Trophy } from 'lucide-react'
import PlayerProfile from '../components/PlayerProfile'
import { membersAPI, matchesAPI } from '../services/api'

// Demo data
const demoMembers = {
  '1': { id: '1', full_name: 'Anna Clarice Patrimonio', age: 25, gender: 'Female', skill_level: 'Advanced', wins: 15, losses: 3, points: 1500, ranking_position: 1, date_joined: '2024-06-15' },
  '2': { id: '2', full_name: 'Arianne Gajasan', age: 38, gender: 'Female', skill_level: 'Advanced', wins: 12, losses: 5, points: 1200, ranking_position: 2, date_joined: '2024-07-20' },
  '3': { id: '3', full_name: 'Sophia P. Anh', age: 28, gender: 'Female', skill_level: 'Advanced', wins: 10, losses: 6, points: 1000, ranking_position: 3, date_joined: '2024-08-10' },
  '4': { id: '4', full_name: 'John Doe', age: 22, gender: 'Male', skill_level: 'Intermediate', wins: 8, losses: 8, points: 800, ranking_position: 4, date_joined: '2025-01-05' },
  '5': { id: '5', full_name: 'Jane Smith', age: 30, gender: 'Female', skill_level: 'Beginner', wins: 5, losses: 10, points: 500, ranking_position: 5, date_joined: '2025-03-12' },
  '6': { id: '6', full_name: 'Mary Santos', age: 26, gender: 'Female', skill_level: 'Intermediate', wins: 7, losses: 9, points: 700, ranking_position: 6, date_joined: '2025-02-20' },
}

export default function MemberProfilePage() {
  const { id } = useParams()
  const [member, setMember] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await membersAPI.getById(id)
        setMember(res.data)
      } catch {
        // Fallback to demo data
        if (demoMembers[id]) {
          setMember(demoMembers[id])
        } else {
          setError('Member not found')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchMember()
  }, [id])

  useEffect(() => {
    const fetchMatches = async () => {
      if (!id) return
      try {
        const res = await matchesAPI.getAll()
        // Filter matches where the member participated
        const memberMatches = res.data.filter(match => 
          match.player1_id === id || 
          match.player2_id === id || 
          match.team1_partner_id === id || 
          match.team2_partner_id === id
        ).sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
        
        setMatches(memberMatches)
      } catch (error) {
        console.error('Failed to fetch matches:', error)
      }
    }
    fetchMatches()
  }, [id])

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl border border-gray-100 p-8 animate-pulse">
          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-gray-200 rounded-full" />
            <div className="flex-1">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !member) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-gray-400">{error || 'Member not found'}</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PlayerProfile member={member} />
      
      {/* Match History */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Match History</h2>
        {matches.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center">
            <p className="text-gray-400">No match history yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {matches.map((match) => {
              // Calculate sets won for each team
              const team1Sets = [
                match.set1_team1_score > match.set1_team2_score ? 1 : 0,
                match.set2_team1_score > match.set2_team2_score ? 1 : 0,
                match.set3_team1_score && match.set3_team2_score && match.set3_team1_score > match.set3_team2_score ? 1 : 0
              ].reduce((a, b) => a + b, 0)
              
              const team2Sets = [
                match.set1_team2_score > match.set1_team1_score ? 1 : 0,
                match.set2_team2_score > match.set2_team1_score ? 1 : 0,
                match.set3_team2_score && match.set3_team1_score && match.set3_team2_score > match.set3_team1_score ? 1 : 0
              ].reduce((a, b) => a + b, 0)

              // Check if member is in team 1
              const isTeam1 = match.player1_id === id || match.team1_partner_id === id
              const memberWon = (isTeam1 && team1Sets > team2Sets) || (!isTeam1 && team2Sets > team1Sets)

              return (
                <div key={match.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow">
                  {/* Tournament Name */}
                  {match.tournament && (
                    <div className="mb-3 pb-2 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-baseline-green" />
                        <span className="text-sm font-medium text-baseline-green">{match.tournament.name}</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      {/* Team 1 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                            {match.player1?.profile_photo ? (
                              <img src={match.player1.profile_photo} alt={match.player1?.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className={`font-medium ${match.player1_id === id ? 'text-baseline-green' : 'text-gray-900'}`}>
                              {match.player1?.full_name || 'TBD'}
                            </span>
                            {match.team1_partner && (
                              <span className={`text-sm ${match.team1_partner_id === id ? 'text-baseline-green' : 'text-gray-600'}`}>
                                {' & '}{match.team1_partner.full_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`text-xl font-bold ${
                          team1Sets > team2Sets ? 'text-baseline-green' : 'text-gray-400'
                        }`}>
                          {team1Sets}
                        </span>
                      </div>
                      {/* Team 2 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                            {match.player2?.profile_photo ? (
                              <img src={match.player2.profile_photo} alt={match.player2?.full_name} className="w-full h-full object-cover" />
                            ) : (
                              <User className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <span className={`font-medium ${match.player2_id === id ? 'text-baseline-green' : 'text-gray-900'}`}>
                              {match.player2?.full_name || 'TBD'}
                            </span>
                            {match.team2_partner && (
                              <span className={`text-sm ${match.team2_partner_id === id ? 'text-baseline-green' : 'text-gray-600'}`}>
                                {' & '}{match.team2_partner.full_name}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className={`text-xl font-bold ${
                          team2Sets > team1Sets ? 'text-baseline-green' : 'text-gray-400'
                        }`}>
                          {team2Sets}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-right">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          memberWon ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {memberWon ? 'Won' : 'Lost'}
                        </span>
                        {match.match_type && (
                          <p className="text-xs text-gray-500 mt-1">{match.match_type}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(match.match_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
