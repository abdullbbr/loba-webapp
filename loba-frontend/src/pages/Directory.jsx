import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api'

export default function Directory() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/members/directory').then(r => setMembers(r.data)).finally(() => setLoading(false))
  }, [])

  const doSearch = () => api.get(`/members/directory?search=${search}`).then(r => setMembers(r.data))
  const filtered = members

  return (
    <Layout title="Member Directory">
      <div className="page-header">
        <h2>Member Directory</h2>
        <p>Connect with fellow Lautai alumni across Nigeria and beyond.</p>
      </div>

      <div style={{display:'flex',gap:12,marginBottom:28}}>
        <div className="search-box" style={{flex:1}}>
          <span className="icon">🔍</span>
          <input placeholder="Search by name, occupation..." value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()} />
        </div>
        <button className="btn btn-primary" onClick={doSearch}>Search</button>
      </div>

      {loading ? <div className="spinner spinner-navy" /> : (
        <>
          <p className="text-muted" style={{marginBottom:20}}>{filtered.length} active member{filtered.length !== 1 ? 's' : ''} found</p>
          <div className="grid grid-3">
            {filtered.map(m => (
              <div key={m.id} className="member-card" onClick={() => setSelected(m)}>
                <div className="member-avatar">
                  {m.photo_url ? <img src={m.photo_url} alt="" /> : `${m.first_name?.[0] || ''}${m.last_name?.[0] || ''}`}
                </div>
                <h4 style={{fontSize:16,marginBottom:4}}>{m.first_name} {m.last_name}</h4>
                {m.occupation && <p style={{fontSize:13,color:'var(--gray-600)',marginBottom:2}}>{m.occupation}</p>}
                {m.employer && <p style={{fontSize:12,color:'var(--gray-400)',marginBottom:8}}>{m.employer}</p>}
                <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:6,marginTop:4}}>
                  {m.set_year && <span className="badge badge-info">Set {m.set_year}</span>}
                  {m.city && <span className="badge badge-gray">{m.city}</span>}
                  {m.membership_category && <span className="badge badge-success">{m.membership_category}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selected.first_name} {selected.last_name}</h3>
              <button className="modal-close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div style={{textAlign:'center',marginBottom:20}}>
              <div className="member-avatar" style={{width:80,height:80,fontSize:26,margin:'0 auto 12px'}}>
                {selected.photo_url ? <img src={selected.photo_url} alt="" /> : `${selected.first_name?.[0] || ''}${selected.last_name?.[0] || ''}`}
              </div>
              <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:6}}>
                {selected.set_year && <span className="badge badge-info">Set {selected.set_year}</span>}
                {selected.membership_category && <span className="badge badge-success">{selected.membership_category}</span>}
                {selected.chapter && <span className="badge badge-gray">{selected.chapter} Chapter</span>}
              </div>
            </div>
            {[
              ['Occupation', selected.occupation],
              ['Employer', selected.employer],
              ['Location', [selected.city, selected.state_of_residence].filter(Boolean).join(', ')],
            ].filter(([,v]) => v).map(([label, value]) => (
              <div key={label} style={{display:'flex',gap:12,padding:'8px 0',borderBottom:'1px solid var(--gray-100)'}}>
                <span className="text-muted" style={{minWidth:100}}>{label}:</span>
                <strong>{value}</strong>
              </div>
            ))}
            {selected.linkedin && (
              <div style={{marginTop:16}}>
                <a href={selected.linkedin} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">View LinkedIn</a>
              </div>
            )}
          </div>
        </div>
      )}
    </Layout>
  )
}
