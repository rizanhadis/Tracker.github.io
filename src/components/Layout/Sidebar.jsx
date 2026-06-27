import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FolderKanban, Users, Timer, BarChart3,
  CalendarDays, ChevronLeft, ChevronRight, Zap
} from 'lucide-react'

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/projects', icon: FolderKanban, label: 'Proyek' },
  { path: '/team', icon: Users, label: 'Tim' },
  { path: '/timer', icon: Timer, label: 'Time Tracker' },
  { path: '/reports', icon: BarChart3, label: 'Laporan' },
  { path: '/calendar', icon: CalendarDays, label: 'Kalender' },
]

export default function Sidebar({ collapsed, onToggle }) {
  const location = useLocation()

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Zap size={18} />
        </div>
        <div className="sidebar-brand">
          <span>InProTim</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-title">Menu Utama</div>
        {navItems.map(item => {
          const Icon = item.icon
          const isActive = item.path === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(item.path)

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={20} />
              <span className="nav-label">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-logo" style={{ width: 32, height: 32, fontSize: '0.75rem' }}>
          <Zap size={14} />
        </div>
        <div className="sidebar-footer-text">
          <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nyawit IT</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>v1.0.0</div>
        </div>
      </div>
    </aside>
  )
}
