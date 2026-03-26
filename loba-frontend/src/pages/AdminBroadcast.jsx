import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api'

const LABELS = { all:'All Members', active:'Active Members Only', inactive:'Inactive Members Only' }

export default function AdminBroadcast() {
  const [messages, setMessages] = useState([])
  const [form, setForm] = useState({ subject:'', body:'', recipient_filter:'all' })
  const [sending, setSending] = useState(false)
  const [msg, setMsg] = useState(null)
  const [preview, setPreview] = useState(null)

  const load = () => api.get('/messages/').then(r => setMessages(r.data))
  useEffect(() => { load() }, [])

  const send = async () => {
    if (!form.subject || !form.body) { setMsg({ type:'danger', text:'Subject and body are required.' }); return }
    setSending(true); setMsg(null)
    try {
      const res = await api.post('/messages/broadcast', form)
      setMsg({ type:'success', text: res.data.message })
      setForm({ subject:'', body:'', recipient_filter:'all' }); load()
    } catch { setMsg({ type:'danger', text:'Failed to send.' }) }
    finally { setSending(false) }
  }

  return (
    <Layout title="Broadcast Message">
      <div className="page-header"><h2>Broadcast Message</h2><p>Send a message to all or selected members.</p></div>
      <div className="grid grid-2" style={{alignItems:'start'}}>
        <div className="card">
          <h3 style={{fontSize:18,marginBottom:20}}>Compose Message</h3>
          {msg && <div className={'alert alert-' + msg.type} style={{marginBottom:12}}>{msg.text}</div>}
          <div className="form-group">
            <label className="form-label">Recipients</label>
            <select className="form-select" value={form.recipient_filter} onChange={e => setForm(f => ({...f, recipient_filter:e.target.value}))}>
              <option value="all">All Members</option>
              <option value="active">Active Members Only</option>
              <option value="inactive">Inactive Members Only</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Subject *</label>
            <input className="form-input" value={form.subject} onChange={e => setForm(f => ({...f, subject:e.target.value}))} placeholder="Message subject..." />
          </div>
          <div className="form-group">
            <label className="form-label">Message Body *</label>
            <textarea className="form-textarea" style={{minHeight:180}} value={form.body} onChange={e => setForm(f => ({...f, body:e.target.value}))} placeholder="Type your message here..." />
          </div>
          <div className="alert alert-info" style={{marginBottom:16}}>This message will be logged and visible to admins in the history.</div>
          <div style={{display:'flex',gap:12}}>
            <button className="btn btn-outline" onClick={() => setPreview(form)}>Preview</button>
            <button className="btn btn-primary" onClick={send} disabled={sending} style={{flex:1}}>
              {sending ? 'Sending...' : 'Send to ' + (LABELS[form.recipient_filter] || 'Members')}
            </button>
          </div>
        </div>
        <div className="card">
          <h3 style={{fontSize:18,marginBottom:20}}>Message History</h3>
          {messages.length === 0 ? <p className="text-muted">No messages sent yet.</p> : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {messages.map(m => (
                <div key={m.id} style={{padding:14,border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',cursor:'pointer'}} onClick={() => setPreview(m)}>
                  <div className="flex justify-between items-center" style={{marginBottom:4}}>
                    <strong style={{fontSize:14}}>{m.subject}</strong>
                    <span className="badge badge-info">{m.recipient_filter}</span>
                  </div>
                  <p style={{fontSize:13,color:'var(--gray-600)',marginBottom:6}}>{m.body.slice(0,80)}{m.body.length > 80 ? '...' : ''}</p>
                  <span className="text-muted">{new Date(m.sent_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {preview && (
        <div className="modal-overlay" onClick={() => setPreview(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Message Preview</h3><button className="modal-close" onClick={() => setPreview(null)}>X</button></div>
            <div style={{background:'var(--gray-50)',borderRadius:'var(--radius)',padding:16,marginBottom:16}}>
              <div style={{marginBottom:4}}><span className="text-muted">Subject: </span><strong>{preview.subject}</strong></div>
              <div><span className="text-muted">To: </span><strong>{LABELS[preview.recipient_filter] || preview.recipient_filter}</strong></div>
            </div>
            <p style={{lineHeight:1.8,whiteSpace:'pre-wrap'}}>{preview.body}</p>
          </div>
        </div>
      )}
    </Layout>
  )
}
