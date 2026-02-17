import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { User, Mail, Lock, Shield, Edit2, Save, X, Image } from 'lucide-react'
import { membersAPI } from '../services/api'

export default function Profile() {
  const { user, changePassword, updateUser } = useAuth()
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    skill_level: '',
    age: '',
    gender: '',
    profile_photo: ''
  })
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [message, setMessage] = useState({ type: '', text: '' })
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name || '',
        skill_level: user.skill_level || '',
        age: user.age || '',
        gender: user.gender || '',
        profile_photo: user.profile_photo || ''
      })
    }
  }, [user])

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value })
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileMessage({ type: '', text: '' })
    setProfileLoading(true)

    try {
      const { data } = await membersAPI.update(user.id, profileForm)
      
      // Update the auth context with new user data
      updateUser(data)
      
      setProfileMessage({ type: 'success', text: 'Profile updated successfully!' })
      setIsEditingProfile(false)
    } catch (error) {
      setProfileMessage({ type: 'error', text: 'Failed to update profile. Please try again.' })
    } finally {
      setProfileLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    setProfileForm({
      full_name: user.full_name || '',
      skill_level: user.skill_level || '',
      age: user.age || '',
      gender: user.gender || '',
      profile_photo: user.profile_photo || ''
    })
    setProfileMessage({ type: '', text: '' })
  }

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })

    // Validation
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'New password must be at least 6 characters' })
      return
    }

    setLoading(true)

    try {
      const result = await changePassword(passwordForm.currentPassword, passwordForm.newPassword)

      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' })
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      } else {
        setMessage({ type: 'error', text: result.error })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to change password. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Profile Information */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
            {!isEditingProfile ? (
              <button
                onClick={() => setIsEditingProfile(true)}
                className="flex items-center gap-2 px-3 py-2 text-baseline-green hover:bg-baseline-green/10 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                <span className="text-sm font-medium">Edit</span>
              </button>
            ) : (
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-medium">Cancel</span>
              </button>
            )}
          </div>

          {profileMessage.text && (
            <div
              className={`mb-4 px-4 py-3 rounded-xl text-sm ${
                profileMessage.type === 'success'
                  ? 'bg-green-50 border border-green-100 text-green-700'
                  : 'bg-red-50 border border-red-100 text-red-700'
              }`}
            >
              {profileMessage.text}
            </div>
          )}

          {!isEditingProfile ? (
            <div className="space-y-4">
              {user.profile_photo && (
                <div className="flex justify-center mb-4">
                  <img
                    src={user.profile_photo}
                    alt={user.full_name}
                    className="w-24 h-24 rounded-full object-cover border-2 border-baseline-green/20"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  />
                </div>
              )}

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-baseline-green/10 rounded-lg flex items-center justify-center">
                  <User className="w-5 h-5 text-baseline-green" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="text-base font-medium text-gray-900">{user.full_name}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-baseline-green/10 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 h-5 text-baseline-green" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email Address</p>
                  <p className="text-base font-medium text-gray-900">{user.email}</p>
                </div>
              </div>

              {user.skill_level && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-baseline-green/10 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-baseline-green" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Skill Level</p>
                    <p className="text-base font-medium text-gray-900">{user.skill_level}</p>
                  </div>
                </div>
              )}

              {user.age && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-baseline-green/10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-baseline-green" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="text-base font-medium text-gray-900">{user.age}</p>
                  </div>
                </div>
              )}

              {user.gender && (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-baseline-green/10 rounded-lg flex items-center justify-center">
                    <User className="w-5 h-5 text-baseline-green" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Gender</p>
                    <p className="text-base font-medium text-gray-900">{user.gender}</p>
                  </div>
                </div>
              )}

              {user.is_admin && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Administrator
                  </p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Photo URL
                </label>
                <div className="relative">
                  <Image className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    name="profile_photo"
                    value={profileForm.profile_photo}
                    onChange={handleProfileChange}
                    placeholder="https://example.com/photo.jpg"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                  />
                </div>
                {profileForm.profile_photo && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={profileForm.profile_photo}
                      alt="Preview"
                      className="w-20 h-20 rounded-full object-cover border-2 border-baseline-green/20"
                      onError={(e) => {
                        e.target.style.display = 'none'
                      }}
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    name="full_name"
                    value={profileForm.full_name}
                    onChange={handleProfileChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Level
                </label>
                <select
                  name="skill_level"
                  value={profileForm.skill_level}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                >
                  <option value="">Select skill level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={profileForm.age}
                  onChange={handleProfileChange}
                  min="1"
                  max="120"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={profileForm.gender}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                >
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={profileLoading}
                className="w-full flex items-center justify-center gap-2 bg-baseline-green text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {profileLoading ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          )}
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {message.text && (
              <div
                className={`px-4 py-3 rounded-xl text-sm ${
                  message.type === 'success'
                    ? 'bg-green-50 border border-green-100 text-green-700'
                    : 'bg-red-50 border border-red-100 text-red-700'
                }`}
              >
                {message.text}
              </div>
            )}

            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordForm.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password (min. 6 characters)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordForm.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-baseline-green/20 focus:border-baseline-green transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-baseline-green text-white py-3 rounded-xl font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Changing Password...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
