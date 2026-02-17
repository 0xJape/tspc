import { Calendar, Clock, MapPin } from 'lucide-react'

const statusStyles = {
  Upcoming: 'bg-blue-100 text-blue-700',
  Ongoing: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
}

const typeStyles = {
  Training: 'bg-purple-100 text-purple-700',
  Match: 'bg-baseline-green-light text-baseline-green-dark',
  Tournament: 'bg-orange-100 text-orange-700',
}

export default function ScheduleCard({ event }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200">
      {/* Top Row: Title + Badges */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0 mr-3">
          <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${typeStyles[event.type] || 'bg-gray-100 text-gray-600'}`}>
            {event.type}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusStyles[event.status] || 'bg-gray-100 text-gray-600'}`}>
            {event.status}
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="space-y-2 text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 flex-shrink-0" />
          <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 flex-shrink-0" />
          <span>{event.time}</span>
        </div>
        {event.location && (
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{event.location}</span>
          </div>
        )}
      </div>

      {/* Description */}
      {event.description && (
        <p className="mt-3 pt-3 border-t border-gray-50 text-sm text-gray-500 line-clamp-2">
          {event.description}
        </p>
      )}
    </div>
  )
}
