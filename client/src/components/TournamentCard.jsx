import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Calendar, MapPin, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const statusStyles = {
  Upcoming: 'bg-blue-100 text-blue-700',
  Ongoing: 'bg-yellow-100 text-yellow-700',
  Finished: 'bg-green-100 text-green-700',
}

export default function TournamentCard({ tournament }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  const isRegistrationOpen =
    tournament.status === 'Upcoming' &&
    tournament.registration_deadline &&
    new Date(tournament.registration_deadline) > new Date()

  const handleRegisterClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      setShowLoginModal(true)
    } else {
      // Navigate to tournament detail page where they can register
      navigate(`/tournaments/${tournament.id}`)
    }
  }

  return (
    <>
      <Link
        to={`/tournaments/${tournament.id}`}
        className="block bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-baseline-green/30 transition-all duration-200 relative"
      >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 truncate">
            {tournament.name}
          </h3>
          <div className="space-y-1.5">
            <p className="text-sm text-gray-500 flex items-center">
              <Calendar className="w-4 h-4 mr-2 flex-shrink-0" />
              {new Date(tournament.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
            {tournament.location && (
              <p className="text-sm text-gray-500 flex items-center">
                <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                {tournament.location}
              </p>
            )}
          </div>
        </div>

        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
            statusStyles[tournament.status] || 'bg-gray-100 text-gray-600'
          }`}
        >
          {tournament.status}
        </span>
      </div>

      {/* Category & Level Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {tournament.category && (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            {tournament.category}
          </span>
        )}
        {tournament.skill_level && (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
            {tournament.skill_level}
          </span>
        )}
        {tournament.max_participants && (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium flex items-center">
            <Users className="w-3.5 h-3.5 mr-1" />
            {tournament.max_participants} slots
          </span>
        )}
      </div>

      {/* Registration Deadline */}
      {tournament.registration_deadline && (
        <p className="text-xs text-gray-400 mb-4">
          Registration deadline:{' '}
          {new Date(tournament.registration_deadline).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}

      {/* Description */}
      {tournament.description && (
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{tournament.description}</p>
      )}

      {/* Action Buttons */}
      {isRegistrationOpen ? (
        <div className="flex gap-2">
          <div className="flex-1 text-sm text-gray-600 font-medium text-center py-2">
            Click to View Details
          </div>
          <button
            onClick={handleRegisterClick}
            className="px-4 py-2 bg-baseline-green text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
          >
            Register
          </button>
        </div>
      ) : (
        <div className="text-sm text-baseline-green font-medium text-center">
          View Details →
        </div>
      )}
    </Link>

    {/* Login Modal */}
    {showLoginModal && (
      <div 
        className="fixed inset-0 flex items-center justify-center z-[9999]"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onClick={() => setShowLoginModal(false)}
      >
        <div 
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-6">
            Please login to register for this tournament.
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
    </>
  )
}
