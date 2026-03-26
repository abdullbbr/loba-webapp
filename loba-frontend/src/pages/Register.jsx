import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

const STEPS = ['Account', 'Personal', 'Contact', 'Education', 'Professional', 'Association']
const ngStates = ["Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno","Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT","Gombe","Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos","Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto","Taraba","Yobe","Zamfara"]

export default function Register() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({
    email:'', password:'', confirm_password:'', first_name:'', middle_name:'', last_name:'',
    date_of_birth:'', gender:'', nationality:'Nigeria', state_of_origin:'', nin:'',
    phone_primary:'', phone_alternate:'', address:'', city:'', state_of_residence:'',
    entry_year:'', graduation_year:'', house:'', set_year:'', highest_qualification:'',
    institution_after:'', field_of_study:'', certifications:'', occupation:'', employer:'',
    industry:'', years_experience:'', linkedin:'', skills:'',
    membership_category:'Regular', chapter:'', previous_roles:'', areas_of_interest:'', referral_source:''
  })

  const upd = (k,v) => setForm(f => ({...f, [k]: v}))
  const inp = (k) => ({ value: form[k], onChange: e => upd(k, e.target.value), className:'form-input' })
  const sel = (k) => ({ value: form[k], onChange: e => upd(k, e.target.value), className:'form-select' })

  const next = async () => {
    if (step === 0) {
      if (!form.email || !form.password) { setError('Email and password required'); return }
      if (form.password !== form.confirm_password) { setError('Passwords do not match'); return }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    }
    if (step === 1 && (!form.first_name || !form.last_name)) { setError('First and last name required'); return }
    setError('')
    if (step < STEPS.length - 1) { setStep(s => s+1); return }
    setLoading(true)
    try {
      await api.post('/auth/register', { email: form.email, password: form.password,
        first_name: form.first_name, last_name: form.last_name,
        middle_name: form.middle_name, phone_primary: form.phone_primary })
      setSuccess(true)
    } catch (e) { setError(e.response?.data?.detail || 'Registration failed'); setStep(0) }
    finally { setLoading(false) }
  }

  if (success) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:'var(--cream)'}}>
      <div className="card" style={{maxWidth:480,textAlign:'center',padding:48}}>
        <h2 style={{marginBottom:12}}>Registration Successful!</h2>
        <p style={{color:'var(--gray-600)',marginBottom:24}}>Log in and submit proof of payment to activate your membership.</p>
        <Link to="/login" className="btn btn-primary btn-block">Proceed to Login</Link>
      </div>
    </div>
  )

  const sc = (i) => ({
    width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
    fontSize:13,fontWeight:700,flexShrink:0,
    background: i < step ? 'var(--navy)' : 'transparent',
    border: '2px solid ' + (i <= step ? 'var(--navy)' : 'var(--gray-200)'),
    color: i < step ? 'white' : i === step ? 'var(--navy)' : 'var(--gray-400)'
  })

  return (
    <div className="register-page">
      <div className="register-header">
        <h1>LOBA</h1>
        <Link to="/login" style={{color:'rgba(255,255,255,0.6)',fontSize:14}}>Already a member? Sign in</Link>
      </div>
      <div className="register-body">
        <h2 style={{marginBottom:8}}>New Member Registration</h2>
        <p style={{color:'var(--gray-600)',marginBottom:32}}>Complete all steps to create your LOBA membership profile.</p>
        <div style={{display:'flex',alignItems:'center',marginBottom:32,overflowX:'auto',paddingBottom:4}}>
          {STEPS.map((s, i) => (
            <div key={s} style={{display:'flex',alignItems:'center',flex: i < STEPS.length-1 ? 1 : 'none',minWidth:'fit-content'}}>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <div style={sc(i)}>{i < step ? 'v' : i+1}</div>
                <span style={{fontSize:12,color: i<=step ? 'var(--navy)' : 'var(--gray-400)',fontWeight: i===step ? 600 : 400,whiteSpace:'nowrap'}}>{s}</span>
              </div>
              {i < STEPS.length-1 && <div style={{flex:1,height:2,background: i<step ? 'var(--navy)' : 'var(--gray-200)',margin:'0 8px',minWidth:20}} />}
            </div>
          ))}
        </div>
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="card">
          {step === 0 && <div>
            <div className="form-section-title">Account Setup</div>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Email *</label><input type="email" {...inp('email')} /></div>
              <div className="form-group"><label className="form-label">Password *</label><input type="password" {...inp('password')} /></div>
            </div>
            <div className="form-group"><label className="form-label">Confirm Password *</label><input type="password" {...inp('confirm_password')} /></div>
          </div>}
          {step === 1 && <div>
            <div className="form-section-title">Personal Information</div>
            <div className="grid grid-3">
              <div className="form-group"><label className="form-label">First Name *</label><input {...inp('first_name')} /></div>
              <div className="form-group"><label className="form-label">Middle Name</label><input {...inp('middle_name')} /></div>
              <div className="form-group"><label className="form-label">Last Name *</label><input {...inp('last_name')} /></div>
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
              <div className="form-group"><label className="form-label">NIN</label><input {...inp('nin')} /></div>
            </div>
          </div>}
          {step === 2 && <div>
            <div className="form-section-title">Contact Information</div>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Primary Phone</label><input type="tel" {...inp('phone_primary')} placeholder="+234..." /></div>
              <div className="form-group"><label className="form-label">Alternate Phone</label><input type="tel" {...inp('phone_alternate')} /></div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><textarea {...inp('address')} className="form-textarea" rows={2} /></div>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">City</label><input {...inp('city')} /></div>
              <div className="form-group"><label className="form-label">State of Residence</label>
                <select {...sel('state_of_residence')}><option value="">Select</option>{ngStates.map(s => <option key={s}>{s}</option>)}</select>
              </div>
            </div>
          </div>}
          {step === 3 && <div>
            <div className="form-section-title">Educational Background</div>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Year of Entry</label><input {...inp('entry_year')} placeholder="e.g. 2005" /></div>
              <div className="form-group"><label className="form-label">Graduation Year</label><input {...inp('graduation_year')} placeholder="e.g. 2012" /></div>
            </div>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Set Year</label><input {...inp('set_year')} /></div>
              <div className="form-group"><label className="form-label">House</label><input {...inp('house')} /></div>
            </div>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Highest Qualification</label>
                <select {...sel('highest_qualification')}><option value="">Select</option><option>WAEC/SSCE</option><option>OND</option><option>HND</option><option>B.Sc</option><option>M.Sc/MBA</option><option>Ph.D</option><option>Other</option></select>
              </div>
              <div className="form-group"><label className="form-label">Field of Study</label><input {...inp('field_of_study')} /></div>
            </div>
            <div className="form-group"><label className="form-label">Institution After Lautai</label><input {...inp('institution_after')} /></div>
            <div className="form-group"><label className="form-label">Certifications</label><textarea {...inp('certifications')} className="form-textarea" rows={2} /></div>
          </div>}
          {step === 4 && <div>
            <div className="form-section-title">Professional Information</div>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Occupation</label><input {...inp('occupation')} /></div>
              <div className="form-group"><label className="form-label">Employer</label><input {...inp('employer')} /></div>
            </div>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Industry</label>
                <select {...sel('industry')}><option value="">Select</option><option>Agriculture</option><option>Banking and Finance</option><option>Construction</option><option>Education</option><option>Energy</option><option>Government</option><option>Healthcare</option><option>Technology</option><option>Legal</option><option>Oil and Gas</option><option>Real Estate</option><option>Other</option></select>
              </div>
              <div className="form-group"><label className="form-label">Years of Experience</label>
                <select {...sel('years_experience')}><option value="">Select</option><option>0-2 years</option><option>3-5 years</option><option>6-10 years</option><option>11-20 years</option><option>20+ years</option></select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">LinkedIn URL</label><input type="url" {...inp('linkedin')} placeholder="https://linkedin.com/in/..." /></div>
            <div className="form-group"><label className="form-label">Skills</label><textarea {...inp('skills')} className="form-textarea" rows={2} /></div>
          </div>}
          {step === 5 && <div>
            <div className="form-section-title">Association Details</div>
            <div className="grid grid-2">
              <div className="form-group"><label className="form-label">Membership Category</label>
                <select {...sel('membership_category')}><option>Regular</option><option>Life</option><option>Honorary</option><option>Student</option></select>
              </div>
              <div className="form-group"><label className="form-label">Chapter</label><input {...inp('chapter')} placeholder="e.g. Lagos, Abuja..." /></div>
            </div>
            <div className="form-group"><label className="form-label">Previous LOBA Roles</label><textarea {...inp('previous_roles')} className="form-textarea" rows={2} /></div>
            <div className="form-group"><label className="form-label">Areas of Interest</label><textarea {...inp('areas_of_interest')} className="form-textarea" rows={2} /></div>
            <div className="form-group"><label className="form-label">How did you hear about LOBA?</label>
              <select {...sel('referral_source')}><option value="">Select</option><option>Fellow Alumni</option><option>Social Media</option><option>School Event</option><option>Family Member</option><option>Other</option></select>
            </div>
            <div className="alert alert-info" style={{marginTop:16}}>After registration, log in and submit proof of payment to activate your account.</div>
          </div>}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:32,paddingTop:24,borderTop:'1px solid var(--gray-100)'}}>
            <button className="btn btn-outline" onClick={() => setStep(s => s-1)} disabled={step === 0}>Back</button>
            <button className="btn btn-primary btn-lg" onClick={next} disabled={loading}>
              {loading ? 'Submitting...' : step === STEPS.length-1 ? 'Complete Registration' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
