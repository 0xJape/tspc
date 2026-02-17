import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Members from './pages/Members'
import Rankings from './pages/Rankings'
import Schedule from './pages/Schedule'
import Tournaments from './pages/Tournaments'
import TournamentDetail from './pages/TournamentDetail'
import MemberProfile from './pages/MemberProfile'
import Login from './pages/Login'
import Profile from './pages/Profile'
import MemberForm from './pages/MemberForm'
import TournamentForm from './pages/TournamentForm'
import RecordMatch from './pages/RecordMatch'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/members" element={<Members />} />
            <Route path="/members/:id" element={<MemberProfile />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/tournaments" element={<Tournaments />} />
            <Route path="/tournaments/:id" element={<TournamentDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Protected Admin Routes (same UI, admin-only access) */}
            <Route path="/members/new" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
            <Route path="/members/edit/:id" element={<ProtectedRoute><MemberForm /></ProtectedRoute>} />
            <Route path="/tournaments/new" element={<ProtectedRoute><TournamentForm /></ProtectedRoute>} />
            <Route path="/tournaments/edit/:id" element={<ProtectedRoute><TournamentForm /></ProtectedRoute>} />
            <Route path="/matches/record" element={<ProtectedRoute><RecordMatch /></ProtectedRoute>} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
