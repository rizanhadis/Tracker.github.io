import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import Avatar from '../components/UI/Avatar'
import {
  ArrowLeft, Plus, Calendar, Clock, Trash2, Edit,
  GripVertical, AlertCircle
} from 'lucide-react'

const COLUMNS = [
  { key: 'To Do', label: 'To Do', color: 'var(--text-secondary)' },
  { key: 'In Progress', label: 'In Progress', color: 'var(--warning)' },
  { key: 'Review', label: 'Review', color: 'var(--primary-light)' },
  { key: 'Done', label: 'Done', color: 'var(--success)' },
]

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

export default function ProjectDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { projects, tasks, members, addTask, updateTask, deleteTask, getProjectTasks, getProjectMembers, getProjectTimeEntries, formatDuration, getTotalDuration } = useApp()

  const project = projects.find(p => p.id === id)
  const projectTasks = useMemo(() => getProjectTasks(id), [id, getProjectTasks])
  const projectMembers = useMemo(() => getProjectMembers(id), [id, getProjectMembers])
  const projectTime = useMemo(() => getProjectTimeEntries(id), [id, getProjectTimeEntries])

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [form, setForm] = useState({
    title: '', description: '', status: 'To Do', priority: 'Medium',
    assigneeId: '', deadline: ''
  })

  if (!project) {
    return (
      <div className="empty-state">
        <AlertCircle size={64} />
        <p>Proyek tidak ditemukan</p>
        <button className="btn btn-primary" onClick={() => navigate('/projects')}>
          Kembali ke Proyek
        </button>
      </div>
    )
  }

  const openCreate = (status = 'To Do') => {
    setEditingTask(null)
    setForm({ title: '', description: '', status, priority: 'Medium', assigneeId: '', deadline: '' })
    setShowTaskModal(true)
  }

  const openEdit = (task) => {
    setEditingTask(task)
    setForm({
      title: task.title, description: task.description || '', status: task.status,
      priority: task.priority, assigneeId: task.assigneeId || '', deadline: task.deadline || ''
    })
    setShowTaskModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    if (editingTask) {
      updateTask(editingTask.id, form)
    } else {
      addTask({ ...form, projectId: id })
    }
    setShowTaskModal(false)
  }

  const handleDeleteTask = (taskId) => {
    if (window.confirm('Hapus task ini?')) {
      deleteTask(taskId)
    }
  }

  // Drag & Drop
  const handleDragStart = (task) => {
    setDraggedTask(task)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (status) => {
    if (draggedTask && draggedTask.status !== status) {
      updateTask(draggedTask.id, { status })
    }
    setDraggedTask(null)
  }

  const doneTasks = projectTasks.filter(t => t.status === 'Done').length
  const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0
  const totalTime = getTotalDuration(projectTime)

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-lg">
        <button className="btn btn-ghost mb-md" onClick={() => navigate('/projects')}>
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-md">
            <div style={{
              width: 16, height: 16, borderRadius: 'var(--radius-full)',
              background: project.color
            }} />
            <div>
              <h1>{project.name}</h1>
              <p className="text-secondary text-sm mt-xs">{project.description}</p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => openCreate()} id="add-task-btn">
            <Plus size={18} /> Task Baru
          </button>
        </div>

        {/* Stats row */}
        <div className="flex gap-lg mt-lg" style={{ flexWrap: 'wrap' }}>
          <div className="flex items-center gap-sm text-sm">
            <span className="text-secondary">Progress:</span>
            <div className="progress-bar" style={{ width: 120 }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="font-semibold">{progress}%</span>
          </div>
          <div className="flex items-center gap-sm text-sm text-secondary">
            <Calendar size={14} />
            Deadline: {project.deadline ? new Date(project.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
          </div>
          <div className="flex items-center gap-sm text-sm text-secondary">
            <Clock size={14} />
            Total: {formatDuration(totalTime)}
          </div>
          <div className="flex items-center gap-sm">
            <div className="avatar-group">
              {projectMembers.slice(0, 4).map(m => (
                <Avatar key={m.id} name={m.name} size="sm" />
              ))}
            </div>
            <span className="text-xs text-muted">{projectMembers.length} anggota</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const columnTasks = projectTasks.filter(t => t.status === col.key)
          return (
            <div
              key={col.key}
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(col.key)}
            >
              <div className="kanban-column-header">
                <div className="kanban-column-title">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                  {col.label}
                  <span className="kanban-column-count">{columnTasks.length}</span>
                </div>
                <button className="btn btn-ghost btn-icon" onClick={() => openCreate(col.key)}
                  style={{ width: 28, height: 28 }}>
                  <Plus size={14} />
                </button>
              </div>
              <div className="kanban-column-body">
                {columnTasks.map(task => {
                  const assignee = members.find(m => m.id === task.assigneeId)
                  return (
                    <div
                      key={task.id}
                      className="kanban-card"
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onClick={() => openEdit(task)}
                    >
                      <div className="flex items-center gap-xs mb-sm" style={{ opacity: 0.3 }}>
                        <GripVertical size={12} />
                      </div>
                      <div className="kanban-card-title">{task.title}</div>
                      <div className="kanban-card-meta">
                        <div className="flex items-center gap-xs">
                          <span className={`badge badge-${task.priority.toLowerCase()}`}>
                            {task.priority}
                          </span>
                        </div>
                        {assignee && <Avatar name={assignee.name} size="sm" />}
                      </div>
                      {task.deadline && (
                        <div className="flex items-center gap-xs mt-sm text-xs text-muted">
                          <Calendar size={10} />
                          {new Date(task.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </div>
                      )}
                    </div>
                  )
                })}

                {columnTasks.length === 0 && (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.8rem',
                    border: '1px dashed var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    Drop task di sini
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title={editingTask ? 'Edit Task' : 'Task Baru'}
        footer={
          <div className="flex items-center justify-between w-full">
            {editingTask && (
              <button className="btn btn-danger btn-sm" onClick={() => { handleDeleteTask(editingTask.id); setShowTaskModal(false) }}>
                <Trash2 size={14} /> Hapus
              </button>
            )}
            <div className="flex gap-sm" style={{ marginLeft: 'auto' }}>
              <button className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Batal</button>
              <button className="btn btn-primary" onClick={handleSubmit}>
                {editingTask ? 'Simpan' : 'Buat Task'}
              </button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Judul Task *</label>
            <input className="form-input" value={form.title}
              onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
              placeholder="Judul task..." required id="task-title-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-textarea" value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Deskripsi task..." />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Prioritas</label>
              <select className="form-select" value={form.priority}
                onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Assign ke</label>
              <select className="form-select" value={form.assigneeId}
                onChange={e => setForm(p => ({ ...p, assigneeId: e.target.value }))}>
                <option value="">-- Pilih Anggota --</option>
                {projectMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input type="date" className="form-input" value={form.deadline}
                onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
