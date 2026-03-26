import { useState, useEffect } from 'react'
import Layout from '../components/Layout'
import api from '../api'

export default function AdminReports() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.get('/messages/stats').then(r => setStats(r.data)).finally(() => setLoading(false)) }, [])
  if (loading) return <Layout title="Reports"><div className="spinner spinner-navy" /></Layout>
  const pct = (a, b) => b ? Math.round((a / b) * 100) : 0

  return (
    <Layout title="Reports and Analytics">
      <div className="page-header"><h2>Reports and Analytics</h2><p>Membership statistics and association activity overview.</p></div>
      <div className="grid grid-4" style={{marginBottom:28}}>
        {[
          { icon:'&#128101;', label:'Total Members', value:stats?.total_members, cls:'navy' },
          { icon:'&#9989;', label:'Active Members', value:stats?.active_members, cls:'green' },
          { icon:'&#9200;', label:'Inactive Members', value:stats?.inactive_members, cls:'red' },
          { icon:'&#128179;', label:'Pending Payments', value:stats?.pending_payments, cls:'gold' },
        ].map(({ icon, label, value, cls }) => (
          <div className="stat-card" key={label}>
            <div className={'stat-icon ' + cls} dangerouslySetInnerHTML={{__html:icon}} />
            <div><div className="stat-value">{value ?? 0}</div><div className="stat-label">{label}</div></div>
          </div>
        ))}
      </div>
      <div className="grid grid-2">
        <div className="card">
          <h3 style={{fontSize:18,marginBottom:20}}>Activation Rate</h3>
          {[
            { label:'Active', value: stats?.active_members, total: stats?.total_members, color:'var(--success)' },
            { label:'Inactive', value: stats?.inactive_members, total: stats?.total_members, color:'var(--danger)' },
          ].map(({ label, value, total, color }) => (
            <div key={label} style={{marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <span className="text-muted">{label} Members</span>
                <strong>{pct(value, total)}%</strong>
              </div>
              <div style={{height:12,background:'var(--gray-100)',borderRadius:8,overflow:'hidden'}}>
                <div style={{height:'100%',width: pct(value,total)+'%',background:color,borderRadius:8,transition:'width 1s ease'}} />
              </div>
            </div>
          ))}
        </div>
        <div className="card">
          <h3 style={{fontSize:18,marginBottom:20}}>Activity Summary</h3>
          {[
            { label:'Total Announcements', value:stats?.total_announcements },
            { label:'Broadcast Messages Sent', value:stats?.total_broadcasts },
            { label:'Payments Pending Review', value:stats?.pending_payments },
            { label:'Total Registered Members', value:stats?.total_members },
          ].map(({ label, value }) => (
            <div key={label} style={{display:'flex',justifyContent:'space-between',padding:'12px 0',borderBottom:'1px solid var(--gray-100)'}}>
              <span style={{fontSize:14}}>{label}</span>
              <strong style={{color:'var(--navy)',fontSize:18}}>{value ?? 0}</strong>
            </div>
          ))}
        </div>
        <div className="card" style={{gridColumn:'1/3'}}>
          <h3 style={{fontSize:18,marginBottom:20}}>Quick Actions</h3>
          <div className="grid grid-4">
            {[
              { label:'Export Member Database', action: () => window.open('/api/members/export/excel','_blank'), cls:'btn-gold' },
              { label:'Review Pending Payments', action: () => window.location.href='/admin/payments', cls:'btn-primary' },
              { label:'Post Announcement', action: () => window.location.href='/admin/announcements', cls:'btn-outline' },
              { label:'Broadcast Message', action: () => window.location.href='/admin/broadcast', cls:'btn-outline' },
            ].map(({ label, action, cls }) => (
              <button key={label} className={'btn ' + cls + ' btn-block'} onClick={action} style={{padding:'16px 8px',height:64,fontSize:13}}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
