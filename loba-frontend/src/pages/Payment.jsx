import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api'

const STATUS_COLOR = { Approved:'success', Submitted:'warning', Rejected:'danger', Pending:'gray' }

export default function Payment() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState(null)
  const [form, setForm] = useState({ amount:'', payment_year: new Date().getFullYear().toString(), proof: null })
  const [account, setAccount] = useState(null)

  const load = () => {
    api.get('/payments/my').then(r => setPayments(r.data)).finally(() => setLoading(false))
    api.get('/finance/account').then(r => setAccount(r.data)).catch(() => {})
  }
  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    if (!form.proof) { setMsg({ type:'danger', text:'Please upload your proof of payment.' }); return }
    setSubmitting(true); setMsg(null)
    const fd = new FormData()
    fd.append('amount', form.amount)
    fd.append('payment_year', form.payment_year)
    fd.append('proof', form.proof)
    try {
      await api.post('/payments/submit', fd, { headers:{ 'Content-Type':'multipart/form-data' } })
      setMsg({ type:'success', text:'Payment submitted successfully! Awaiting admin review.' })
      setForm({ amount:'', payment_year: new Date().getFullYear().toString(), proof: null })
      load()
    } catch (e) { setMsg({ type:'danger', text: e.response?.data?.detail || 'Submission failed.' }) }
    finally { setSubmitting(false) }
  }

  return (
    <Layout title="Payment">
      <div className="page-header">
        <h2>Membership Dues</h2>
        <p>Submit your proof of payment to activate or maintain your membership.</p>
      </div>

      <div className="grid grid-2" style={{alignItems:'start'}}>
        <div>
          <div className="card" style={{marginBottom:24}}>
            <h3 style={{fontSize:18,marginBottom:16}}>Bank Details</h3>
            {account ? (
              <div style={{background:'var(--gray-50)',borderRadius:'var(--radius)',padding:20}}>
                <div style={{marginBottom:12}}>
                  <span className="text-muted" style={{display:'block',marginBottom:2}}>Bank Name</span>
                  <strong>{account.bank_name}</strong>
                </div>
                <div style={{marginBottom:12}}>
                  <span className="text-muted" style={{display:'block',marginBottom:2}}>Account Name</span>
                  <strong>{account.account_name}</strong>
                </div>
                <div style={{marginBottom:12}}>
                  <span className="text-muted" style={{display:'block',marginBottom:2}}>Account Number</span>
                  <strong style={{fontSize:20,letterSpacing:2,color:'var(--navy)'}}>{account.account_number}</strong>
                </div>
              </div>
            ) : (
              <p className="text-muted">Bank details have not been configured yet.</p>
            )}
            <div className="alert alert-info" style={{marginTop:16}}>
              After making payment, upload your bank receipt or screenshot below for verification.
            </div>
          </div>

          <div className="card">
            <h3 style={{fontSize:18,marginBottom:20}}>Submit Payment Proof</h3>
            {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
            <form onSubmit={submit}>
              <div className="grid grid-2">
                <div className="form-group">
                  <label className="form-label">Amount Paid (₦)</label>
                  <input className="form-input" type="number" value={form.amount}
                    onChange={e => setForm(f => ({...f, amount: e.target.value}))} placeholder="e.g. 10000" required />
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Year</label>
                  <input className="form-input" type="number" value={form.payment_year}
                    onChange={e => setForm(f => ({...f, payment_year: e.target.value}))} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Proof of Payment (Receipt / Screenshot)</label>
                <div className={`payment-proof-zone ${form.proof ? 'has-file' : ''}`}
                  onClick={() => document.getElementById('proofInput').click()}>
                  {form.proof ? (
                    <div>
                      <div style={{fontSize:28,marginBottom:8}}>✅</div>
                      <strong style={{color:'var(--success)'}}>{form.proof.name}</strong>
                      <p className="text-muted" style={{fontSize:12,marginTop:4}}>Click to change file</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{fontSize:36,marginBottom:8}}>📎</div>
                      <strong>Click to upload receipt</strong>
                      <p className="text-muted" style={{fontSize:12,marginTop:4}}>PNG, JPG, or PDF accepted</p>
                    </div>
                  )}
                </div>
                <input id="proofInput" type="file" accept="image/*,.pdf" style={{display:'none'}}
                  onChange={e => setForm(f => ({...f, proof: e.target.files[0]}))} />
              </div>
              <button className="btn btn-primary btn-block btn-lg" type="submit" disabled={submitting}>
                {submitting ? <><span className="spinner"></span> Submitting...</> : 'Submit Payment'}
              </button>
            </form>
          </div>
        </div>

        <div className="card">
          <h3 style={{fontSize:18,marginBottom:20}}>Payment History</h3>
          {loading ? <div className="spinner spinner-navy" /> :
            payments.length === 0 ? <p className="text-muted">No payment records yet.</p> : (
              <div>
                {payments.map(p => (
                  <div key={p.id} style={{padding:'16px 0',borderBottom:'1px solid var(--gray-100)'}}>
                    <div className="flex justify-between items-center" style={{marginBottom:6}}>
                      <strong>{p.payment_year} Dues</strong>
                      <span className={`badge badge-${STATUS_COLOR[p.status] || 'gray'}`}>{p.status}</span>
                    </div>
                    <div className="flex gap-16" style={{marginBottom:6}}>
                      <span className="text-muted">Amount: <strong style={{color:'var(--navy)'}}>₦{Number(p.amount||0).toLocaleString()}</strong></span>
                      <span className="text-muted">{new Date(p.submitted_at).toLocaleDateString('en-GB')}</span>
                    </div>
                    {p.proof_url && (
                      <a href={p.proof_url} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View Receipt</a>
                    )}
                    {p.admin_note && (
                      <div className="alert alert-info" style={{marginTop:8,padding:'8px 12px',fontSize:13}}>
                        Admin note: {p.admin_note}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          }
        </div>
      </div>
    </Layout>
  )
}
