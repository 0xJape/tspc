import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users, User, Trophy, Edit, Plus, ArrowLeft, CheckCircle, XCircle, Clock } from 'lucide-react'
import { tournamentsAPI, membersAPI, matchesAPI, rankingsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function TournamentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAdmin } = useAuth()
  const [tournament, setTournament] = useState(null)
  const [participants, setParticipants] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [matches, setMatches] = useState([])
  const [tournamentRankings, setTournamentRankings] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddMatch, setShowAddMatch] = useState(false)
  const [editingMatch, setEditingMatch] = useState(null)
  const [matchForm, setMatchForm] = useState({
    match_type: 'Singles',
    player1_id: '',
    team1_partner_id: '',
    player2_id: '',
    team2_partner_id: '',
    set1_team1_score: '',
    set1_team2_score: '',
    set2_team1_score: '',
    set2_team2_score: '',
    set3_team1_score: '',
    set3_team2_score: '',
    round: '',
  })
  const [userRegistrationStatus, setUserRegistrationStatus] = useState(null)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showAllParticipants, setShowAllParticipants] = useState(false)
  const [activeTab, setActiveTab] = useState('matches')

  useEffect(() => {
    fetchTournamentData()
    if (isAdmin) fetchMembers()
  }, [id])

  const fetchTournamentData = async () => {
    setLoading(true)
    try {
      // Fetch tournament first
      const tournamentRes = await tournamentsAPI.getById(id)
      console.log('Tournament data loaded:', tournamentRes.data)
      setTournament(tournamentRes.data)
      
      // Then fetch participants and matches (don't fail if these error)
      try {
        const approvedRes = await tournamentsAPI.getParticipants(id, 'approved')
        setParticipants(approvedRes.data || [])
      } catch (error) {
        console.error('Failed to fetch participants:', error)
        setParticipants([])
      }
      
      try {
        const matchesRes = await tournamentsAPI.getMatches(id)
        setMatches(matchesRes.data || [])
      } catch (error) {
        console.error('Failed to fetch matches:', error)
        setMatches([])
      }

      // Fetch tournament rankings
      try {
        const rankingsRes = await rankingsAPI.getAll({ tournament: id })
        setTournamentRankings(rankingsRes.data || [])
      } catch (error) {
        console.error('Failed to fetch tournament rankings:', error)
        setTournamentRankings([])
      }

      // Fetch pending requests if admin
      if (isAdmin) {
        try {
          const pendingRes = await tournamentsAPI.getParticipants(id, 'pending')
          setPendingRequests(pendingRes.data || [])
        } catch (error) {
          console.error('Failed to fetch pending requests:', error)
          setPendingRequests([])
        }
      }

      // Check user's registration status if logged in
      if (user && !isAdmin) {
        try {
          const allParticipants = await tournamentsAPI.getParticipants(id)
          const userParticipation = allParticipants.data.find(
            p => p.member?.email === user.email
          )
          setUserRegistrationStatus(userParticipation?.status || null)
        } catch (error) {
          console.error('Failed to check registration status:', error)
        }
      }
    } catch (error) {
      console.error('Failed to fetch tournament data:', error.response || error)
      setTournament(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchMembers = async () => {
    try {
      const res = await membersAPI.getAll()
      setMembers(res.data)
    } catch (error) {
      console.error('Failed to fetch members:', error)
    }
  }

  // Helper function to check if exact team matchup has occurred before
  // For Mixed Doubles: Same 2 players cannot face the same 2 opposing players again
  const teamMatchupExists = (team1Player1, team1Player2, team2Player1, team2Player2) => {
    if (!team1Player1 || !team2Player1) return false
    
    return matches.some(match => {
      // For singles, check if these two players have faced each other
      if (!team1Player2 && !team2Player2) {
        return (match.player1_id === team1Player1 && match.player2_id === team2Player1) ||
               (match.player1_id === team2Player1 && match.player2_id === team1Player1)
      }
      
      // For doubles, check if the exact same 4 players with same team composition have played
      if (!match.team1_partner_id || !match.team2_partner_id) return false
      
      const team1Match = [team1Player1, team1Player2].filter(Boolean).sort()
      const team2Match = [team2Player1, team2Player2].filter(Boolean).sort()
      
      const matchTeam1 = [match.player1_id, match.team1_partner_id].filter(Boolean).sort()
      const matchTeam2 = [match.player2_id, match.team2_partner_id].filter(Boolean).sort()
      
      // Check if the exact same team composition exists (in either direction)
      const forwardMatch = team1Match.length === 2 && team2Match.length === 2 &&
                          team1Match[0] === matchTeam1[0] && team1Match[1] === matchTeam1[1] &&
                          team2Match[0] === matchTeam2[0] && team2Match[1] === matchTeam2[1]
      const reverseMatch = team1Match.length === 2 && team2Match.length === 2 &&
                          team1Match[0] === matchTeam2[0] && team1Match[1] === matchTeam2[1] &&
                          team2Match[0] === matchTeam1[0] && team2Match[1] === matchTeam1[1]
      
      return forwardMatch || reverseMatch
    })
  }

  const handleCreateMatch = async (e) => {
    e.preventDefault()
    try {
      if (editingMatch) {
        // Update existing match - only send score fields with proper data types
        const scoreData = {
          set1_team1_score: parseInt(matchForm.set1_team1_score) || 0,
          set1_team2_score: parseInt(matchForm.set1_team2_score) || 0,
          set2_team1_score: parseInt(matchForm.set2_team1_score) || 0,
          set2_team2_score: parseInt(matchForm.set2_team2_score) || 0,
          set3_team1_score: matchForm.set3_team1_score ? parseInt(matchForm.set3_team1_score) : null,
          set3_team2_score: matchForm.set3_team2_score ? parseInt(matchForm.set3_team2_score) : null,
          round: matchForm.round || null,
          status: 'Finished'
        }
        await matchesAPI.updateScore(editingMatch, scoreData)
        setEditingMatch(null)
      } else {
        // Create new match
        await tournamentsAPI.createMatch(id, matchForm)
      }
      setShowAddMatch(false)
      setMatchForm({ 
        match_type: 'Singles',
        player1_id: '', 
        team1_partner_id: '',
        player2_id: '', 
        team2_partner_id: '',
        set1_team1_score: '',
        set1_team2_score: '',
        set2_team1_score: '',
        set2_team2_score: '',
        set3_team1_score: '',
        set3_team2_score: '',
        round: '' 
      })
      fetchTournamentData()
    } catch (error) {
      alert(`Failed to ${editingMatch ? 'update' : 'create'} match: ` + (error.response?.data?.error || error.message))
    }
  }

  const handleEditMatch = (match) => {
    setEditingMatch(match.id)
    setMatchForm({
      match_type: match.match_type || 'Singles',
      player1_id: match.player1_id || '',
      team1_partner_id: match.team1_partner_id || '',
      player2_id: match.player2_id || '',
      team2_partner_id: match.team2_partner_id || '',
      set1_team1_score: match.set1_team1_score ?? '',
      set1_team2_score: match.set1_team2_score ?? '',
      set2_team1_score: match.set2_team1_score ?? '',
      set2_team2_score: match.set2_team2_score ?? '',
      set3_team1_score: match.set3_team1_score ?? '',
      set3_team2_score: match.set3_team2_score ?? '',
      round: match.round || ''
    })
    setShowAddMatch(true)
  }

  const handleRequestRegistration = async () => {
    if (!user) {
      setShowLoginModal(true)
      return
    }

    try {
      // Get current user's member ID from members table
      const membersRes = await membersAPI.getAll()
      const currentMember = membersRes.data.find(m => m.email === user.email)
      
      if (!currentMember) {
        alert('You must be a registered member to join tournaments. Please contact admin.')
        return
      }

      await tournamentsAPI.register(id, currentMember.id)
      alert('Registration request submitted! Waiting for admin approval.')
      fetchTournamentData()
    } catch (error) {
      alert('Failed to request registration: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleApproveRequest = async (participantId) => {
    try {
      await tournamentsAPI.approveParticipant(id, participantId)
      alert('Participant approved!')
      fetchTournamentData()
    } catch (error) {
      alert('Failed to approve: ' + (error.response?.data?.error || error.message))
    }
  }

  const handleRejectRequest = async (participantId) => {
    if (!confirm('Are you sure you want to reject this registration?')) return
    
    try {
      await tournamentsAPI.rejectParticipant(id, participantId)
      alert('Participant rejected')
      fetchTournamentData()
    } catch (error) {
      alert('Failed to reject: ' + (error.response?.data?.error || error.message))
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tournament Not Found</h2>
          <p className="text-gray-600 mb-6">
            The tournament you're looking for doesn't exist or couldn't be loaded.
          </p>
          
          <Link
            to="/tournaments"
            className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tournaments
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Link
        to="/tournaments"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Tournaments
      </Link>

      {/* Tournament Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{tournament.name}</h1>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                {tournament.category}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                {tournament.skill_level}
              </span>
              <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                tournament.status === 'Upcoming' ? 'bg-blue-100 text-blue-700' :
                tournament.status === 'Ongoing' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {tournament.status}
              </span>
            </div>
          </div>
          {isAdmin && (
            <Link
              to={`/tournaments/edit/${id}`}
              className="inline-flex items-center px-4 py-2 bg-baseline-green text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Tournament
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="w-5 h-5 mr-2 text-gray-400" />
            {new Date(tournament.date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </div>
          {tournament.location && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-5 h-5 mr-2 text-gray-400" />
              {tournament.location}
            </div>
          )}
          {tournament.max_participants && (
            <div className="flex items-center text-gray-600">
              <Users className="w-5 h-5 mr-2 text-gray-400" />
              {participants.length} / {tournament.max_participants} participants
            </div>
          )}
        </div>

        {tournament.description && (
          <p className="mt-4 text-gray-600">{tournament.description}</p>
        )}

        {/* Registration Button for non-admin users */}
        {!isAdmin && user && tournament.status === 'Upcoming' && (
          <div className="mt-4">
            {userRegistrationStatus === 'pending' ? (
              <div className="flex items-center px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-700">
                <Clock className="w-5 h-5 mr-2" />
                <span>Registration pending admin approval</span>
              </div>
            ) : userRegistrationStatus === 'approved' ? (
              <div className="flex items-center px-4 py-2 bg-green-50 border border-green-200 rounded-lg text-green-700">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span>You are registered for this tournament</span>
              </div>
            ) : userRegistrationStatus === 'rejected' ? (
              <div className="flex items-center px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <XCircle className="w-5 h-5 mr-2" />
                <span>Your registration was not approved</span>
              </div>
            ) : (
              <button
                onClick={handleRequestRegistration}
                className="px-4 py-2 bg-baseline-green text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
              >
                Request to Register
              </button>
            )}
          </div>
        )}

        {!isAdmin && !user && tournament.status === 'Upcoming' && (
          <div className="mt-4">
            <button
              onClick={() => setShowLoginModal(true)}
              className="px-4 py-2 bg-baseline-green text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer"
            >
              Login to Register
            </button>
          </div>
        )}
      </div>

      {/* Pending Requests Section (Admin Only) */}
      {isAdmin && pendingRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-yellow-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-4">
            <Clock className="w-5 h-5 mr-2 text-yellow-600" />
            Pending Registration Requests ({pendingRequests.length})
          </h2>
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {request.member?.full_name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{request.member?.full_name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">{request.member?.skill_level || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveRequest(request.id)}
                    className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    title="Approve"
                  >
                    <CheckCircle className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    title="Reject"
                  >
                    <XCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('matches')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'matches'
                ? 'text-baseline-green border-b-2 border-baseline-green'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Matches
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'leaderboard'
                ? 'text-baseline-green border-b-2 border-baseline-green'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Trophy className="w-4 h-4 inline mr-2" />
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
              activeTab === 'participants'
                ? 'text-baseline-green border-b-2 border-baseline-green'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Participants ({participants.length})
          </button>
        </div>
      </div>

      {/* Matches Tab */}
      {activeTab === 'matches' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-baseline-green" />
              Match History
            </h2>
            {isAdmin && (
              <button
                onClick={() => {
                  setEditingMatch(null)
                  // Automatically set match type based on tournament category
                  const matchType = tournament?.category === 'Singles' ? 'Singles' : 'Doubles'
                  setMatchForm({
                    match_type: matchType,
                    player1_id: '',
                    team1_partner_id: '',
                    player2_id: '',
                    team2_partner_id: '',
                    set1_team1_score: '',
                    set1_team2_score: '',
                    set2_team1_score: '',
                    set2_team2_score: '',
                    set3_team1_score: '',
                    set3_team2_score: '',
                    round: ''
                  })
                  setShowAddMatch(true)
                }}
                className="inline-flex items-center px-4 py-2 bg-baseline-green text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                Record Match
              </button>
            )}
          </div>

          {/* Matches List */}
          {matches.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No matches scheduled yet</p>
          ) : (
            <div className="space-y-3">
              {matches.map((match) => {
                // Calculate sets won for display
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
                  <div key={match.id} className="p-4 bg-gray-50 rounded-lg">
                    <div>
                      {/* Match Type Badge */}
                      {match.match_type && (
                        <div className="mb-2">
                          <span className="inline-block px-2 py-0.5 bg-baseline-green/10 text-baseline-green text-xs font-medium rounded">
                            {match.match_type}
                          </span>
                        </div>
                      )}
                      
                      {/* Teams Display */}
                      <div className="flex justify-between items-start mb-3">
                        {/* Team 1 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {match.player1?.profile_photo ? (
                                <img src={match.player1.profile_photo} alt={match.player1?.full_name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <p className="font-medium text-gray-900">{match.player1?.full_name || 'TBD'}</p>
                          </div>
                          {match.team1_partner && (
                            <div className="flex items-center gap-2 ml-10">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {match.team1_partner?.profile_photo ? (
                                  <img src={match.team1_partner.profile_photo} alt={match.team1_partner?.full_name} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                              <p className="text-sm text-gray-600">& {match.team1_partner.full_name}</p>
                            </div>
                          )}
                          <p className="text-xl font-bold text-baseline-green mt-1">{team1Sets} sets</p>
                        </div>
                        
                        <div className="text-gray-400 font-medium px-4">VS</div>
                        
                        {/* Team 2 */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 justify-end">
                            <p className="font-medium text-gray-900">{match.player2?.full_name || 'TBD'}</p>
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {match.player2?.profile_photo ? (
                                <img src={match.player2.profile_photo} alt={match.player2?.full_name} className="w-full h-full object-cover" />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                          {match.team2_partner && (
                            <div className="flex items-center gap-2 mr-10 justify-end">
                              <p className="text-sm text-gray-600">& {match.team2_partner.full_name}</p>
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                                {match.team2_partner?.profile_photo ? (
                                  <img src={match.team2_partner.profile_photo} alt={match.team2_partner?.full_name} className="w-full h-full object-cover" />
                                ) : (
                                  <User className="w-3 h-3 text-gray-400" />
                                )}
                              </div>
                            </div>
                          )}
                          <p className="text-xl font-bold text-baseline-green mt-1 text-right">{team2Sets} sets</p>
                        </div>
                      </div>

                      {/* Set Scores Display */}
                      <div className="flex gap-3 text-sm flex-wrap">
                        {match.set1_team1_score !== null && match.set1_team2_score !== null && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Set 1:</span>
                            <span className={`font-medium ${match.set1_team1_score > match.set1_team2_score ? 'text-baseline-green' : 'text-gray-700'}`}>
                              {match.set1_team1_score}
                            </span>
                            <span className="text-gray-400">-</span>
                            <span className={`font-medium ${match.set1_team2_score > match.set1_team1_score ? 'text-baseline-green' : 'text-gray-700'}`}>
                              {match.set1_team2_score}
                            </span>
                          </div>
                        )}
                        {match.set2_team1_score !== null && match.set2_team2_score !== null && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Set 2:</span>
                            <span className={`font-medium ${match.set2_team1_score > match.set2_team2_score ? 'text-baseline-green' : 'text-gray-700'}`}>
                              {match.set2_team1_score}
                            </span>
                            <span className="text-gray-400">-</span>
                            <span className={`font-medium ${match.set2_team2_score > match.set2_team1_score ? 'text-baseline-green' : 'text-gray-700'}`}>
                              {match.set2_team2_score}
                            </span>
                          </div>
                        )}
                        {match.set3_team1_score !== null && match.set3_team2_score !== null && (
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">Set 3:</span>
                            <span className={`font-medium ${match.set3_team1_score > match.set3_team2_score ? 'text-baseline-green' : 'text-gray-700'}`}>
                              {match.set3_team1_score}
                            </span>
                            <span className="text-gray-400">-</span>
                            <span className={`font-medium ${match.set3_team2_score > match.set3_team1_score ? 'text-baseline-green' : 'text-gray-700'}`}>
                              {match.set3_team2_score}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Round and Edit Button */}
                      <div className="flex justify-between items-center mt-2">
                        {match.round && (
                          <span className="text-xs text-gray-500 font-medium">{match.round}</span>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleEditMatch(match)}
                            className="ml-auto p-1.5 text-gray-400 hover:text-baseline-green transition-colors"
                            title="Edit match"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Status Badge */}
                      {match.status && (
                        <div className="mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded ${
                            match.status === 'Finished' ? 'bg-green-100 text-green-700' :
                            match.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {match.status}
                          </span>
                        </div>
                      )}

                      {/* Winner Display */}
                      {match.winner && (
                        <p className="mt-2 text-sm text-gray-600">
                          Winner: <span className="font-medium text-baseline-green">{match.winner.full_name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Add Match Modal */}
      {isAdmin && showAddMatch && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => { setShowAddMatch(false); setEditingMatch(null); }}>
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">{editingMatch ? 'Edit Match' : 'Record New Match'}</h3>
              <button
                type="button"
                onClick={() => { setShowAddMatch(false); setEditingMatch(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateMatch} className="p-6 space-y-4">
              {editingMatch && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <strong>Note:</strong> When editing a match, you can only update scores and round. Players cannot be changed.
                </div>
              )}
              
              {!editingMatch && matchForm.match_type === 'Doubles' && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <strong>Mixed Doubles Rule:</strong> Players can change partners and team up again. However, the same two players cannot face the exact same opposing pair more than once.
                </div>
              )}
              
              {/* Match Type Display - Auto-determined by tournament category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Match Type</label>
                <div className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600">
                  {tournament?.category === 'Singles' ? 'Singles (1 vs 1)' : 
                   tournament?.category === 'Doubles' ? 'Doubles (2 vs 2)' : 
                   tournament?.category === 'Mixed Doubles' ? 'Mixed Doubles (2 vs 2)' : 'Doubles (2 vs 2)'}
                  <span className="text-xs text-gray-500 ml-2">(determined by tournament type)</span>
                </div>
              </div>

              {/* Team 1 */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Team 1</h4>
                <div className="space-y-2">
                  <select
                    value={matchForm.player1_id}
                    onChange={(e) => setMatchForm({ ...matchForm, player1_id: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${
                      editingMatch ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    required
                    disabled={editingMatch}
                  >
                    <option value="">Select Player 1 *</option>
                    {participants.filter(p => p.status === 'approved').map((p) => (
                      <option key={p.member?.id} value={p.member?.id}>
                        {p.member?.full_name}
                      </option>
                    ))}
                  </select>
                  {matchForm.match_type === 'Doubles' && (
                    <select
                      value={matchForm.team1_partner_id}
                      onChange={(e) => setMatchForm({ ...matchForm, team1_partner_id: e.target.value })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${
                        editingMatch ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                      disabled={editingMatch}
                    >
                      <option value="">Select Partner *</option>
                      {participants.filter(p => 
                        p.status === 'approved' && 
                        p.member?.id !== matchForm.player1_id
                      ).map((p) => (
                        <option key={p.member?.id} value={p.member?.id}>
                          {p.member?.full_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Team 2 */}
              <div className="bg-white rounded-lg p-3 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Team 2</h4>
                <div className="space-y-2">
                  <select
                    value={matchForm.player2_id}
                    onChange={(e) => setMatchForm({ ...matchForm, player2_id: e.target.value })}
                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${
                      editingMatch ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    required
                    disabled={editingMatch}
                  >
                    <option value="">Select Player 1 *</option>
                    {participants.filter(p => {
                      if (p.status !== 'approved') return false
                      if (p.member?.id === matchForm.player1_id || p.member?.id === matchForm.team1_partner_id) return false
                      
                      // Check if this team matchup already exists
                      if (teamMatchupExists(
                        matchForm.player1_id, 
                        matchForm.team1_partner_id, 
                        p.member?.id, 
                        matchForm.team2_partner_id
                      )) return false
                      
                      return true
                    }).map((p) => (
                      <option key={p.member?.id} value={p.member?.id}>
                        {p.member?.full_name}
                      </option>
                    ))}
                  </select>
                  {matchForm.match_type === 'Doubles' && (
                    <select
                      value={matchForm.team2_partner_id}
                      onChange={(e) => setMatchForm({ ...matchForm, team2_partner_id: e.target.value })}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm ${
                        editingMatch ? 'bg-gray-100 cursor-not-allowed' : ''
                      }`}
                      required
                      disabled={editingMatch}
                    >
                      <option value="">Select Partner *</option>
                      {participants.filter(p => {
                        if (p.status !== 'approved') return false
                        if (p.member?.id === matchForm.player1_id || 
                            p.member?.id === matchForm.team1_partner_id || 
                            p.member?.id === matchForm.player2_id) return false
                        
                        // Check if this exact team matchup already exists
                        if (teamMatchupExists(
                          matchForm.player1_id, 
                          matchForm.team1_partner_id, 
                          matchForm.player2_id, 
                          p.member?.id
                        )) return false
                        
                        return true
                      }).map((p) => (
                        <option key={p.member?.id} value={p.member?.id}>
                          {p.member?.full_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Set Scores */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Set Scores (Best of 3)</label>
                <div className="space-y-2">
                  {/* Set 1 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 w-12">Set 1:</span>
                    <input
                      type="number"
                      placeholder="Team 1"
                      value={matchForm.set1_team1_score}
                      onChange={(e) => setMatchForm({ ...matchForm, set1_team1_score: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      max="30"
                      required
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Team 2"
                      value={matchForm.set1_team2_score}
                      onChange={(e) => setMatchForm({ ...matchForm, set1_team2_score: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      max="30"
                      required
                    />
                  </div>
                  {/* Set 2 */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 w-12">Set 2:</span>
                    <input
                      type="number"
                      placeholder="Team 1"
                      value={matchForm.set2_team1_score}
                      onChange={(e) => setMatchForm({ ...matchForm, set2_team1_score: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      max="30"
                      required
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Team 2"
                      value={matchForm.set2_team2_score}
                      onChange={(e) => setMatchForm({ ...matchForm, set2_team2_score: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      max="30"
                      required
                    />
                  </div>
                  {/* Set 3 (Optional) */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-600 w-12">Set 3:</span>
                    <input
                      type="number"
                      placeholder="Team 1 (optional)"
                      value={matchForm.set3_team1_score}
                      onChange={(e) => setMatchForm({ ...matchForm, set3_team1_score: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      max="30"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="number"
                      placeholder="Team 2 (optional)"
                      value={matchForm.set3_team2_score}
                      onChange={(e) => setMatchForm({ ...matchForm, set3_team2_score: e.target.value })}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      min="0"
                      max="30"
                    />
                  </div>
                </div>
              </div>

              {/* Round */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Round (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., QF, SF, Final"
                  value={matchForm.round}
                  onChange={(e) => setMatchForm({ ...matchForm, round: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-baseline-green text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  {editingMatch ? 'Update Match' : 'Create Match'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddMatch(false); setEditingMatch(null); }}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
            <Trophy className="w-5 h-5 mr-2 text-baseline-green" />
            Tournament Leaderboard
          </h2>
          
          {tournamentRankings.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No tournament rankings available yet</p>
          ) : (
            <div className="space-y-2">
              {tournamentRankings.map((player, index) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-4 rounded-lg transition-all ${
                    index === 0 ? 'bg-yellow-50 border-2 border-yellow-400 shadow-md' :
                    index === 1 ? 'bg-gray-100 border-2 border-gray-400' :
                    index === 2 ? 'bg-orange-50 border-2 border-orange-400' :
                    'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                      index === 0 ? 'bg-yellow-400 text-white shadow-lg' :
                      index === 1 ? 'bg-gray-400 text-white shadow' :
                      index === 2 ? 'bg-orange-400 text-white shadow' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {player.rank_position || index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                      {player.profile_photo ? (
                        <img src={player.profile_photo} alt={player.full_name} className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-6 h-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-lg">{player.full_name}</p>
                      <p className="text-sm text-gray-600">{player.wins || 0}W - {player.losses || 0}L</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-baseline-green">{player.points || 0}</p>
                    <p className="text-xs text-gray-500 font-medium">points</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Participants Tab */}
      {activeTab === 'participants' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center mb-6">
            <Users className="w-5 h-5 mr-2 text-baseline-green" />
            Registered Participants ({participants.length})
          </h2>

          {participants.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No participants registered yet</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {(showAllParticipants ? participants : participants.slice(0, 6)).map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-baseline-green to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
                      {participant.member?.full_name?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{participant.member?.full_name || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">{participant.member?.skill_level || 'N/A'}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              {participants.length > 6 && (
                <button
                  onClick={() => setShowAllParticipants(!showAllParticipants)}
                  className="w-full mt-4 px-4 py-3 text-sm font-medium text-baseline-green hover:bg-green-50 border-2 border-gray-200 rounded-lg transition-colors"
                >
                  {showAllParticipants ? '▲ Show Less' : `▼ Show All ${participants.length} Participants`}
                </button>
              )}
            </>
          )}
        </div>
      )}

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
            <p className="text-gray-600 mb-6">
              You need to be logged in to register for tournaments. Please sign in to continue.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLoginModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginModal(false)
                  navigate('/login')
                }}
                className="flex-1 px-4 py-2 bg-baseline-green text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
