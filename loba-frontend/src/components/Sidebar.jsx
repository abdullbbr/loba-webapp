import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NavItem = ({ to, icon, label }) => (
  <NavLink to={to} className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
    <span className='icon'>{icon}</span>
    {label}
  </NavLink>
)

export default function Sidebar() {
  const { user, logout, isAdmin, isFinance } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user ? (user.first_name[0] + user.last_name[0]).toUpperCase() : 'LO'

  return (
    <aside className='sidebar'>
      <div className='sidebar-logo'>
        <h1>LOBA</h1>
        <p>Lautai Old Boys Association 2016</p>
      </div>

      <nav className='sidebar-nav'>
        <div className='nav-section-label'>Member</div>
        <NavItem to='/dashboard' icon='🏠' label='Dashboard' />
        <NavItem to='/profile' icon='👤' label='My Profile' />
        <NavItem to='/payment' icon='💳' label='Payment' />
        <NavItem to='/announcements' icon='📢' label='Announcements' />
        <NavItem to='/directory' icon='📖' label='Member Directory' />
        <NavItem to='/messages' icon='💬' label='Messages' />

        {isFinance() && (
          <>
            <div className='nav-section-label' style={{marginTop: 8}}>Finance</div>
            <NavItem to='/finance/dashboard' icon='🏦' label='Finance Dashboard' />
            <NavItem to='/finance/expenses' icon='📋' label='Expense Requests' />
            <NavItem to='/finance/broadcast' icon='📡' label='Contribution Msg' />
          </>
        )}

        {isAdmin() && (
          <>
            <div className='nav-section-label' style={{marginTop: 8}}>Administration</div>
            <NavItem to='/admin/members' icon='👥' label='Manage Members' />
            <NavItem to='/admin/payments' icon='💰' label='Review Payments' />
            <NavItem to='/admin/announcements' icon='📝' label='Manage Posts' />
            <NavItem to='/admin/broadcast' icon='📡' label='Broadcast Message' />
            <NavItem to='/admin/reports' icon='📊' label='Reports' />
          </>
        )}
      </nav>

      <div className='sidebar-footer'>
        <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
          <div className='user-avatar' style={{width:36,height:36}}>
            {user?.photo_url ? <img src={user.photo_url} alt='avatar' /> : initials}
          </div>
          <div>
            <div style={{color:'#fff',fontSize:13,fontWeight:600}}>{user?.first_name} {user?.last_name}</div>
            <div style={{color:'rgba(255,255,255,0.4)',fontSize:11}}>{user?.role}</div>
          </div>
        </div>
        <button className='btn btn-outline btn-sm btn-block' style={{borderColor:'rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.6)'}} onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
