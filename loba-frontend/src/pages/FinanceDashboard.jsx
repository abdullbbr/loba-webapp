import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api'

export default function FinanceDashboard() {
  const [balance, setBalance] = useState(null)
  const [account, setAccount] = useState(null)
  const [form, setForm] = useState({ bank_name:'', account_name:'', account_number:'' })
  const [editing, setEditing] = useState(false)
  const [msg, setMsg] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    try {
      const [b, a] = await Promise.all([api.get('/finance/balance'), api.get('/finance/account')])
      setBalance(b.data)
      setAccount(a.data)
      if (a.data) setForm({ bank_name: a.data.bank_name, account_name: a.data.account_name, account_number: a.data.account_number })
    } catch {}
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const saveAccount = async () => {
    if (!form.bank_name || !form.account_name || !form.account_number) { setMsg({ type:'danger', text:'All fields are required.' }); return }
    try {
      await api.post('/finance/account', form)
      setMsg({ type:'success', text:'Account info saved.' }); setEditing(false); load()
    } catch { setMsg({ type:'danger', text:'Failed to save.' }) }
  }

  const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })

  if (loading) return <Layout title="Finance Dashboard"><div className="spinner spinner-navy" /></Layout>

  return (
    <Layout title="Finance Dashboard">
      <div className="page-header">
        <h2>Finance Dashboard</h2>
        <p>Manage association finances, account details, and expenses.</p>
      </div>

      <div className="grid grid-4" style={{marginBottom:28}}>
        {[
          { icon:'💰', label:'Total Income', value: fmt(balance?.total_income), cls:'green' },
          { icon:'📤', label:'Total Expenses', value: fmt(balance?.total_expenses), cls:'red' },
          { icon:'🏦', label:'Balance', value: fmt(balance?.balance), cls:'navy' },
          { icon:'💳', label:'Approved Payments', value: balance?.total_payments || 0, cls:'gold' },
        ].map(({ icon, label, value, cls }) => (
          <div className="stat-card" key={label}>
            <div className={`stat-icon ${cls}`}>{icon}</div>
            <div>
              <div className="stat-value" style={{fontSize:20}}>{value}</div>
              <div className="stat-label">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {balance?.pending_payments > 0 && (
        <div className="alert alert-warning" style={{marginBottom:24}}>
          <strong>{balance.pending_payments}</strong> payment(s) awaiting review.
        </div>
      )}

      <div className="grid grid-2" style={{alignItems:'start'}}>
        <div className="card">
          <div className="flex justify-between items-center" style={{marginBottom:20}}>
            <h3 style={{fontSize:18}}>Association Account Details</h3>
            {!editing && <button className="btn btn-sm btn-primary" onClick={() => setEditing(true)}>
              {account ? 'Edit' : 'Add Account'}
            </button>}
          </div>
          {msg && <div className={'alert alert-' + msg.type} style={{marginBottom:12}}>{msg.text}</div>}
          {editing ? (
            <div>
              <div className="form-group">
                <label className="form-label">Bank Name *</label>
                <input className="form-input" value={form.bank_name} onChange={e => setForm(f => ({...f, bank_name:e.target.value}))} placeholder="e.g. First Bank" />
              </div>
              <div className="form-group">
                <label className="form-label">Account Name *</label>
                <input className="form-input" value={form.account_name} onChange={e => setForm(f => ({...f, account_name:e.target.value}))} placeholder="e.g. LOBA Association" />
              </div>
              <div className="form-group">
                <label className="form-label">Account Number *</label>
                <input className="form-input" value={form.account_number} onChange={e => setForm(f => ({...f, account_number:e.target.value}))} placeholder="e.g. 0123456789" />
              </div>
              <div style={{display:'flex',gap:10}}>
                <button className="btn btn-primary" onClick={saveAccount}>Save</button>
                <button className="btn btn-outline" onClick={() => { setEditing(false); setMsg(null) }}>Cancel</button>
              </div>
            </div>
          ) : account ? (
            <div>
              {[['Bank', account.bank_name], ['Account Name', account.account_name], ['Account Number', account.account_number]].map(([l,v]) => (
                <div key={l} style={{padding:'10px 0', borderBottom:'1px solid var(--gray-100)'}}>
                  <span style={{fontSize:12,color:'var(--gray-400)',display:'block',marginBottom:2}}>{l}</span>
                  <strong style={{fontSize:15}}>{v}</strong>
                </div>
              ))}
              <p className="text-muted" style={{marginTop:12,fontSize:12}}>
                Last updated: {new Date(account.updated_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
              </p>
            </div>
          ) : (
            <div style={{textAlign:'center',padding:'24px 0'}}>
              <p className="text-muted" style={{marginBottom:12}}>No account info set yet.</p>
              <button className="btn btn-primary btn-sm" onClick={() => setEditing(true)}>Add Account Details</button>
            </div>
          )}
        </div>

        <div className="card">
          <h3 style={{fontSize:18, marginBottom:20}}>Quick Actions</h3>
          <div style={{display:'flex',flexDirection:'column',gap:12}}>
            <a href="/finance/expenses" style={{textDecoration:'none'}}>
              <div style={{padding:16,border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius-lg)',display:'flex',alignItems:'center',gap:14,transition:'var(--transition)',cursor:'pointer'}}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--navy)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--gray-200)'}>
                <span style={{fontSize:28}}>📋</span>
                <div>
                  <div style={{fontWeight:600,color:'var(--navy)'}}>Expense Requests</div>
                  <div className="text-muted" style={{fontSize:13}}>Submit and track expense requests</div>
                </div>
              </div>
            </a>
            <a href="/finance/broadcast" style={{textDecoration:'none'}}>
              <div style={{padding:16,border:'1.5px solid var(--gray-200)',borderRadius:'var(--radius-lg)',display:'flex',alignItems:'center',gap:14,transition:'var(--transition)',cursor:'pointer'}}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--navy)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--gray-200)'}>
                <span style={{fontSize:28}}>📡</span>
                <div>
                  <div style={{fontWeight:600,color:'var(--navy)'}}>Broadcast Contribution</div>
                  <div className="text-muted" style={{fontSize:13}}>Send contribution request to members</div>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
