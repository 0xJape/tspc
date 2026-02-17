import { Link } from 'react-router-dom'
import { User } from 'lucide-react'

export default function MemberCard({ member }) {
  return (
    <Link
      to={`/members/${member.id}`}
      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-5"
    >
      {/* Player Info */}
      <div className="flex items-center space-x-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-full bg-gray-100 border-2 border-gray-50 flex items-center justify-center overflow-hidden flex-shrink-0">
          {member.profile_photo ? (
            <img
              src={member.profile_photo}
              alt={member.full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-7 h-7 text-gray-400" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{member.full_name}</h3>
          <p className="text-sm text-gray-500">{member.skill_level}</p>
        </div>

        {/* Rank Badge */}
        {member.ranking_position && (
          <div className="bg-baseline-green text-white w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
            #{member.ranking_position}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between text-sm">
        <div className="text-center">
          <p className="font-semibold text-gray-900">{member.wins || 0}</p>
          <p className="text-gray-400 text-xs">Wins</p>
        </div>
        <div className="text-center">
          <p className="font-semibold text-gray-900">{member.losses || 0}</p>
          <p className="text-gray-400 text-xs">Losses</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-baseline-green">{member.points || 0}</p>
          <p className="text-gray-400 text-xs">Points</p>
        </div>
      </div>
    </Link>
  )
}
