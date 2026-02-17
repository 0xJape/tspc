import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Members API
export const membersAPI = {
  getAll: () => api.get('/members'),
  getById: (id) => api.get(`/members/${id}`),
  create: (data) => api.post('/members', data),
  update: (id, data) => api.put(`/members/${id}`, data),
  delete: (id) => api.delete(`/members/${id}`),
}

// Rankings API
export const rankingsAPI = {
  getAll: (params = {}) => {
    const queryString = new URLSearchParams(params).toString()
    return api.get(`/rankings${queryString ? `?${queryString}` : ''}`)
  },
}

// Schedule API
export const scheduleAPI = {
  getAll: () => api.get('/schedule'),
  getUpcoming: () => api.get('/schedule/upcoming'),
  create: (data) => api.post('/schedule', data),
  update: (id, data) => api.put(`/schedule/${id}`, data),
  delete: (id) => api.delete(`/schedule/${id}`),
}

// Tournaments API
export const tournamentsAPI = {
  getAll: () => api.get('/tournaments'),
  getById: (id) => api.get(`/tournaments/${id}`),
  getUpcoming: () => api.get('/tournaments/upcoming'),
  create: (data) => api.post('/tournaments', data),
  update: (id, data) => api.put(`/tournaments/${id}`, data),
  delete: (id) => api.delete(`/tournaments/${id}`),
  register: (tournamentId, memberId, partnerId = null) =>
    api.post(`/tournaments/${tournamentId}/register`, { memberId, partnerId }),
  getParticipants: (id, status = null) => 
    api.get(`/tournaments/${id}/participants${status ? `?status=${status}` : ''}`),
  approveParticipant: (tournamentId, participantId) =>
    api.put(`/tournaments/${tournamentId}/participants/${participantId}`, { status: 'approved' }),
  rejectParticipant: (tournamentId, participantId) =>
    api.put(`/tournaments/${tournamentId}/participants/${participantId}`, { status: 'rejected' }),
  getMatches: (id) => api.get(`/tournaments/${id}/matches`),
  createMatch: (id, data) => api.post(`/tournaments/${id}/matches`, data),
}

// Matches API
export const matchesAPI = {
  getAll: () => api.get('/matches'),
  getById: (id) => api.get(`/matches/${id}`),
  create: (data) => api.post('/matches', data),
  updateScore: (id, data) => api.put(`/matches/${id}`, data),
}

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  changePassword: (email, currentPassword, newPassword) =>
    api.put('/auth/change-password', { email, currentPassword, newPassword }),
  verify: (email) => api.get(`/auth/verify?email=${encodeURIComponent(email)}`),
}

export default api
