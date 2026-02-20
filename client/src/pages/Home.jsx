import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, User, Trophy, Calendar, Award, ArrowRight, ChevronRight } from 'lucide-react'
import { membersAPI, tournamentsAPI, scheduleAPI, matchesAPI, rankingsAPI } from '../services/api'
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
  const [stats, setStats] = useState({ members: 0, topPlayer: 'N/A', upcomingMatches: 0, tournaments: 0 })
  const [recentMatches, setRecentMatches] = useState([])
  const [top3Players, setTop3Players] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [membersRes, tournamentsRes, matchesRes, rankingsRes] = await Promise.all([
          membersAPI.getAll(),
          tournamentsAPI.getAll(),
          matchesAPI.getAll(),
          rankingsAPI.getAll(),
        ])
        
        const members = membersRes.data || []
        const tournaments = tournamentsRes.data || []
        const matches = matchesRes.data || []
        const rankings = rankingsRes.data || []
        const topPlayer = rankings[0]?.full_name || members[0]?.full_name || 'N/A'
        const upcoming = tournaments.filter(t => t.status === 'Upcoming').length

        setStats({
          members: members.length,
          topPlayer,
          upcomingMatches: upcoming,
          tournaments: tournaments.length,
        })

        // Get top 3 players from aggregated tournament rankings
        const top3 = rankings
          .sort((a, b) => (b.total_points || 0) - (a.total_points || 0))
          .slice(0, 3)
        setTop3Players(top3)

        // Get 5 most recent finished matches
        const finishedMatches = matches
          .filter(m => m.status === 'Finished')
          .sort((a, b) => new Date(b.match_date) - new Date(a.match_date))
          .slice(0, 5)
        
        setRecentMatches(finishedMatches)
      } catch (error) {
        console.error('Failed to fetch home data:', error)
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
                <img src="/tspc.png" alt="TSPC Logo" className="w-full h-72 object-contain border-2 border-gray-100 rounded-3xl shadow-sm p-8 bg-white" />
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

      {/* Top 3 Players Podium */}
      {top3Players.length === 3 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Top <span className="text-baseline-green">Champions</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              As of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-end justify-center gap-2 sm:gap-4 md:gap-8">
            {/* 2nd Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2 sm:mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 sm:border-4 border-gray-300 overflow-hidden bg-gray-100">
                  {top3Players[1]?.profile_photo ? (
                    <img src={top3Players[1].profile_photo} alt={top3Players[1]?.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-gray-300 rounded-full flex items-center justify-center border-2 sm:border-4 border-white shadow-lg">
                  <span className="text-white font-bold text-sm sm:text-base md:text-lg">2</span>
                </div>
              </div>
              <div className="bg-gradient-to-b from-gray-200 to-gray-300 rounded-t-xl sm:rounded-t-2xl px-3 py-3 sm:px-6 sm:py-5 md:px-8 md:py-6 w-24 sm:w-32 md:w-40 text-center shadow-lg">
                <h3 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm truncate">{top3Players[1]?.full_name}</h3>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700">{top3Players[1]?.total_points || 0}</p>
                <p className="text-xs text-gray-600">Points</p>
              </div>
              <div className="h-20 sm:h-28 md:h-32 bg-gradient-to-b from-gray-300 to-gray-400 w-24 sm:w-32 md:w-40 rounded-b-lg"></div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center -mt-4 sm:-mt-6 md:-mt-8">
              <div className="relative mb-2 sm:mb-4">
                <div className="w-20 h-20 sm:w-26 sm:h-26 md:w-32 md:h-32 rounded-full border-2 sm:border-4 border-yellow-400 overflow-hidden bg-yellow-50 shadow-xl">
                  {top3Players[0]?.profile_photo ? (
                    <img src={top3Players[0].profile_photo} alt={top3Players[0]?.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-yellow-600" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center border-2 sm:border-4 border-white shadow-xl">
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                </div>
              </div>
              <div className="bg-gradient-to-b from-yellow-300 to-yellow-400 rounded-t-xl sm:rounded-t-2xl px-4 py-3 sm:px-6 sm:py-5 md:px-8 md:py-6 w-28 sm:w-36 md:w-48 text-center shadow-xl">
                <h3 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm md:text-base truncate">{top3Players[0]?.full_name}</h3>
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">{top3Players[0]?.total_points || 0}</p>
                <p className="text-xs text-gray-700">Points</p>
              </div>
              <div className="h-28 sm:h-40 md:h-48 bg-gradient-to-b from-yellow-400 to-yellow-500 w-28 sm:w-36 md:w-48 rounded-b-lg"></div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center">
              <div className="relative mb-2 sm:mb-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-full border-2 sm:border-4 border-orange-400 overflow-hidden bg-orange-50">
                  {top3Players[2]?.profile_photo ? (
                    <img src={top3Players[2].profile_photo} alt={top3Players[2]?.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 text-orange-400" />
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 sm:-bottom-2 left-1/2 transform -translate-x-1/2 w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-orange-400 rounded-full flex items-center justify-center border-2 sm:border-4 border-white shadow-lg">
                  <span className="text-white font-bold text-sm sm:text-base md:text-lg">3</span>
                </div>
              </div>
              <div className="bg-gradient-to-b from-orange-300 to-orange-400 rounded-t-xl sm:rounded-t-2xl px-3 py-3 sm:px-6 sm:py-5 md:px-8 md:py-6 w-24 sm:w-32 md:w-40 text-center shadow-lg">
                <h3 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm truncate">{top3Players[2]?.full_name}</h3>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-700">{top3Players[2]?.total_points || 0}</p>
                <p className="text-xs text-gray-600">Points</p>
              </div>
              <div className="h-16 sm:h-20 md:h-24 bg-gradient-to-b from-orange-400 to-orange-500 w-24 sm:w-32 md:w-40 rounded-b-lg"></div>
            </div>
          </div>
          <div className="text-center mt-6 sm:mt-8">
            <Link to="/rankings" className="inline-flex items-center text-baseline-green hover:text-baseline-green-dark font-medium text-sm sm:text-base">
              View Full Rankings <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>
        </section>
      )}

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
    </div>
  )
}
