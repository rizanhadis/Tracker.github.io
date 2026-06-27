import { useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import TopBar from './components/Layout/TopBar'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import Team from './pages/Team'
import TimeTracker from './pages/TimeTracker'
import Reports from './pages/Reports'
import CalendarPage from './pages/Calendar'

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="app-layout">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />
      <div className={`main-wrapper ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <TopBar
          collapsed={sidebarCollapsed}
          onNewProject={() => navigate('/projects')}
          onStartTimer={() => navigate('/timer')}
        />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/team" element={<Team />} />
            <Route path="/timer" element={<TimeTracker />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/calendar" element={<CalendarPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}
