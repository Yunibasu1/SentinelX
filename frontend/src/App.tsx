import { Route, Routes } from 'react-router'

import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import { AuthProvider } from './contexts/AuthContext'
import Dashboard from './pages/Dashboard'
import DNSAnalyzer from './pages/DNSAnalyzer'
import Login from './pages/Login'
import Register from './pages/Register'

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
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  )
}
