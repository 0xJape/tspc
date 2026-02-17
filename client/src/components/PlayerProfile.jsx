import { User, ArrowLeft, Trophy, TrendingUp, Calendar } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function PlayerProfile({ member }) {
  const winRate = member.wins + member.losses > 0
    ? Math.round((member.wins / (member.wins + member.losses)) * 100)
    : 0

  return (
    <div>
      {/* Back Button */}
      <Link
        to="/members"
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Members
      </Link>

      {/* Profile Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gray-100 border-4 border-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
            {member.profile_photo ? (
              <img
                src={member.profile_photo}
                alt={member.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>

          {/* Info */}
          <div className="text-center sm:text-left flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">{member.full_name}</h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-3">
              <span className="px-3 py-1 bg-baseline-green-light text-baseline-green-dark rounded-full text-sm font-medium">
                {member.skill_level}
              </span>
              {member.ranking_position && (
                <span className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                  Rank #{member.ranking_position}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-500 space-y-1">
              {member.age && (
                <p>Age: {member.age}</p>
              )}
              {member.gender && (
                <p>Gender: {member.gender}</p>
              )}
            </div>
            <p className="text-sm text-gray-400 flex items-center justify-center sm:justify-start mt-1">
              <Calendar className="w-3.5 h-3.5 mr-1" />
              Joined {new Date(member.date_joined).toLocaleDateString('en-US', {
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <Trophy className="w-5 h-5 text-baseline-green mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{member.wins || 0}</p>
          <p className="text-xs text-gray-500">Wins</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <TrendingUp className="w-5 h-5 text-red-400 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{member.losses || 0}</p>
          <p className="text-xs text-gray-500">Losses</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <div className="w-5 h-5 mx-auto mb-2 text-baseline-green font-bold text-sm flex items-center justify-center">
            %
          </div>
          <p className="text-2xl font-bold text-gray-900">{winRate}%</p>
          <p className="text-xs text-gray-500">Win Rate</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 text-center">
          <div className="w-5 h-5 mx-auto mb-2 text-yellow-500 font-bold text-sm flex items-center justify-center">
            ★
          </div>
          <p className="text-2xl font-bold text-baseline-green">{member.points || 0}</p>
          <p className="text-xs text-gray-500">Points</p>
        </div>
      </div>
    </div>
  )
}
