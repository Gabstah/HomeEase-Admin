import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import homeEaseLogo from '../Assets/HomeEase Logo.jpg'

const NAV_ITEMS = [
  { to: '/dashboard', page: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { to: '/users', page: 'users', icon: 'fa-users', label: 'Users' },
  { to: '/workers', page: 'workers', icon: 'fa-user-cog', label: 'Workers' },
  { to: '/verification', page: 'verification', icon: 'fa-id-card', label: 'Verification' },
  { to: '/price-control', page: 'price-control', icon: 'fa-sliders', label: 'Price Control' },
  { to: '/bookings', page: 'bookings', icon: 'fa-calendar-check', label: 'Bookings' },
  { to: '/payments', page: 'payments', icon: 'fa-credit-card', label: 'Payments' },
  { to: '/reviews', page: 'reviews', icon: 'fa-star', label: 'Reviews' },
  { to: '/reports', page: 'reports', icon: 'fa-chart-bar', label: 'Reports' },
  
  
  //{ to: '/settings', page: 'settings', icon: 'fa-cog', label: 'Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleConfirmLogout = () => {
    setShowLogoutModal(false)
    navigate('/login')
  }

  const handleCancelLogout = () => {
    setShowLogoutModal(false)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-content">
          <img src={homeEaseLogo} alt="HomeEase Logo" className="sidebar-logo" />
          <span>HomeEase</span>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, page, icon, label }) => (
          <NavLink
            key={page}
            to={to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            data-page={page}
          >
            <i className={`fas ${icon}`} />
            <span>{label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={handleLogoutClick}
          className="nav-item"
          data-page="logout"
          style={{
            marginTop: 'auto',
            borderTop: '1px solid var(--border)',
            paddingTop: '1rem',
            width: '100%',
            background: 'none',
            border: 'none',
            textAlign: 'left',
          }}
        >
          <i className="fas fa-right-from-bracket" />
          <span>Logout</span>
        </button>
      </nav>
      {showLogoutModal && (
        <div className="modal-backdrop">
          <div className="modal">
            <h2 className="modal-title">Log out</h2>
            <p className="modal-body">Are you sure you want to log out of HomeEaseAdmin?</p>
            <div className="modal-actions">
              <button type="button" className="btn btn-outline" onClick={handleCancelLogout}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
