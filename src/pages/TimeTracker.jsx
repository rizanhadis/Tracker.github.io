import { useState, useEffect, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import Avatar from '../components/UI/Avatar'
import {
  Play, Square, Clock, Plus, Trash2, Timer as TimerIcon
} from 'lucide-react'

export default function TimeTracker() {
  const {
    projects, tasks, members, timeEntries, activeTimer,
    startTimer, stopTimer, cancelTimer, addTimeEntry, deleteTimeEntry,
    formatDuration, getProjectTasks
  } = useApp()

  const [elapsed, setElapsed] = useState(0)
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedTask, setSelectedTask] = useState('')
  const [selectedMember, setSelectedMember] = useState(members[0]?.id || '')
  const [stopNote, setStopNote] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [manualForm, setManualForm] = useState({
    projectId: '', taskId: '', memberId: members[0]?.id || '',
    date: new Date().toISOString().split('T')[0],
    startHour: '09', startMin: '00', endHour: '17', endMin: '00',
    note: ''
  })

  // Timer tick
  useEffect(() => {
    let interval
    if (activeTimer?.isRunning) {
      const tick = () => {
        const diff = Math.floor((Date.now() - new Date(activeTimer.startTime).getTime()) / 1000)
        setElapsed(diff)
      }
      tick()
      interval = setInterval(tick, 1000)
    } else {
      setElapsed(0)
    }
    return () => clearInterval(interval)
  }, [activeTimer])

  const availableTasks = useMemo(() => {
    if (!selectedProject) return []
    return getProjectTasks(selectedProject).filter(t => t.status !== 'Done')
  }, [selectedProject, getProjectTasks])

  const manualAvailableTasks = useMemo(() => {
    if (!manualForm.projectId) return []
    return getProjectTasks(manualForm.projectId)
  }, [manualForm.projectId, getProjectTasks])

  const handleStart = () => {
    if (!selectedProject) return
    startTimer(selectedTask || null, selectedProject, selectedMember)
  }

  const handleStop = () => {
    stopTimer(stopNote)
    setStopNote('')
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    const startTime = `${manualForm.date}T${manualForm.startHour}:${manualForm.startMin}:00`
    const endTime = `${manualForm.date}T${manualForm.endHour}:${manualForm.endMin}:00`
    const duration = Math.floor((new Date(endTime) - new Date(startTime)) / 1000)

    if (duration <= 0) return alert('Waktu akhir harus setelah waktu mulai')

    addTimeEntry({
      taskId: manualForm.taskId || null,
      projectId: manualForm.projectId,
      memberId: manualForm.memberId,
      startTime, endTime, duration,
      note: manualForm.note
    })
    setShowManual(false)
    setManualForm(prev => ({ ...prev, note: '' }))
  }

  const formatTimerDisplay = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const s = String(seconds % 60).padStart(2, '0')
    return `${h}:${m}:${s}`
  }

  // Recent entries (last 20)
  const recentEntries = useMemo(() => {
    return [...timeEntries].sort((a, b) => new Date(b.startTime) - new Date(a.startTime)).slice(0, 20)
  }, [timeEntries])

  // Today's total
  const todayTotal = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0]
    const todayEntries = timeEntries.filter(e => e.startTime.startsWith(todayStr))
    return todayEntries.reduce((sum, e) => sum + (e.duration || 0), 0)
  }, [timeEntries])

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Time Tracker</h1>
        <button className="btn btn-secondary" onClick={() => setShowManual(!showManual)} id="manual-entry-btn">
          <Plus size={16} />
          Entry Manual
        </button>
      </div>

      {/* Timer Card */}
      <div className="card-static mb-lg" style={{ textAlign: 'center', padding: 'var(--space-2xl)' }}>
        <div className="timer-display" style={{
          background: activeTimer?.isRunning ? 'var(--gradient-primary)' : 'none',
          WebkitBackgroundClip: activeTimer?.isRunning ? 'text' : 'none',
          WebkitTextFillColor: activeTimer?.isRunning ? 'transparent' : 'var(--text-primary)',
          backgroundClip: activeTimer?.isRunning ? 'text' : 'none',
        }}>
          {formatTimerDisplay(elapsed)}
        </div>

        {!activeTimer?.isRunning ? (
          <>
            {/* Timer setup */}
            <div className="flex gap-md justify-center mb-lg" style={{ flexWrap: 'wrap', maxWidth: 600, margin: '0 auto var(--space-lg)' }}>
              <select className="form-select" value={selectedProject}
                onChange={e => { setSelectedProject(e.target.value); setSelectedTask('') }}
                style={{ flex: 1, minWidth: 160 }}>
                <option value="">-- Pilih Proyek --</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select className="form-select" value={selectedTask}
                onChange={e => setSelectedTask(e.target.value)}
                style={{ flex: 1, minWidth: 160 }}
                disabled={!selectedProject}>
                <option value="">-- Task (opsional) --</option>
                {availableTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>
              <select className="form-select" value={selectedMember}
                onChange={e => setSelectedMember(e.target.value)}
                style={{ flex: 1, minWidth: 140 }}>
                {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="timer-controls">
              <button className="timer-btn timer-btn-start" onClick={handleStart}
                disabled={!selectedProject} id="start-timer-btn"
                style={{ opacity: selectedProject ? 1 : 0.5 }}>
                <Play size={24} fill="white" />
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-sm mb-md text-secondary text-sm">
              <TimerIcon size={14} className="text-secondary" style={{ animation: 'pulse 2s infinite' }} />
              {projects.find(p => p.id === activeTimer.projectId)?.name}
              {activeTimer.taskId && ` → ${tasks.find(t => t.id === activeTimer.taskId)?.title || ''}`}
            </div>
            <div className="flex justify-center mb-md">
              <input className="form-input" value={stopNote}
                onChange={e => setStopNote(e.target.value)}
                placeholder="Catatan (opsional)..."
                style={{ maxWidth: 400, textAlign: 'center' }} />
            </div>
            <div className="timer-controls">
              <button className="timer-btn timer-btn-stop" onClick={handleStop} id="stop-timer-btn">
                <Square size={20} fill="white" />
              </button>
              <button className="btn btn-ghost text-sm" onClick={cancelTimer}>Batalkan</button>
            </div>
          </>
        )}
      </div>

      {/* Manual Entry Form */}
      {showManual && (
        <div className="card-static mb-lg animate-slide-up">
          <h3 className="mb-md">Entry Waktu Manual</h3>
          <form onSubmit={handleManualSubmit}>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Proyek *</label>
                <select className="form-select" value={manualForm.projectId}
                  onChange={e => setManualForm(p => ({ ...p, projectId: e.target.value, taskId: '' }))} required>
                  <option value="">Pilih Proyek</option>
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Task</label>
                <select className="form-select" value={manualForm.taskId}
                  onChange={e => setManualForm(p => ({ ...p, taskId: e.target.value }))}
                  disabled={!manualForm.projectId}>
                  <option value="">Opsional</option>
                  {manualAvailableTasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Anggota</label>
                <select className="form-select" value={manualForm.memberId}
                  onChange={e => setManualForm(p => ({ ...p, memberId: e.target.value }))}>
                  {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-3">
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input type="date" className="form-input" value={manualForm.date}
                  onChange={e => setManualForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Jam Mulai</label>
                <div className="flex gap-xs">
                  <input className="form-input" value={manualForm.startHour} maxLength={2}
                    onChange={e => setManualForm(p => ({ ...p, startHour: e.target.value }))}
                    style={{ width: 50, textAlign: 'center' }} />
                  <span className="flex items-center">:</span>
                  <input className="form-input" value={manualForm.startMin} maxLength={2}
                    onChange={e => setManualForm(p => ({ ...p, startMin: e.target.value }))}
                    style={{ width: 50, textAlign: 'center' }} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Jam Selesai</label>
                <div className="flex gap-xs">
                  <input className="form-input" value={manualForm.endHour} maxLength={2}
                    onChange={e => setManualForm(p => ({ ...p, endHour: e.target.value }))}
                    style={{ width: 50, textAlign: 'center' }} />
                  <span className="flex items-center">:</span>
                  <input className="form-input" value={manualForm.endMin} maxLength={2}
                    onChange={e => setManualForm(p => ({ ...p, endMin: e.target.value }))}
                    style={{ width: 50, textAlign: 'center' }} />
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Catatan</label>
              <input className="form-input" value={manualForm.note}
                onChange={e => setManualForm(p => ({ ...p, note: e.target.value }))}
                placeholder="Apa yang dikerjakan..." />
            </div>
            <div className="flex gap-sm justify-between">
              <button type="button" className="btn btn-secondary" onClick={() => setShowManual(false)}>Batal</button>
              <button type="submit" className="btn btn-primary">Simpan Entry</button>
            </div>
          </form>
        </div>
      )}

      {/* Today summary */}
      <div className="flex items-center justify-between mb-md">
        <h3>Riwayat Waktu</h3>
        <div className="flex items-center gap-sm">
          <Clock size={16} className="text-secondary" />
          <span className="text-sm text-secondary">Hari ini: <strong className="text-gradient">{formatDuration(todayTotal)}</strong></span>
        </div>
      </div>

      {/* Time entries table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Proyek</th>
              <th>Task</th>
              <th>Anggota</th>
              <th>Durasi</th>
              <th>Catatan</th>
              <th style={{ width: 50 }}></th>
            </tr>
          </thead>
          <tbody>
            {recentEntries.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  Belum ada entry waktu
                </td>
              </tr>
            ) : (
              recentEntries.map(entry => {
                const project = projects.find(p => p.id === entry.projectId)
                const task = tasks.find(t => t.id === entry.taskId)
                const member = members.find(m => m.id === entry.memberId)
                return (
                  <tr key={entry.id}>
                    <td className="text-sm">
                      {new Date(entry.startTime).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short'
                      })}
                      <br />
                      <span className="text-xs text-muted">
                        {new Date(entry.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(entry.endTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-xs">
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: project?.color }} />
                        <span className="text-sm">{project?.name || '-'}</span>
                      </div>
                    </td>
                    <td className="text-sm">{task?.title || '-'}</td>
                    <td>
                      {member && (
                        <div className="flex items-center gap-xs">
                          <Avatar name={member.name} size="sm" />
                          <span className="text-sm">{member.name}</span>
                        </div>
                      )}
                    </td>
                    <td className="font-semibold text-sm">{formatDuration(entry.duration)}</td>
                    <td className="text-sm text-secondary">{entry.note || '-'}</td>
                    <td>
                      <button className="btn btn-ghost btn-icon"
                        onClick={() => { if (window.confirm('Hapus entry ini?')) deleteTimeEntry(entry.id) }}
                        style={{ color: 'var(--danger)', width: 28, height: 28 }}>
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
