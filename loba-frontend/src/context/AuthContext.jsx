import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('loba_user')) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('loba_token')
    if (token) {
      api.get('/auth/me')
        .then(r => { setUser(r.data); localStorage.setItem('loba_user', JSON.stringify(r.data)) })
        .catch(() => { localStorage.removeItem('loba_token'); localStorage.removeItem('loba_user'); setUser(null) })
        .finally(() => setLoading(false))
    } else { setLoading(false) }
  }, [])

  const login = async (email, password) => {
    const form = new URLSearchParams()
    form.append('username', email)
    form.append('password', password)
    const res = await api.post('/auth/login', form, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
    localStorage.setItem('loba_token', res.data.access_token)
    localStorage.setItem('loba_user', JSON.stringify(res.data.user))
    setUser(res.data.user)
    return res.data.user
  }

  const logout = () => {
    localStorage.removeItem('loba_token')
    localStorage.removeItem('loba_user')
    setUser(null)
  }

  const isAdmin = () => ['admin', 'super_admin', 'finance'].includes(user?.role)
  const isFinance = () => user?.role === 'finance' || user?.role === 'super_admin'
  const isSuperAdmin = () => user?.role === 'super_admin'

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isFinance, isSuperAdmin, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
