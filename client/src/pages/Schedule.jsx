import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import ScheduleCard from '../components/ScheduleCard'
import { scheduleAPI } from '../services/api'

// Demo data
const demoSchedule = [
  { id: '1', title: 'Weekly Training Session', type: 'Training', date: '2026-02-20', time: '18:00', location: 'Club Court A', description: 'Regular training session for all skill levels. Drills and practice matches.', status: 'Upcoming' },
  { id: '2', title: 'Practice Match Day', type: 'Match', date: '2026-02-22', time: '15:00', location: 'Club Court B', description: 'Friendly match day open to all members.', status: 'Upcoming' },
  { id: '3', title: 'Beginner Workshop', type: 'Training', date: '2026-02-25', time: '10:00', location: 'Club Court A', description: 'Introduction to pickleball for new players.', status: 'Upcoming' },
  { id: '4', title: 'Advanced Drills', type: 'Training', date: '2026-02-27', time: '17:00', location: 'Club Court C', description: 'Intensive drills for advanced players. Focus on serve and volley.', status: 'Upcoming' },
  { id: '5', title: 'Club Championship Qualifier', type: 'Tournament', date: '2026-03-01', time: '09:00', location: 'Main Arena', description: 'Qualifying rounds for the annual club championship.', status: 'Upcoming' },
  { id: '6', title: 'Morning Training', type: 'Training', date: '2026-02-15', time: '07:00', location: 'Club Court A', description: 'Early morning session completed.', status: 'Completed' },
]

const statusFilters = ['All', 'Upcoming', 'Ongoing', 'Completed']

export default function Schedule() {
  const [events, setEvents] = useState([])
  const [filtered, setFiltered] = useState([])
  const [statusFilter, setStatusFilter] = useState('Upcoming')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const res = await scheduleAPI.getAll()
        setEvents(res.data || [])
        setFiltered(res.data || [])
      } catch (error) {
        console.error('Failed to fetch schedule:', error)
        setEvents([])
        setFiltered([])
      } finally {
        setLoading(false)
      }
    }
    fetchSchedule()
  }, [])

  useEffect(() => {
    if (statusFilter === 'All') {
      setFiltered(events)
    } else {
      setFiltered(events.filter(e => e.status === statusFilter))
    }
  }, [statusFilter, events])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Schedule</h1>
        <p className="text-gray-500">Upcoming training sessions, matches, and events</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-6">
        <CalendarIcon className="w-4 h-4 text-gray-400" />
        <div className="flex gap-1">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-baseline-green text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-400 mb-4">{filtered.length} events</p>

      {/* Schedule List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((event) => (
            <ScheduleCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <CalendarIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400">No events found.</p>
        </div>
      )}
    </div>
  )
}
