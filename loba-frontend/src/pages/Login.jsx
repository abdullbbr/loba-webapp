import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const user = await login(email, password)
      const dest = user.role === 'finance' ? '/finance/dashboard' : user.role === 'member' ? '/dashboard' : '/admin/members'
      navigate(dest)
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <h1>Welcome Back.</h1>
          <p>The Lautai Old Boys Association portal brings together our distinguished alumni network. Log in to access your membership, connect with fellow alumni, and stay informed.</p>
          <div style={{marginTop: 40, display:'flex', gap:12, flexWrap:'wrap'}}>
            {['Fellowship','Excellence','Legacy','Community'].map(v => (
              <span key={v} style={{background:'rgba(201,168,76,0.15)',color:'var(--gold)',padding:'6px 14px',borderRadius:20,fontSize:13,fontWeight:600}}>{v}</span>
            ))}
          </div>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-form-box">
          <div style={{marginBottom:28}}>
            <div style={{width:48,height:48,background:'var(--navy)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:16}}>
              <span style={{color:'var(--gold)',fontSize:20,fontWeight:900,fontFamily:"Playfair Display, serif"}}>L</span>
            </div>
            <h2>Sign In</h2>
            <p>Enter your credentials to access your account</p>
          </div>
          {error && <div className="alert alert-danger">&#9888; {error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address <span className="req">*</span></label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password <span className="req">*</span></label>
              <input className="form-input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="..." required />
            </div>
            <div style={{marginTop:24}}>
              <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={loading}>
                {loading ? <><span className="spinner"></span> Signing in...</> : 'Sign In to LOBA'}
              </button>
            </div>
          </form>
          <hr className="divider" />
          <p style={{textAlign:'center',fontSize:14,color:'var(--gray-600)'}}>
            Not yet a member? <Link to="/register" style={{color:'var(--navy)',fontWeight:600}}>Register here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
