import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Check for saved session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      setIsAdmin(userData.is_admin === true)
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password)
      const userData = response.data.user

      setUser(userData)
      setIsAdmin(userData.is_admin === true)
      localStorage.setItem('user', JSON.stringify(userData))

      return { success: true, user: userData }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed. Please try again.',
      }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    if (!user) {
      return { success: false, error: 'No user logged in' }
    }

    try {
      const response = await authAPI.changePassword(user.email, currentPassword, newPassword)
      return { success: true, message: response.data.message }
    } catch (error) {
      console.error('Change password error:', error)
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to change password',
      }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAdmin(false)
    localStorage.removeItem('user')
  }

  const updateUser = (userData) => {
    const updatedUser = { ...user, ...userData }
    setUser(updatedUser)
    setIsAdmin(updatedUser.is_admin === true)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout, changePassword, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
