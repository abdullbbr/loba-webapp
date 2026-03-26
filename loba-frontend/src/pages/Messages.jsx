import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api'

export default function Messages() {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/messages/inbox')
      .then(r => setMessages(r.data))
      .finally(() => setLoading(false))
  }, [])

  return (
    <Layout title="Messages">
      <div className="page-header">
        <h2>Messages</h2>
        <p>Broadcast messages from the association.</p>
      </div>

      {loading ? <div className="spinner spinner-navy" /> :
        messages.length === 0 ? (
          <div className="card" style={{textAlign:'center', padding:48}}>
            <div style={{fontSize:48, marginBottom:16}}>📭</div>
            <h3 style={{marginBottom:8}}>No Messages</h3>
            <p className="text-muted">You have no broadcast messages yet.</p>
          </div>
        ) : (
          <div style={{display:'flex', flexDirection:'column', gap:12}}>
            {messages.map(m => (
              <div key={m.id} className="card" style={{padding:20, cursor:'pointer', transition:'var(--transition)'}}
                onClick={() => setSelected(m)}
                onMouseEnter={e => e.currentTarget.style.borderColor='var(--navy)'}
                onMouseLeave={e => e.currentTarget.style.borderColor='var(--gray-200)'}>
                <div className="flex justify-between items-center" style={{marginBottom:8}}>
                  <strong style={{fontSize:16, color:'var(--navy)'}}>{m.subject}</strong>
                  <span className="text-muted" style={{fontSize:12}}>
                    {new Date(m.sent_at).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric'})}
                  </span>
                </div>
                <p style={{color:'var(--gray-600)', fontSize:14, marginBottom:6}}>
                  {m.body.length > 150 ? m.body.slice(0, 150) + '...' : m.body}
                </p>
                <span className="text-muted" style={{fontSize:12}}>From: {m.sender_name}</span>
              </div>
            ))}
          </div>
        )
      }

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected.subject}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>X</button>
            </div>
            <div style={{marginBottom:12, color:'var(--gray-500)', fontSize:13}}>
              From: {selected.sender_name} &middot; {new Date(selected.sent_at).toLocaleDateString('en-GB', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}
            </div>
            <p style={{lineHeight:1.8, whiteSpace:'pre-wrap'}}>{selected.body}</p>
          </div>
        </div>
      )}
    </Layout>
  )
}
