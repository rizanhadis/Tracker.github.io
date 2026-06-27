import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Avatar from '../components/UI/Avatar'
import {
  FolderKanban, CheckSquare, Clock, Users,
  TrendingUp, ArrowRight, Calendar
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const { projects, tasks, members, timeEntries, formatDuration, getTotalDuration } = useApp()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const activeTasks = tasks.filter(t => t.status !== 'Done').length
    const totalHours = getTotalDuration(timeEntries)
    const now = new Date()
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisWeekEntries = timeEntries.filter(e => new Date(e.startTime) >= weekAgo)
    const weekHours = getTotalDuration(thisWeekEntries)

    return {
      totalProjects: projects.length,
      activeTasks,
      weekHours,
      totalHours,
      totalMembers: members.length
    }
  }, [projects, tasks, members, timeEntries, getTotalDuration])

  const weeklyChart = useMemo(() => {
    const days = []
    const now = new Date()
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStr = date.toISOString().split('T')[0]
      const dayEntries = timeEntries.filter(e => e.startTime.startsWith(dayStr))
      const totalSec = dayEntries.reduce((sum, e) => sum + (e.duration || 0), 0)
      days.push({
        name: date.toLocaleDateString('id-ID', { weekday: 'short' }),
        jam: +(totalSec / 3600).toFixed(1)
      })
    }
    return days
  }, [timeEntries])

  const recentProjects = useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 3)
  }, [projects])

  const upcomingDeadlines = useMemo(() => {
    const now = new Date()
    return tasks
      .filter(t => t.deadline && t.status !== 'Done' && new Date(t.deadline) >= now)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 5)
  }, [tasks])

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-secondary mt-sm">Selamat datang kembali! Ini ringkasan proyek Anda.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid-4 stagger-children mb-lg">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(124,58,237,0.15)' }}>
            <FolderKanban size={22} style={{ color: 'var(--primary)' }} />
          </div>
          <div className="stat-value text-gradient">{stats.totalProjects}</div>
          <div className="stat-label">Total Proyek</div>
          <div className="stat-bg-icon"><FolderKanban size={80} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.15)' }}>
            <CheckSquare size={22} style={{ color: 'var(--warning)' }} />
          </div>
          <div className="stat-value" style={{ color: 'var(--warning)' }}>{stats.activeTasks}</div>
          <div className="stat-label">Task Aktif</div>
          <div className="stat-bg-icon"><CheckSquare size={80} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(6,182,212,0.15)' }}>
            <Clock size={22} style={{ color: 'var(--accent)' }} />
          </div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{formatDuration(stats.weekHours)}</div>
          <div className="stat-label">Jam Kerja Minggu Ini</div>
          <div className="stat-bg-icon"><Clock size={80} /></div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)' }}>
            <Users size={22} style={{ color: 'var(--success)' }} />
          </div>
          <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.totalMembers}</div>
          <div className="stat-label">Anggota Tim</div>
          <div className="stat-bg-icon"><Users size={80} /></div>
        </div>
      </div>

      {/* Charts & Activity */}
      <div className="grid-2 mb-lg">
        {/* Weekly Hours Chart */}
        <div className="card-static">
          <div className="flex items-center justify-between mb-md">
            <h3>Jam Kerja 7 Hari Terakhir</h3>
            <TrendingUp size={18} className="text-secondary" />
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="var(--text-tertiary)" fontSize={12} />
                <YAxis stroke="var(--text-tertiary)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)'
                  }}
                  formatter={(value) => [`${value} jam`, 'Jam Kerja']}
                />
                <Bar dataKey="jam" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="100%" stopColor="#2563eb" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="card-static">
          <div className="flex items-center justify-between mb-md">
            <h3>Deadline Mendatang</h3>
            <Calendar size={18} className="text-secondary" />
          </div>
          <div className="flex flex-col gap-sm">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-secondary text-sm">Tidak ada deadline mendatang</p>
            ) : (
              upcomingDeadlines.map(task => {
                const project = projects.find(p => p.id === task.projectId)
                const daysLeft = Math.ceil((new Date(task.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                return (
                  <div key={task.id} className="flex items-center justify-between" style={{
                    padding: '10px 14px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)'
                  }}>
                    <div className="flex items-center gap-sm">
                      <div style={{
                        width: 4,
                        height: 32,
                        borderRadius: 2,
                        background: project?.color || 'var(--primary)'
                      }} />
                      <div>
                        <div className="text-sm font-medium">{task.title}</div>
                        <div className="text-xs text-muted">{project?.name}</div>
                      </div>
                    </div>
                    <span className={`badge ${daysLeft <= 3 ? 'badge-urgent' : daysLeft <= 7 ? 'badge-medium' : 'badge-low'}`}>
                      {daysLeft <= 0 ? 'Hari ini' : `${daysLeft} hari`}
                    </span>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Projects */}
      <div className="flex items-center justify-between mb-md">
        <h3>Proyek Terbaru</h3>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
          Lihat Semua <ArrowRight size={14} />
        </button>
      </div>
      <div className="grid-3 stagger-children">
        {recentProjects.map(project => {
          const projectTasks = tasks.filter(t => t.projectId === project.id)
          const doneTasks = projectTasks.filter(t => t.status === 'Done').length
          const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0
          const projectMembers = members.filter(m => project.memberIds.includes(m.id))

          return (
            <div key={project.id} className="card" onClick={() => navigate(`/projects/${project.id}`)} style={{ cursor: 'pointer' }}>
              <div className="flex items-center gap-sm mb-md">
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: 'var(--radius-full)',
                  background: project.color
                }} />
                <span className={`badge badge-${project.status.toLowerCase()}`}>{project.status}</span>
              </div>
              <h4 className="mb-sm">{project.name}</h4>
              <p className="text-sm text-secondary mb-md" style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden'
              }}>{project.description}</p>

              <div className="progress-bar mb-sm">
                <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-muted mb-md">
                <span>{doneTasks}/{projectTasks.length} task selesai</span>
                <span>{progress}%</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="avatar-group">
                  {projectMembers.slice(0, 3).map(m => (
                    <Avatar key={m.id} name={m.name} size="sm" />
                  ))}
                  {projectMembers.length > 3 && (
                    <div className="avatar avatar-sm" style={{ background: 'var(--bg-tertiary)', fontSize: '0.6rem' }}>
                      +{projectMembers.length - 3}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted flex items-center gap-xs">
                  <Calendar size={12} />
                  {new Date(project.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
