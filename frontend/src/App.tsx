import { Route, Routes } from 'react-router'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import ActivityLogs from './pages/ActivityLogs'
import Dashboard from './pages/Dashboard'
import AiAssistant from './pages/AiAssistant'
import DNSAnalyzer from './pages/DNSAnalyzer'
import FileHasher from './pages/FileHasher'
import JwtInspector from './pages/JwtInspector'
import Login from './pages/Login'
import Notifications from './pages/Notifications'
import PasswordChecker from './pages/PasswordChecker'
import Register from './pages/Register'
import Reports from './pages/Reports'
import SSLChecker from './pages/SSLChecker'
import Whois from './pages/Whois'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dns" element={<DNSAnalyzer />} />
            <Route path="/ssl" element={<SSLChecker />} />
            <Route path="/whois" element={<Whois />} />
            <Route path="/hash" element={<FileHasher />} />
            <Route path="/password" element={<PasswordChecker />} />
            <Route path="/jwt" element={<JwtInspector />} />
            <Route path="/ia" element={<AiAssistant />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/logs" element={<ActivityLogs />} />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}
