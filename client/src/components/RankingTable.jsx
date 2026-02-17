import { Link } from 'react-router-dom'
import { User, Medal } from 'lucide-react'

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

export default function RankingTable({ players }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
        <div className="col-span-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Rank
        </div>
        <div className="col-span-5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Player
        </div>
        <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
          Wins
        </div>
        <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
          Losses
        </div>
        <div className="col-span-2 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
          Points
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-50">
        {players.map((player, index) => {
          const rank = index + 1
          const isTopThree = rank <= 3

          return (
            <Link
              key={player.id}
              to={`/members/${player.id}`}
              className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50 transition-colors cursor-pointer ${
                isTopThree ? rankBg[rank] || '' : ''
              }`}
            >
              {/* Rank */}
              <div className="col-span-2 sm:col-span-1">
                {isTopThree ? (
                  <div className="flex items-center">
                    <Medal className={`w-5 h-5 ${rankColors[rank]}`} />
                  </div>
                ) : (
                  <span className="text-lg font-bold text-gray-400">{rank}</span>
                )}
              </div>

              {/* Player */}
              <div className="col-span-7 sm:col-span-5 flex items-center space-x-3">
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
                  <p className="text-xs text-gray-500 sm:hidden">
                    W: {player.wins} / L: {player.losses}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden sm:block col-span-2 text-center font-medium text-gray-700">
                {player.wins || 0}
              </div>
              <div className="hidden sm:block col-span-2 text-center font-medium text-gray-700">
                {player.losses || 0}
              </div>
              <div className="col-span-3 sm:col-span-2 text-right sm:text-center">
                <span className="font-bold text-baseline-green text-lg">{player.points || 0}</span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
