import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api'

const BLANK = { title:'', content:'', category:'General', is_pinned:false }

export default function AdminAnnouncements() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  const load = () => api.get('/announcements/?limit=50').then(r => setItems(r.data)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openNew = () => { setEditing('new'); setForm(BLANK); setMsg(null) }
  const openEdit = (a) => { setEditing(a.id); setForm({ title:a.title, content:a.content, category:a.category, is_pinned:a.is_pinned }); setMsg(null) }
  const close = () => { setEditing(null); setMsg(null) }

  const save = async () => {
    if (!form.title || !form.content) { setMsg({ type:'danger', text:'Title and content are required.' }); return }
    setSaving(true); setMsg(null)
    try {
      if (editing === 'new') await api.post('/announcements/', form)
      else await api.put('/announcements/' + editing, form)
      setMsg({ type:'success', text: editing === 'new' ? 'Announcement published!' : 'Updated!' })
      load(); setTimeout(close, 1200)
    } catch { setMsg({ type:'danger', text:'Failed to save.' }) }
    finally { setSaving(false) }
  }

  const del = async (id) => {
    if (!window.confirm('Delete this announcement?')) return
    await api.delete('/announcements/' + id); load()
  }

  return (
    <Layout title="Manage Announcements">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div><h2>Manage Announcements</h2><p>Create and manage association news and notices.</p></div>
          <button className="btn btn-primary" onClick={openNew}>+ New Announcement</button>
        </div>
      </div>
      <div className="card">
        {loading ? <div className="spinner spinner-navy" /> : items.length === 0 ? <p className="text-muted">No announcements yet.</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Title</th><th>Category</th><th>Pinned</th><th>Author</th><th>Date</th><th>Actions</th></tr></thead>
              <tbody>
                {items.map(a => (
                  <tr key={a.id}>
                    <td style={{fontWeight:600}}>{a.title}</td>
                    <td><span className="badge badge-info">{a.category}</span></td>
                    <td>{a.is_pinned ? 'Yes' : '-'}</td>
                    <td style={{fontSize:13}}>{a.author_name}</td>
                    <td style={{fontSize:13}}>{new Date(a.created_at).toLocaleDateString('en-GB')}</td>
                    <td>
                      <div style={{display:'flex',gap:6}}>
                        <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => del(a.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {editing && (
        <div className="modal-overlay" onClick={close}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:640}}>
            <div className="modal-header">
              <h3>{editing === 'new' ? 'New Announcement' : 'Edit Announcement'}</h3>
              <button className="modal-close" onClick={close}>X</button>
            </div>
            {msg && <div className={'alert alert-' + msg.type} style={{marginBottom:12}}>{msg.text}</div>}
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-input" value={form.title} onChange={e => setForm(f => ({...f, title:e.target.value}))} />
            </div>
            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={e => setForm(f => ({...f, category:e.target.value}))}>
                  <option>General</option><option>Events</option><option>Notice</option><option>Obituary</option><option>Achievement</option>
                </select>
              </div>
              <div className="form-group" style={{display:'flex',alignItems:'center',gap:10,paddingTop:28}}>
                <input type="checkbox" id="pinned" checked={form.is_pinned} onChange={e => setForm(f => ({...f, is_pinned:e.target.checked}))} />
                <label htmlFor="pinned" style={{cursor:'pointer',fontWeight:600}}>Pin to top</label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Content *</label>
              <textarea className="form-textarea" style={{minHeight:160}} value={form.content} onChange={e => setForm(f => ({...f, content:e.target.value}))} />
            </div>
            <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
              <button className="btn btn-outline" onClick={close}>Cancel</button>
              <button className="btn btn-primary" onClick={save} disabled={saving}>
                {saving ? 'Saving...' : 'Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
