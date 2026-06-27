import { useLocation } from 'react-router-dom'
import { Search, Plus, Timer } from 'lucide-react'

const pageTitles = {
  '/': 'Dashboard',
  '/projects': 'Proyek',
  '/team': 'Tim',
  '/timer': 'Time Tracker',
  '/reports': 'Laporan',
  '/calendar': 'Kalender',
}

export default function TopBar({ collapsed, onNewProject, onStartTimer }) {
  const location = useLocation()

  const title = Object.entries(pageTitles).find(
    ([path]) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
  )?.[1] || 'InProTim'

  return (
    <header className={`topbar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="topbar-left">
        <h2 className="topbar-title">{title}</h2>
        <div className="topbar-search">
          <Search size={16} />
          <input type="text" placeholder="Cari proyek, task, anggota..." id="search-input" />
        </div>
      </div>
      <div className="topbar-right">
        <button className="btn btn-ghost btn-sm" onClick={onStartTimer} id="quick-timer-btn">
          <Timer size={16} />
          <span>Timer</span>
        </button>
        <button className="btn btn-primary btn-sm" onClick={onNewProject} id="quick-new-project-btn">
          <Plus size={16} />
          <span>Proyek Baru</span>
        </button>
      </div>
    </header>
  )
}
