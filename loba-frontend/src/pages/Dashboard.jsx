import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Dashboard() {
  const { user } = useAuth()
  const [payments, setPayments] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/payments/my'), api.get('/announcements/?limit=3')])
      .then(([p, a]) => { setPayments(p.data); setAnnouncements(a.data) })
      .finally(() => setLoading(false))
  }, [])

  const STATUS_COLOR = { Approved:'success', Submitted:'warning', Rejected:'danger', Pending:'gray' }

  return (
    <Layout title="Dashboard">
      <div className="page-header">
        <h2>Welcome back, {user?.first_name}!</h2>
        <p>Here is an overview of your membership status and recent activity.</p>
      </div>

      <div className="grid grid-4" style={{marginBottom:28}}>
        {[
          { icon:'👤', label:'Membership', value: user?.membership_category || 'Regular', cls:'navy' },
          { icon: user?.is_active ? '✅' : '⏳', label:'Account Status', value: user?.is_active ? 'Active' : 'Pending',
            color: user?.is_active ? 'var(--success)' : 'var(--warning)', cls: user?.is_active ? 'green' : 'red' },
          { icon:'💳', label:'Payments', value: payments.length, cls:'gold' },
          { icon:'🏛️', label:'Chapter', value: user?.chapter || 'N/A', cls:'navy' },
        ].map(({ icon, label, value, cls, color }) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon ${cls}`}>{icon}</div>
            <div>
              <div className="stat-value" style={{fontSize:22, color: color || undefined}}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {!user?.is_active && (
        <div className="alert alert-warning" style={{marginBottom:24}}>
          <strong>Account Pending:</strong> Your account will be activated once your payment is approved.{' '}
          <Link to="/payment" style={{fontWeight:600}}>Submit Payment Now</Link>
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <div className="flex justify-between items-center" style={{marginBottom:20}}>
            <h3 style={{fontSize:18}}>Recent Announcements</h3>
            <Link to="/announcements" style={{fontSize:13,color:'var(--navy-mid)'}}>View all →</Link>
          </div>
          {loading ? <div className="spinner spinner-navy" /> :
            announcements.length === 0 ? <p className="text-muted">No announcements yet.</p> :
            announcements.map(a => (
              <div key={a.id} style={{padding:'12px 0',borderBottom:'1px solid var(--gray-100)'}}>
                <div style={{fontSize:11,fontWeight:700,color:'var(--gold)',letterSpacing:1,textTransform:'uppercase',marginBottom:4}}>{a.category}</div>
                <div style={{fontWeight:600,color:'var(--navy)',marginBottom:4}}>{a.title}</div>
                <div className="text-muted">{new Date(a.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})}</div>
              </div>
            ))
          }
        </div>

        <div className="card">
          <div className="flex justify-between items-center" style={{marginBottom:20}}>
            <h3 style={{fontSize:18}}>Payment History</h3>
            <Link to="/payment" style={{fontSize:13,color:'var(--navy-mid)'}}>+ Submit New</Link>
          </div>
          {loading ? <div className="spinner spinner-navy" /> :
            payments.length === 0 ? (
              <div style={{textAlign:'center',padding:'20px 0'}}>
                <p className="text-muted" style={{marginBottom:12}}>No payment records found.</p>
                <Link to="/payment" className="btn btn-primary btn-sm">Submit Payment</Link>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Year</th><th>Amount</th><th>Status</th></tr></thead>
                  <tbody>
                    {payments.map(p => (
                      <tr key={p.id}>
                        <td>{p.payment_year}</td>
                        <td>₦{Number(p.amount || 0).toLocaleString()}</td>
                        <td><span className={`badge badge-${STATUS_COLOR[p.status] || 'gray'}`}>{p.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </div>
      </div>

      <div className="card" style={{marginTop:24}}>
        <h3 style={{fontSize:18,marginBottom:16}}>Quick Links</h3>
        <div className="grid grid-4">
          {[
            { to:'/profile', icon:'✏️', label:'Edit Profile', desc:'Update your info' },
            { to:'/payment', icon:'💰', label:'Pay Dues', desc:'Submit proof of payment' },
            { to:'/directory', icon:'📖', label:'Directory', desc:'Find fellow alumni' },
            { to:'/announcements', icon:'📢', label:'Announcements', desc:'View latest news' },
          ].map(({ to, icon, label, desc }) => (
            <Link to={to} key={label} style={{textDecoration:'none'}}>
              <div style={{padding:16,border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius-lg)',textAlign:'center',transition:'var(--transition)',cursor:'pointer'}}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--navy)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--gray-200)'}>
                <div style={{fontSize:28,marginBottom:8}}>{icon}</div>
                <div style={{fontWeight:600,color:'var(--navy)',marginBottom:4}}>{label}</div>
                <div className="text-muted">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}
