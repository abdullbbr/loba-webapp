import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api'

const STATUS_COLOR = { Approved:'success', Pending:'warning', Rejected:'danger' }
const CATEGORIES = ['General', 'Transport', 'Event', 'Logistics', 'Equipment', 'Welfare', 'Maintenance', 'Other']

export default function FinanceExpenses() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title:'', description:'', amount:'', category:'General' })
  const [msg, setMsg] = useState(null)
  const [reviewModal, setReviewModal] = useState(null)
  const [reviewNote, setReviewNote] = useState('')

  const load = () => {
    setLoading(true)
    api.get('/finance/expenses').then(r => setExpenses(r.data)).finally(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  const submit = async () => {
    if (!form.title || !form.description || !form.amount) { setMsg({ type:'danger', text:'All fields are required.' }); return }
    try {
      await api.post('/finance/expenses', form)
      setMsg({ type:'success', text:'Expense request submitted!' })
      setForm({ title:'', description:'', amount:'', category:'General' }); setShowForm(false); load()
    } catch { setMsg({ type:'danger', text:'Failed to submit.' }) }
  }

  const review = async (action) => {
    try {
      await api.patch(`/finance/expenses/${reviewModal.id}/review?action=${action}&admin_note=${encodeURIComponent(reviewNote)}`)
      setReviewModal(null); setReviewNote(''); load()
    } catch (e) { alert(e.response?.data?.detail || 'Failed') }
  }

  return (
    <Layout title="Expense Requests">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div><h2>Expense Requests</h2><p>Submit and track expense requests for super admin approval.</p></div>
          {!isSuperAdmin && <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setMsg(null) }}>
            {showForm ? 'Cancel' : '+ New Request'}
          </button>}
        </div>
      </div>

      {msg && <div className={'alert alert-' + msg.type} style={{marginBottom:16}}>{msg.text}</div>}

      {showForm && (
        <div className="card" style={{marginBottom:24}}>
          <h3 style={{fontSize:18,marginBottom:16}}>New Expense Request</h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} placeholder="e.g. Event Hall Rental" />
            </div>
            <div className="form-group">
              <label className="form-label">Amount (₦) *</label>
              <input className="form-input" type="number" value={form.amount} onChange={e => setForm(f => ({...f, amount:e.target.value}))} placeholder="e.g. 50000" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" style={{minHeight:100}} value={form.description} onChange={e => setForm(f => ({...f, description:e.target.value}))} placeholder="Explain the expense and justification..." />
          </div>
          <button className="btn btn-primary" onClick={submit}>Submit Request</button>
        </div>
      )}

      <div className="card">
        {loading ? <div className="spinner spinner-navy" /> : expenses.length === 0 ? (
          <div style={{textAlign:'center',padding:32}}>
            <div style={{fontSize:48,marginBottom:12}}>📋</div>
            <p className="text-muted">No expense requests yet.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Title</th><th>Category</th><th>Amount</th>
                  <th>Requested By</th><th>Date</th><th>Status</th>
                  {isSuperAdmin && <th>Action</th>}
                </tr>
              </thead>
              <tbody>
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td style={{color:'var(--gray-400)',fontSize:12}}>{e.id}</td>
                    <td>
                      <strong style={{color:'var(--navy)'}}>{e.title}</strong>
                      <div className="text-muted" style={{fontSize:12}}>{e.description.slice(0,60)}{e.description.length > 60 ? '...' : ''}</div>
                    </td>
                    <td><span className="badge badge-info">{e.category}</span></td>
                    <td style={{fontWeight:600}}>₦{Number(e.amount).toLocaleString()}</td>
                    <td style={{fontSize:13}}>{e.requester_name}</td>
                    <td style={{fontSize:12,color:'var(--gray-500)'}}>{new Date(e.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</td>
                    <td><span className={'badge badge-' + (STATUS_COLOR[e.status] || 'gray')}>{e.status}</span></td>
                    {isSuperAdmin && <td>
                      {e.status === 'Pending' ? (
                        <button className="btn btn-sm btn-primary" onClick={() => { setReviewModal(e); setReviewNote('') }}>Review</button>
                      ) : (
                        <span className="text-muted" style={{fontSize:12}}>
                          {e.reviewer_name && `by ${e.reviewer_name}`}
                        </span>
                      )}
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {reviewModal && (
        <div className="modal-overlay" onClick={() => setReviewModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:500}}>
            <div className="modal-header">
              <h3>Review Expense</h3>
              <button className="modal-close" onClick={() => setReviewModal(null)}>X</button>
            </div>
            <div style={{background:'var(--gray-50)',borderRadius:'var(--radius)',padding:16,marginBottom:16}}>
              <div style={{marginBottom:8}}><span className="text-muted">Title: </span><strong>{reviewModal.title}</strong></div>
              <div style={{marginBottom:8}}><span className="text-muted">Amount: </span><strong>₦{Number(reviewModal.amount).toLocaleString()}</strong></div>
              <div style={{marginBottom:8}}><span className="text-muted">Category: </span>{reviewModal.category}</div>
              <div><span className="text-muted">Description: </span>{reviewModal.description}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Admin Note (optional)</label>
              <textarea className="form-textarea" value={reviewNote} onChange={e => setReviewNote(e.target.value)} placeholder="Add a note..." />
            </div>
            <div style={{display:'flex',gap:10}}>
              <button className="btn btn-success" style={{flex:1}} onClick={() => review('approve')}>✓ Approve</button>
              <button className="btn btn-danger" style={{flex:1}} onClick={() => review('reject')}>✗ Reject</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
