import { Link } from 'react-router-dom'
import { Users, Trophy, Calendar, BarChart3, Plus, Settings } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: 'Total Members', value: '128', icon: Users, color: 'bg-blue-500', link: '/admin/members' },
    { label: 'Active Tournaments', value: '2', icon: Trophy, color: 'bg-yellow-500', link: '/admin/tournaments' },
    { label: 'Scheduled Events', value: '8', icon: Calendar, color: 'bg-green-500', link: '/admin/schedule' },
    { label: 'Matches Recorded', value: '45', icon: BarChart3, color: 'bg-purple-500', link: '/admin/matches' },
  ]

  const quickActions = [
    { label: 'Add Member', icon: Users, link: '/admin/members/new', color: 'bg-blue-500' },
    { label: 'Create Tournament', icon: Trophy, link: '/admin/tournaments/new', color: 'bg-yellow-500' },
    { label: 'Schedule Event', icon: Calendar, link: '/admin/schedule/new', color: 'bg-green-500' },
    { label: 'Record Match', icon: Plus, link: '/admin/matches/record', color: 'bg-purple-500' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              to={stat.link}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-baseline-green" />
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.label}
                to={action.link}
                className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 rounded-xl hover:border-baseline-green hover:bg-baseline-green-light/20 transition-all group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700 text-center">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Management Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Member Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2 text-blue-500" />
              Member Management
            </h2>
            <div className="space-y-3">
              <Link to="/admin/members" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <p className="font-medium text-gray-900">View All Members</p>
                <p className="text-sm text-gray-500">Edit, delete, or update player stats</p>
              </Link>
              <Link to="/admin/members/new" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <p className="font-medium text-gray-900">Add New Member</p>
                <p className="text-sm text-gray-500">Register a new player</p>
              </Link>
            </div>
          </div>

          {/* Tournament Management */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-yellow-500" />
              Tournament Management
            </h2>
            <div className="space-y-3">
              <Link to="/admin/tournaments" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <p className="font-medium text-gray-900">View All Tournaments</p>
                <p className="text-sm text-gray-500">Edit details and manage participants</p>
              </Link>
              <Link to="/admin/tournaments/new" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <p className="font-medium text-gray-900">Create Tournament</p>
                <p className="text-sm text-gray-500">Set up a new tournament</p>
              </Link>
              <Link to="/admin/matches/new" className="block p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                <p className="font-medium text-gray-900">Record Match Results</p>
                <p className="text-sm text-gray-500">Update scores and standings</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
