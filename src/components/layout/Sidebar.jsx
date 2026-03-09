import { NavLink } from 'react-router-dom'

const NAV_ITEMS = [
  { to: '/dashboard', page: 'dashboard', icon: 'fa-th-large', label: 'Dashboard' },
  { to: '/users', page: 'users', icon: 'fa-users', label: 'Users' },
  { to: '/workers', page: 'workers', icon: 'fa-user-cog', label: 'Workers' },
  { to: '/verification', page: 'verification', icon: 'fa-id-card', label: 'Verification' },
  { to: '/bookings', page: 'bookings', icon: 'fa-calendar-check', label: 'Bookings' },
  { to: '/payments', page: 'payments', icon: 'fa-credit-card', label: 'Payments' },
  { to: '/reviews', page: 'reviews', icon: 'fa-star', label: 'Reviews' },
  { to: '/reports', page: 'reports', icon: 'fa-chart-bar', label: 'Reports' },
  { to: '/settings', page: 'settings', icon: 'fa-cog', label: 'Settings' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">HomeEaseAdmin</div>
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
      </nav>
    </aside>
  )
}
