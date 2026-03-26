import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api'

const CAT_CLASS = { General:'ann-cat-general', Events:'ann-cat-event', Notice:'ann-cat-notice', Obituary:'ann-cat-obituary' }

export default function Announcements() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('All')

  useEffect(() => { api.get('/announcements/?limit=50').then(r => setItems(r.data)).finally(() => setLoading(false)) }, [])

  const cats = ['All', ...new Set(items.map(a => a.category).filter(Boolean))]
  const filtered = filter === 'All' ? items : items.filter(a => a.category === filter)

  return (
    <Layout title="Announcements">
      <div className="page-header">
        <h2>Announcements</h2>
        <p>Stay informed with the latest news and notices from LOBA.</p>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:24,flexWrap:'wrap'}}>
        {cats.map(c => (
          <button key={c} className={`btn btn-sm ${filter === c ? 'btn-primary' : 'btn-outline'}`} onClick={() => setFilter(c)}>{c}</button>
        ))}
      </div>

      {loading ? <div className="spinner spinner-navy" /> :
        filtered.length === 0 ? <p className="text-muted">No announcements found.</p> :
        <div style={{display:'flex',flexDirection:'column',gap:16}}>
          {filtered.map(a => (
            <div key={a.id} className={`ann-card ${a.is_pinned ? 'pinned' : ''}`} onClick={() => setSelected(a)} style={{cursor:'pointer'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <div>
                  {a.is_pinned && <span style={{fontSize:11,background:'rgba(201,168,76,0.15)',color:'var(--gold)',padding:'2px 8px',borderRadius:20,marginRight:8,fontWeight:600}}>📌 PINNED</span>}
                  <span className={`ann-cat ${CAT_CLASS[a.category] || 'ann-cat-general'}`}>{a.category}</span>
                  <h3 style={{fontSize:17,marginBottom:8,color:'var(--navy)'}}>{a.title}</h3>
                  <p style={{color:'var(--gray-600)',fontSize:14,lineHeight:1.6,marginBottom:8}}>
                    {a.content.length > 200 ? a.content.slice(0,200) + '...' : a.content}
                  </p>
                </div>
              </div>
              <div className="flex gap-16" style={{marginTop:8}}>
                <span className="text-muted">By {a.author_name}</span>
                <span className="text-muted">{new Date(a.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}</span>
              </div>
            </div>
          ))}
        </div>
      }

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected.title}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <span className={`ann-cat ${CAT_CLASS[selected.category] || 'ann-cat-general'}`}>{selected.category}</span>
            <p style={{marginTop:16,lineHeight:1.8,color:'var(--gray-800)',whiteSpace:'pre-wrap'}}>{selected.content}</p>
            <div className="flex gap-16" style={{marginTop:20,paddingTop:16,borderTop:'1px solid var(--gray-100)'}}>
              <span className="text-muted">Published by {selected.author_name}</span>
              <span className="text-muted">{new Date(selected.created_at).toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}</span>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
