import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, User, Trophy, Calendar, Award, ArrowRight, ChevronRight, Plus } from 'lucide-react'
import { membersAPI, tournamentsAPI, scheduleAPI, matchesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

// Demo data for when API is not connected
const demoStats = {
  members: 128,
  topPlayer: 'Anna Patrimonio',
  upcomingMatches: 4,
  tournaments: 2,
}

const demoRecentMatches = [
  { id: 1, player1: 'Anna Patrimonio', player2: 'Arianne Gajasan', score1: 11, score2: 6, status: 'Finished' },
  { id: 2, player1: 'Sophia P. Anh', player2: 'John Doe', score1: 11, score2: 8, status: 'Finished' },
  { id: 3, player1: 'Jane Smith', player2: 'Mary Santos', score1: 9, score2: 11, status: 'Finished' },
]

export default function Home() {
  const { isAdmin } = useAuth()
  const [stats, setStats] = useState(demoStats)
  const [recentMatches, setRecentMatches] = useState(demoRecentMatches)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [membersRes, tournamentsRes, matchesRes] = await Promise.all([
          membersAPI.getAll(),
          tournamentsAPI.getAll(),
          matchesAPI.getAll(),
        ])
        
        const members = membersRes.data
        const tournaments = tournamentsRes.data
        const topPlayer = members[0]?.full_name || 'N/A'
        const upcoming = tournaments.filter(t => t.status === 'Upcoming').length

        setStats({
          members: members.length,
          topPlayer,
          upcomingMatches: upcoming,
          tournaments: tournaments.length,
        })

        // Get 5 most recent finished matches
        const finishedMatches = matchesRes.data
          .filter(m => m.status === 'Finished')
          .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
          .slice(0, 5)
        
        setRecentMatches(finishedMatches)
      } catch {
        // Use demo data if API fails
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center px-3 py-1 rounded-full bg-baseline-green-light text-baseline-green-dark text-sm font-medium mb-6">
                <Trophy className="w-4 h-4 mr-1.5" />
                #1 Smash Club Platform
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Elevate Your
                <span className="text-baseline-green"> Game.</span>
              </h1>
              <p className="text-gray-500 text-lg mb-8">
                Track rankings, schedules, and tournaments in one modern platform.
                The official digital platform of <span className="club-name text-gray-700">Tupi Smash Pickleball Club</span>.
              </p>
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  to="/rankings"
                  className="inline-flex items-center bg-baseline-green text-white px-6 py-3 rounded-xl font-medium hover:bg-baseline-green-dark transition-colors"
                >
                  View Rankings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
                <Link
                  to="/tournaments"
                  className="inline-flex items-center border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                >
                  View Tournaments
                </Link>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="w-full max-w-md">
              <div className="relative">
                <img src="/tspc.svg" alt="TSPC Logo" className="w-full h-72 object-contain border-2 border-gray-100 rounded-3xl shadow-sm p-8 bg-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.members}</h3>
            <p className="text-gray-500 text-sm">Members</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center mb-3">
              <Award className="w-5 h-5 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 truncate">{stats.topPlayer}</h3>
            <p className="text-gray-500 text-sm">Top Player</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-3">
              <Calendar className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.upcomingMatches}</h3>
            <p className="text-gray-500 text-sm">Upcoming</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center mb-3">
              <Trophy className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900">{stats.tournaments}</h3>
            <p className="text-gray-500 text-sm">Tournaments</p>
          </div>
        </div>
      </section>

      {/* Recent Matches Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Recent Matches</h2>
          <Link to="/rankings" className="text-sm text-baseline-green hover:text-baseline-green-dark font-medium flex items-center">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        {recentMatches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <p className="text-gray-400">No matches recorded yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentMatches.map((match) => {
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
                            <span className="font-medium text-gray-900">{match.player1?.full_name || 'TBD'}</span>
                            {match.team1_partner && (
                              <span className="text-sm text-gray-600"> & {match.team1_partner.full_name}</span>
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
                            <span className="font-medium text-gray-900">{match.player2?.full_name || 'TBD'}</span>
                            {match.team2_partner && (
                              <span className="text-sm text-gray-600"> & {match.team2_partner.full_name}</span>
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
                        <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {match.status}
                        </span>
                        {match.match_type && (
                          <p className="text-xs text-gray-500 mt-1">{match.match_type}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-baseline-green rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span className="club-name font-semibold text-gray-900">Tupi Smash Pickleball Club</span>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} Tupi Smash Pickleball Club. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Floating Action Button - Admin Only */}
      {isAdmin && (
        <Link
          to="/matches/record"
          className="fixed bottom-8 right-8 bg-baseline-green text-white p-4 rounded-full shadow-lg hover:bg-baseline-green-dark transition-all hover:scale-110 z-50 flex items-center justify-center group"
        >
          <Plus className="w-6 h-6" />
          <span className="absolute right-full mr-3 px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
            Record Match
          </span>
        </Link>
      )}
    </div>
  )
}
