import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div className='spinner spinner-navy'></div></div>
  return user ? children : <Navigate to='/login' replace />
}

export function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div className='spinner spinner-navy'></div></div>
  if (!user) return <Navigate to='/login' replace />
  if (!isAdmin()) return <Navigate to='/dashboard' replace />
  return children
}

export function FinanceRoute({ children }) {
  const { user, loading, isFinance } = useAuth()
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><div className='spinner spinner-navy'></div></div>
  if (!user) return <Navigate to='/login' replace />
  if (!isFinance()) return <Navigate to='/dashboard' replace />
  return children
}
