import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute, FinanceRoute } from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Payment from './pages/Payment'
import Announcements from './pages/Announcements'
import Directory from './pages/Directory'
import AdminMembers from './pages/AdminMembers'
import AdminPayments from './pages/AdminPayments'
import AdminAnnouncements from './pages/AdminAnnouncements'
import AdminBroadcast from './pages/AdminBroadcast'
import AdminReports from './pages/AdminReports'
import Messages from './pages/Messages'
import FinanceDashboard from './pages/FinanceDashboard'
import FinanceExpenses from './pages/FinanceExpenses'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><Announcements /></ProtectedRoute>} />
          <Route path="/directory" element={<ProtectedRoute><Directory /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/finance/dashboard" element={<FinanceRoute><FinanceDashboard /></FinanceRoute>} />
          <Route path="/finance/expenses" element={<FinanceRoute><FinanceExpenses /></FinanceRoute>} />
          <Route path="/finance/broadcast" element={<FinanceRoute><AdminBroadcast /></FinanceRoute>} />
          <Route path="/admin/members" element={<AdminRoute><AdminMembers /></AdminRoute>} />
          <Route path="/admin/payments" element={<AdminRoute><AdminPayments /></AdminRoute>} />
          <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />
          <Route path="/admin/broadcast" element={<AdminRoute><AdminBroadcast /></AdminRoute>} />
          <Route path="/admin/reports" element={<AdminRoute><AdminReports /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
