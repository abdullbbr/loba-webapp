import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api'

const SC = { Approved:'success', Submitted:'warning', Rejected:'danger', Pending:'gray' }

export default function AdminPayments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('Submitted')
  const [noteMap, setNoteMap] = useState({})

  const load = (s) => {
    setLoading(true)
    api.get('/payments/' + (s ? '?status=' + s : '')).then(r => setPayments(r.data)).finally(() => setLoading(false))
  }

  useEffect(() => { load(statusFilter) }, [statusFilter])

  const review = async (id, action) => {
    await api.patch('/payments/' + id + '/review?action=' + action + '&admin_note=' + encodeURIComponent(noteMap[id] || ''))
    load(statusFilter)
  }

  return (
    <Layout title="Review Payments">
      <div className="page-header"><h2>Payment Review</h2><p>Approve or reject member payment submissions.</p></div>
      <div style={{display:'flex',gap:8,marginBottom:24}}>
        {['Submitted','Approved','Rejected',''].map(s => (
          <button key={s || 'all'} className={'btn btn-sm ' + (statusFilter === s ? 'btn-primary' : 'btn-outline')} onClick={() => setStatusFilter(s)}>
            {s || 'All Payments'}
          </button>
        ))}
      </div>
      <div className="card">
        {loading ? <div className="spinner spinner-navy" /> : payments.length === 0 ? <p className="text-muted">No payments for this filter.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Member</th><th>Year</th><th>Amount</th><th>Submitted</th><th>Status</th><th>Receipt</th><th>Admin Note</th><th>Actions</th></tr></thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{fontWeight:600,color:'var(--navy)'}}>{p.member_name}</div>
                      <div style={{fontSize:12,color:'var(--gray-400)'}}>{p.member_email}</div>
                    </td>
                    <td>{p.payment_year}</td>
                    <td>N{Number(p.amount||0).toLocaleString()}</td>
                    <td style={{fontSize:13}}>{new Date(p.submitted_at).toLocaleDateString('en-GB')}</td>
                    <td><span className={'badge badge-' + (SC[p.status] || 'gray')}>{p.status}</span></td>
                    <td>{p.proof_url ? <a href={p.proof_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View</a> : '-'}</td>
                    <td>
                      <input className="form-input" style={{width:130,padding:'4px 8px',fontSize:12}} placeholder="Note..."
                        value={noteMap[p.id] || ''} onChange={e => setNoteMap(n => ({...n, [p.id]: e.target.value}))} />
                    </td>
                    <td>
                      <div style={{display:'flex',gap:4}}>
                        {p.status !== 'Approved' && <button className="btn btn-success btn-sm" onClick={() => review(p.id, 'approve')}>Approve</button>}
                        {p.status !== 'Rejected' && <button className="btn btn-danger btn-sm" onClick={() => review(p.id, 'reject')}>Reject</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  )
}
