import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import api from '../api'

export default function Profile() {
  const { user, setUser } = useAuth()
  const [form, setForm] = useState({})
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)
  const [photoFile, setPhotoFile] = useState(null)

  useEffect(() => {
    api.get('/members/me').then(r => setForm(r.data))
  }, [])

  const upd = (k, v) => setForm(f => ({...f, [k]: v}))
  const inp = (k) => ({ value: form[k] || '', onChange: e => upd(k, e.target.value), className: 'form-input' })
  const sel = (k) => ({ value: form[k] || '', onChange: e => upd(k, e.target.value), className: 'form-select' })

  const save = async () => {
    setSaving(true); setMsg(null)
    try {
      const res = await api.put('/members/me', form)
      setForm(res.data)
      setUser(u => ({...u, ...res.data}))
      setMsg({ type: 'success', text: 'Profile updated successfully!' })
    } catch (e) { setMsg({ type: 'danger', text: 'Failed to save. Try again.' }) }
    finally { setSaving(false) }
  }

  const uploadPhoto = async () => {
    if (!photoFile) return
    const fd = new FormData()
    fd.append('file', photoFile)
    const res = await api.post('/members/me/photo', fd)
    setForm(f => ({...f, photo_url: res.data.photo_url}))
    setUser(u => ({...u, photo_url: res.data.photo_url}))
    setPhotoFile(null)
  }

  const ngStates = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"]
  const initials = user ? (user.first_name?.[0] || '') + (user.last_name?.[0] || '') : 'U'

  return (
    <Layout title="My Profile">
      <div className="page-header">
        <h2>My Profile</h2>
        <p>Keep your membership information up to date.</p>
      </div>

      {msg && <div className={`alert alert-${msg.type}`} style={{marginBottom:20}}>{msg.text}</div>}

      <div className="grid grid-2" style={{gap:24,alignItems:'start'}}>
        <div style={{gridColumn:'1/3'}}>
          <div className="card" style={{display:'flex',alignItems:'center',gap:28,marginBottom:24}}>
            <div className="member-avatar" style={{width:88,height:88,fontSize:28,flexShrink:0}}>
              {form.photo_url ? <img src={form.photo_url} alt="" /> : initials.toUpperCase()}
            </div>
            <div>
              <h3 style={{marginBottom:4}}>{form.first_name} {form.last_name}</h3>
              <p className="text-muted" style={{marginBottom:12}}>{form.email} &bull; {form.membership_category}</p>
              <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
                <input type="file" accept="image/*" style={{display:'none'}} id="photoInput"
                  onChange={e => setPhotoFile(e.target.files[0])} />
                <label htmlFor="photoInput" className="btn btn-outline btn-sm" style={{cursor:'pointer'}}>Choose Photo</label>
                {photoFile && <button className="btn btn-gold btn-sm" onClick={uploadPhoto}>Upload</button>}
                {photoFile && <span className="text-muted" style={{fontSize:13,alignSelf:'center'}}>{photoFile.name}</span>}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{gridColumn:'1/3'}}>
          <div className="form-section-title">Personal Information</div>
          <div className="grid grid-3">
            <div className="form-group"><label className="form-label">First Name</label><input {...inp('first_name')} /></div>
            <div className="form-group"><label className="form-label">Middle Name</label><input {...inp('middle_name')} /></div>
            <div className="form-group"><label className="form-label">Last Name</label><input {...inp('last_name')} /></div>
          </div>
          <div className="grid grid-3">
            <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" {...inp('date_of_birth')} /></div>
            <div className="form-group"><label className="form-label">Gender</label>
              <select {...sel('gender')}><option value="">Select</option><option>Male</option><option>Female</option></select>
            </div>
            <div className="form-group"><label className="form-label">Nationality</label><input {...inp('nationality')} /></div>
          </div>
          <div className="grid grid-2">
            <div className="form-group"><label className="form-label">State of Origin</label>
              <select {...sel('state_of_origin')}><option value="">Select</option>{ngStates.map(s => <option key={s}>{s}</option>)}</select>
            </div>
            <div className="form-group"><label className="form-label">Marital Status</label>
              <select {...sel('marital_status')}><option value="">Select</option><option>Single</option><option>Married</option><option>Divorced</option><option>Widowed</option></select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="form-section-title">Contact Information</div>
          <div className="form-group"><label className="form-label">Primary Phone</label><input type="tel" {...inp('phone_primary')} /></div>
          <div className="form-group"><label className="form-label">Alternate Phone</label><input type="tel" {...inp('phone_alternate')} /></div>
          <div className="form-group"><label className="form-label">Address</label><textarea {...inp('address')} className="form-textarea" rows={3} /></div>
          <div className="grid grid-2">
            <div className="form-group"><label className="form-label">City</label><input {...inp('city')} /></div>
            <div className="form-group"><label className="form-label">State of Residence</label>
              <select {...sel('state_of_residence')}><option value="">Select</option>{ngStates.map(s => <option key={s}>{s}</option>)}</select>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="form-section-title">Educational Background</div>
          <div className="grid grid-2">
            <div className="form-group"><label className="form-label">Year of Entry</label><input {...inp('entry_year')} /></div>
            <div className="form-group"><label className="form-label">Graduation Year</label><input {...inp('graduation_year')} /></div>
          </div>
          <div className="grid grid-2">
            <div className="form-group"><label className="form-label">Set Year</label><input {...inp('set_year')} /></div>
            <div className="form-group"><label className="form-label">House</label><input {...inp('house')} /></div>
          </div>
          <div className="form-group"><label className="form-label">Highest Qualification</label>
            <select {...sel('highest_qualification')}><option value="">Select</option><option>WAEC/SSCE</option><option>OND</option><option>HND</option><option>B.Sc</option><option>M.Sc/MBA</option><option>Ph.D</option><option>Other</option></select>
          </div>
          <div className="form-group"><label className="form-label">Field of Study</label><input {...inp('field_of_study')} /></div>
          <div className="form-group"><label className="form-label">Institution After Lautai</label><input {...inp('institution_after')} /></div>
        </div>

        <div className="card">
          <div className="form-section-title">Professional Information</div>
          <div className="form-group"><label className="form-label">Occupation</label><input {...inp('occupation')} /></div>
          <div className="form-group"><label className="form-label">Employer</label><input {...inp('employer')} /></div>
          <div className="form-group"><label className="form-label">Industry</label>
            <select {...sel('industry')}><option value="">Select</option><option>Agriculture</option><option>Banking and Finance</option><option>Construction</option><option>Education</option><option>Energy</option><option>Government</option><option>Healthcare</option><option>Technology</option><option>Legal</option><option>Oil and Gas</option><option>Real Estate</option><option>Other</option></select>
          </div>
          <div className="grid grid-2">
            <div className="form-group"><label className="form-label">Years of Experience</label>
              <select {...sel('years_experience')}><option value="">Select</option><option>0-2 years</option><option>3-5 years</option><option>6-10 years</option><option>11-20 years</option><option>20+ years</option></select>
            </div>
            <div className="form-group"><label className="form-label">LinkedIn URL</label><input type="url" {...inp('linkedin')} /></div>
          </div>
          <div className="form-group"><label className="form-label">Skills</label><textarea {...inp('skills')} className="form-textarea" rows={2} /></div>
        </div>

        <div className="card">
          <div className="form-section-title">Association Details</div>
          <div className="grid grid-2">
            <div className="form-group"><label className="form-label">Membership Category</label>
              <select {...sel('membership_category')}><option>Regular</option><option>Life</option><option>Honorary</option><option>Student</option></select>
            </div>
            <div className="form-group"><label className="form-label">Chapter</label><input {...inp('chapter')} /></div>
          </div>
          <div className="form-group"><label className="form-label">Previous LOBA Roles</label><textarea {...inp('previous_roles')} className="form-textarea" rows={2} /></div>
          <div className="form-group"><label className="form-label">Areas of Interest</label><textarea {...inp('areas_of_interest')} className="form-textarea" rows={2} /></div>
        </div>
      </div>

      <div style={{marginTop:24,display:'flex',justifyContent:'flex-end'}}>
        <button className="btn btn-primary btn-lg" onClick={save} disabled={saving}>
          {saving ? <><span className="spinner"></span> Saving...</> : 'Save Changes'}
        </button>
      </div>
    </Layout>
  )
}
