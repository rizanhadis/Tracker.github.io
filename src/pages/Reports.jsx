import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from '../components/UI/Avatar'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'
import { Calendar, Filter } from 'lucide-react'

const CHART_COLORS = ['#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316']

export default function Reports() {
  const { projects, tasks, members, timeEntries, formatDuration, getTotalDuration } = useApp()
  const [period, setPeriod] = useState('month')
  const [filterProject, setFilterProject] = useState('')
  const [filterMember, setFilterMember] = useState('')

  const filteredEntries = useMemo(() => {
    const now = new Date()
    let cutoff
    if (period === 'week') cutoff = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    else if (period === 'month') cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    else cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

    return timeEntries.filter(e => {
      if (new Date(e.startTime) < cutoff) return false
      if (filterProject && e.projectId !== filterProject) return false
      if (filterMember && e.memberId !== filterMember) return false
      return true
    })
  }, [timeEntries, period, filterProject, filterMember])

  // Hours per project (bar chart)
  const projectHours = useMemo(() => {
    const map = {}
    filteredEntries.forEach(e => {
      if (!map[e.projectId]) map[e.projectId] = 0
      map[e.projectId] += e.duration || 0
    })
    return Object.entries(map).map(([id, dur]) => {
      const project = projects.find(p => p.id === id)
      return { name: project?.name || 'Unknown', jam: +(dur / 3600).toFixed(1), color: project?.color }
    }).sort((a, b) => b.jam - a.jam)
  }, [filteredEntries, projects])

  // Distribution pie chart
  const distribution = useMemo(() => {
    const map = {}
    filteredEntries.forEach(e => {
      if (!map[e.projectId]) map[e.projectId] = 0
      map[e.projectId] += e.duration || 0
    })
    return Object.entries(map).map(([id, dur], i) => {
      const project = projects.find(p => p.id === id)
      return { name: project?.name || 'Unknown', value: +(dur / 3600).toFixed(1), color: project?.color || CHART_COLORS[i % CHART_COLORS.length] }
    })
  }, [filteredEntries, projects])

  // Project progress
  const projectProgress = useMemo(() => {
    return projects.map(p => {
      const pTasks = tasks.filter(t => t.projectId === p.id)
      const done = pTasks.filter(t => t.status === 'Done').length
      const progress = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0
      const pEntries = filteredEntries.filter(e => e.projectId === p.id)
      const totalTime = getTotalDuration(pEntries)
      return { ...p, totalTasks: pTasks.length, doneTasks: done, progress, totalTime }
    })
  }, [projects, tasks, filteredEntries, getTotalDuration])

  // Member stats
  const memberStats = useMemo(() => {
    return members.map(m => {
      const mEntries = filteredEntries.filter(e => e.memberId === m.id)
      const totalTime = getTotalDuration(mEntries)
      const mTasks = tasks.filter(t => t.assigneeId === m.id)
      const doneTasks = mTasks.filter(t => t.status === 'Done').length
      return { ...m, totalTime, totalTasks: mTasks.length, doneTasks }
    }).sort((a, b) => b.totalTime - a.totalTime)
  }, [members, filteredEntries, tasks, getTotalDuration])

  const totalFiltered = getTotalDuration(filteredEntries)

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Laporan</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-md mb-lg" style={{ flexWrap: 'wrap' }}>
        <div className="tabs" style={{ marginBottom: 0 }}>
          {[
            { key: 'week', label: 'Minggu' },
            { key: 'month', label: 'Bulan' },
            { key: 'quarter', label: '3 Bulan' }
          ].map(p => (
            <button key={p.key} className={`tab ${period === p.key ? 'active' : ''}`}
              onClick={() => setPeriod(p.key)}>{p.label}</button>
          ))}
        </div>
        <select className="form-select" value={filterProject}
          onChange={e => setFilterProject(e.target.value)}
          style={{ width: 180 }}>
          <option value="">Semua Proyek</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select className="form-select" value={filterMember}
          onChange={e => setFilterMember(e.target.value)}
          style={{ width: 180 }}>
          <option value="">Semua Anggota</option>
          {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <div className="flex items-center gap-sm text-sm text-secondary" style={{ marginLeft: 'auto' }}>
          Total: <strong className="text-gradient" style={{ fontSize: '1.1rem' }}>{formatDuration(totalFiltered)}</strong>
        </div>
      </div>

      {/* Charts */}
      <div className="grid-2 mb-lg">
        <div className="card-static">
          <h4 className="mb-md">Jam Kerja per Proyek</h4>
          <div style={{ height: 260 }}>
            {projectHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectHours} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="var(--text-tertiary)" fontSize={12} />
                  <YAxis type="category" dataKey="name" stroke="var(--text-tertiary)" fontSize={12} width={120} />
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', color: 'var(--text-primary)'
                    }}
                    formatter={(v) => [`${v} jam`, 'Jam Kerja']}
                  />
                  <Bar dataKey="jam" fill="url(#reportBarGradient)" radius={[0, 4, 4, 0]} />
                  <defs>
                    <linearGradient id="reportBarGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px' }}>
                <p className="text-sm">Tidak ada data untuk periode ini</p>
              </div>
            )}
          </div>
        </div>

        <div className="card-static">
          <h4 className="mb-md">Distribusi Waktu</h4>
          <div style={{ height: 260 }}>
            {distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={distribution} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                    dataKey="value" nameKey="name" paddingAngle={4}>
                    {distribution.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', color: 'var(--text-primary)'
                    }}
                    formatter={(v) => [`${v} jam`]}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state" style={{ padding: '40px' }}>
                <p className="text-sm">Tidak ada data untuk periode ini</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Project Progress */}
      <h3 className="mb-md">Progress Proyek</h3>
      <div className="table-wrapper mb-lg">
        <table className="table">
          <thead>
            <tr>
              <th>Proyek</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Task</th>
              <th>Jam Kerja</th>
              <th>Deadline</th>
            </tr>
          </thead>
          <tbody>
            {projectProgress.map(p => (
              <tr key={p.id}>
                <td>
                  <div className="flex items-center gap-sm">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: p.color }} />
                    <span className="font-medium text-sm">{p.name}</span>
                  </div>
                </td>
                <td><span className={`badge badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                <td style={{ minWidth: 140 }}>
                  <div className="flex items-center gap-sm">
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-bar-fill" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ width: 36 }}>{p.progress}%</span>
                  </div>
                </td>
                <td className="text-sm">{p.doneTasks}/{p.totalTasks}</td>
                <td className="text-sm font-semibold">{formatDuration(p.totalTime)}</td>
                <td className="text-sm text-secondary">
                  {p.deadline ? new Date(p.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Member Stats */}
      <h3 className="mb-md">Statistik Anggota</h3>
      <div className="grid-3 stagger-children">
        {memberStats.map(m => (
          <div key={m.id} className="card" style={{ cursor: 'default' }}>
            <div className="flex items-center gap-md mb-md">
              <Avatar name={m.name} />
              <div>
                <div className="font-semibold text-sm">{m.name}</div>
                <div className="text-xs text-muted">{m.role}</div>
              </div>
            </div>
            <div className="grid-2 gap-sm">
              <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                <div className="text-xs text-muted">Jam Kerja</div>
                <div className="font-bold text-sm">{formatDuration(m.totalTime)}</div>
              </div>
              <div style={{ padding: '8px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                <div className="text-xs text-muted">Task Selesai</div>
                <div className="font-bold text-sm">{m.doneTasks}/{m.totalTasks}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
