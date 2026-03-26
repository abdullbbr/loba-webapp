import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function AdminMembers() {
  const { user } = useAuth()
  const isSuperAdmin = user?.role === 'super_admin'
  const [members, setMembers] = useState([])
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  const load = (q = '') => {
    setLoading(true)
    api.get('/members/?search=' + q + '&limit=100').then(r => {
      setMembers(r.data.members); setTotal(r.data.total)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const toggleActive = async (id) => { await api.patch('/members/' + id + '/activate'); load(search) }
  const changeRole = async (id, role) => { await api.patch('/members/' + id + '/role?role=' + role); load(search) }
  const exportExcel = () => window.open('/api/members/export/excel', '_blank')
  const resetPassword = async (id, name) => {
    const pw = prompt(`Enter new password for ${name} (min 6 characters):`)
    if (!pw) return
    if (pw.length < 6) { alert('Password must be at least 6 characters'); return }
    try {
      const res = await api.patch('/members/' + id + '/reset-password?new_password=' + encodeURIComponent(pw))
      alert(res.data.message)
    } catch (e) { alert(e.response?.data?.detail || 'Failed to reset password') }
  }

  const ROLE_COLOR = { super_admin:'danger', admin:'warning', member:'gray', finance:'info' }

  return (
    <Layout title="Manage Members">
      <div className="page-header">
        <div className="flex justify-between items-center">
          <div><h2>Member Management</h2><p>{total} total registered members</p></div>
          {isSuperAdmin && <button className="btn btn-gold" onClick={exportExcel}>Export to Excel</button>}
        </div>
      </div>
      <div className="card" style={{marginBottom:24}}>
        <div style={{display:'flex',gap:12}}>
          <div className="search-box" style={{flex:1}}>
            <span className="icon">&#128269;</span>
            <input placeholder="Search by name or email..." value={search}
              onChange={e => setSearch(e.target.value)} onKeyDown={e => e.key === 'Enter' && load(search)} />
          </div>
          <button className="btn btn-primary" onClick={() => load(search)}>Search</button>
          <button className="btn btn-outline" onClick={() => { setSearch(''); load('') }}>Clear</button>
        </div>
      </div>
      <div className="card">
        {loading ? <div className="spinner spinner-navy" /> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Category</th><th>Chapter</th><th>Status</th><th>Role</th>{isSuperAdmin && <th>Actions</th>}</tr></thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id}>
                    <td style={{color:'var(--gray-400)',fontSize:12}}>{m.id}</td>
                    <td>
                      <button style={{background:'none',border:'none',cursor:'pointer',color:'var(--navy)',fontWeight:600,padding:0}} onClick={() => setSelected(m)}>
                        {m.first_name} {m.last_name}
                      </button>
                    </td>
                    <td style={{color:'var(--gray-600)',fontSize:13}}>{m.email}</td>
                    <td><span className="badge badge-info">{m.membership_category}</span></td>
                    <td>{m.chapter || '-'}</td>
                    <td><span className={'badge badge-' + (m.is_active ? 'success' : 'danger')}>{m.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td><span className={'badge badge-' + (ROLE_COLOR[m.role] || 'gray')}>{m.role}</span></td>
                    {isSuperAdmin && <td>
                      <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                        <button className={'btn btn-sm ' + (m.is_active ? 'btn-danger' : 'btn-success')} onClick={() => toggleActive(m.id)}>
                          {m.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button className='btn btn-sm btn-outline' onClick={() => resetPassword(m.id, m.first_name + ' ' + m.last_name)}>
                          Reset PW
                        </button>
                        <select style={{padding:'4px 6px',borderRadius:'var(--radius)',border:'1px solid var(--gray-200)',fontSize:12,cursor:'pointer'}}
                          value={m.role} onChange={e => changeRole(m.id, e.target.value)}>
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                          <option value="finance">Finance</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </div>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()} style={{maxWidth:800, maxHeight:'90vh', overflowY:'auto'}}>
            <div className="modal-header">
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                {selected.photo_url ? (
                  <img src={selected.photo_url} alt="photo" style={{width:48,height:48,borderRadius:'50%',objectFit:'cover'}} />
                ) : (
                  <div style={{width:48,height:48,borderRadius:'50%',background:'var(--navy)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:18}}>
                    {(selected.first_name?.[0] || '')}{(selected.last_name?.[0] || '')}
                  </div>
                )}
                <div>
                  <h3 style={{marginBottom:2}}>{selected.first_name} {selected.middle_name || ''} {selected.last_name}</h3>
                  <div style={{display:'flex',gap:8}}>
                    <span className={'badge badge-' + (selected.is_active ? 'success' : 'danger')}>{selected.is_active ? 'Active' : 'Inactive'}</span>
                    <span className={'badge badge-' + (ROLE_COLOR[selected.role] || 'gray')}>{selected.role}</span>
                  </div>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelected(null)}>X</button>
            </div>

            <div style={{fontSize:12,fontWeight:700,color:'var(--navy)',textTransform:'uppercase',letterSpacing:1,padding:'12px 0 6px',borderBottom:'2px solid var(--navy)'}}>Account</div>
            <div className="grid grid-2" style={{gap:0}}>
              {[['Email',selected.email],['Role',selected.role],['Status',selected.is_active ? 'Active' : 'Inactive'],['Registered',selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}) : '-']
              ].map(([label, value]) => (
                <div key={label} style={{padding:'8px 12px',borderBottom:'1px solid var(--gray-100)'}}>
                  <span style={{display:'block',fontSize:11,color:'var(--gray-400)',marginBottom:2}}>{label}</span>
                  <strong style={{fontSize:14}}>{value || '-'}</strong>
                </div>
              ))}
            </div>

            <div style={{fontSize:12,fontWeight:700,color:'var(--navy)',textTransform:'uppercase',letterSpacing:1,padding:'12px 0 6px',borderBottom:'2px solid var(--navy)',marginTop:8}}>Personal Information</div>
            <div className="grid grid-2" style={{gap:0}}>
              {[['First Name',selected.first_name],['Middle Name',selected.middle_name],['Last Name',selected.last_name],
                ['Date of Birth',selected.date_of_birth],['Gender',selected.gender],['Nationality',selected.nationality],
                ['State of Origin',selected.state_of_origin],['NIN',selected.nin]
              ].map(([label, value]) => (
                <div key={label} style={{padding:'8px 12px',borderBottom:'1px solid var(--gray-100)'}}>
                  <span style={{display:'block',fontSize:11,color:'var(--gray-400)',marginBottom:2}}>{label}</span>
                  <strong style={{fontSize:14}}>{value || '-'}</strong>
                </div>
              ))}
            </div>

            <div style={{fontSize:12,fontWeight:700,color:'var(--navy)',textTransform:'uppercase',letterSpacing:1,padding:'12px 0 6px',borderBottom:'2px solid var(--navy)',marginTop:8}}>Contact Information</div>
            <div className="grid grid-2" style={{gap:0}}>
              {[['Phone (Primary)',selected.phone_primary],['Phone (Alternate)',selected.phone_alternate],
                ['Address',selected.address],['City',selected.city],['State of Residence',selected.state_of_residence]
              ].map(([label, value]) => (
                <div key={label} style={{padding:'8px 12px',borderBottom:'1px solid var(--gray-100)'}}>
                  <span style={{display:'block',fontSize:11,color:'var(--gray-400)',marginBottom:2}}>{label}</span>
                  <strong style={{fontSize:14}}>{value || '-'}</strong>
                </div>
              ))}
            </div>

            <div style={{fontSize:12,fontWeight:700,color:'var(--navy)',textTransform:'uppercase',letterSpacing:1,padding:'12px 0 6px',borderBottom:'2px solid var(--navy)',marginTop:8}}>Education</div>
            <div className="grid grid-2" style={{gap:0}}>
              {[['Entry Year',selected.entry_year],['Graduation Year',selected.graduation_year],
                ['House',selected.house],['Set Year',selected.set_year],
                ['Highest Qualification',selected.highest_qualification],['Institution After',selected.institution_after],
                ['Field of Study',selected.field_of_study],['Certifications',selected.certifications]
              ].map(([label, value]) => (
                <div key={label} style={{padding:'8px 12px',borderBottom:'1px solid var(--gray-100)'}}>
                  <span style={{display:'block',fontSize:11,color:'var(--gray-400)',marginBottom:2}}>{label}</span>
                  <strong style={{fontSize:14}}>{value || '-'}</strong>
                </div>
              ))}
            </div>

            <div style={{fontSize:12,fontWeight:700,color:'var(--navy)',textTransform:'uppercase',letterSpacing:1,padding:'12px 0 6px',borderBottom:'2px solid var(--navy)',marginTop:8}}>Professional</div>
            <div className="grid grid-2" style={{gap:0}}>
              {[['Occupation',selected.occupation],['Employer',selected.employer],
                ['Industry',selected.industry],['Years of Experience',selected.years_experience],
                ['LinkedIn',selected.linkedin],['Skills',selected.skills]
              ].map(([label, value]) => (
                <div key={label} style={{padding:'8px 12px',borderBottom:'1px solid var(--gray-100)'}}>
                  <span style={{display:'block',fontSize:11,color:'var(--gray-400)',marginBottom:2}}>{label}</span>
                  <strong style={{fontSize:14}}>{value || '-'}</strong>
                </div>
              ))}
            </div>

            <div style={{fontSize:12,fontWeight:700,color:'var(--navy)',textTransform:'uppercase',letterSpacing:1,padding:'12px 0 6px',borderBottom:'2px solid var(--navy)',marginTop:8}}>Family</div>
            <div className="grid grid-2" style={{gap:0}}>
              {[['Marital Status',selected.marital_status],['Number of Children',selected.num_children],['Spouse Name',selected.spouse_name]
              ].map(([label, value]) => (
                <div key={label} style={{padding:'8px 12px',borderBottom:'1px solid var(--gray-100)'}}>
                  <span style={{display:'block',fontSize:11,color:'var(--gray-400)',marginBottom:2}}>{label}</span>
                  <strong style={{fontSize:14}}>{value != null ? String(value) : '-'}</strong>
                </div>
              ))}
            </div>

            <div style={{fontSize:12,fontWeight:700,color:'var(--navy)',textTransform:'uppercase',letterSpacing:1,padding:'12px 0 6px',borderBottom:'2px solid var(--navy)',marginTop:8}}>Association</div>
            <div className="grid grid-2" style={{gap:0}}>
              {[['Membership Category',selected.membership_category],['Chapter',selected.chapter],
                ['Previous Roles',selected.previous_roles],['Areas of Interest',selected.areas_of_interest],
                ['Referral Source',selected.referral_source]
              ].map(([label, value]) => (
                <div key={label} style={{padding:'8px 12px',borderBottom:'1px solid var(--gray-100)'}}>
                  <span style={{display:'block',fontSize:11,color:'var(--gray-400)',marginBottom:2}}>{label}</span>
                  <strong style={{fontSize:14}}>{value || '-'}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
