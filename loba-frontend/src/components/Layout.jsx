import Sidebar from './Sidebar'
import { useAuth } from '../context/AuthContext'

export default function Layout({ title, children }) {
  const { user } = useAuth()
  const initials = user ? (user.first_name[0] + user.last_name[0]).toUpperCase() : 'U'
  return (
    <div className='app-layout'>
      <Sidebar />
      <div className='main-content'>
        <header className='topbar'>
          <span className='topbar-title'>{title}</span>
          <div className='topbar-user'>
            <span style={{fontSize:13, color:'var(--gray-600)'}}>Welcome, {user?.first_name}</span>
            <div className='user-avatar'>
              {user?.photo_url ? <img src={user.photo_url} alt='' /> : initials}
            </div>
          </div>
        </header>
        <main className='page-body'>{children}</main>
      </div>
    </div>
  )
}
