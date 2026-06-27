import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import Avatar from '../components/UI/Avatar'
import { Plus, Calendar, MoreVertical, Trash2, Edit, FolderKanban } from 'lucide-react'

const STATUS_OPTIONS = ['Semua', 'Aktif', 'Selesai', 'Tertunda']

export default function Projects() {
  const { projects, tasks, members, addProject, updateProject, deleteProject } = useApp()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Semua')
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [menuOpen, setMenuOpen] = useState(null)
  const [form, setForm] = useState({ name: '', description: '', status: 'Aktif', deadline: '', memberIds: [], color: '#7c3aed' })

  const filteredProjects = useMemo(() => {
    if (filter === 'Semua') return projects
    return projects.filter(p => p.status === filter)
  }, [projects, filter])

  const openCreate = () => {
    setEditingProject(null)
    setForm({ name: '', description: '', status: 'Aktif', deadline: '', memberIds: [], color: '#7c3aed' })
    setShowModal(true)
  }

  const openEdit = (project) => {
    setEditingProject(project)
    setForm({
      name: project.name,
      description: project.description,
      status: project.status,
      deadline: project.deadline,
      memberIds: project.memberIds,
      color: project.color
    })
    setShowModal(true)
    setMenuOpen(null)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editingProject) {
      updateProject(editingProject.id, form)
    } else {
      addProject(form)
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Hapus proyek ini beserta semua task-nya?')) {
      deleteProject(id)
    }
    setMenuOpen(null)
  }

  const toggleMember = (memberId) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(memberId)
        ? prev.memberIds.filter(id => id !== memberId)
        : [...prev.memberIds, memberId]
    }))
  }

  const colorOptions = ['#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316']

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Proyek</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate} id="add-project-btn">
            <Plus size={18} />
            Proyek Baru
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {STATUS_OPTIONS.map(status => (
          <button
            key={status}
            className={`tab ${filter === status ? 'active' : ''}`}
            onClick={() => setFilter(status)}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="empty-state">
          <FolderKanban size={64} />
          <p>Belum ada proyek{filter !== 'Semua' ? ` dengan status "${filter}"` : ''}</p>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Buat Proyek
          </button>
        </div>
      ) : (
        <div className="grid-3 stagger-children">
          {filteredProjects.map(project => {
            const projectTasks = tasks.filter(t => t.projectId === project.id)
            const doneTasks = projectTasks.filter(t => t.status === 'Done').length
            const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0
            const projectMembers = members.filter(m => project.memberIds.includes(m.id))

            return (
              <div key={project.id} className="card" style={{ cursor: 'pointer', position: 'relative' }}>
                {/* Menu button */}
                <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 5 }}>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === project.id ? null : project.id) }}
                  >
                    <MoreVertical size={16} />
                  </button>
                  {menuOpen === project.id && (
                    <div style={{
                      position: 'absolute', right: 0, top: '100%', marginTop: 4,
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)', padding: 4, minWidth: 140, zIndex: 10,
                      boxShadow: 'var(--shadow-lg)'
                    }}>
                      <button className="btn btn-ghost w-full" style={{ justifyContent: 'flex-start', padding: '8px 12px' }}
                        onClick={(e) => { e.stopPropagation(); openEdit(project) }}>
                        <Edit size={14} /> Edit
                      </button>
                      <button className="btn btn-ghost w-full" style={{ justifyContent: 'flex-start', padding: '8px 12px', color: 'var(--danger)' }}
                        onClick={(e) => { e.stopPropagation(); handleDelete(project.id) }}>
                        <Trash2 size={14} /> Hapus
                      </button>
                    </div>
                  )}
                </div>

                <div onClick={() => navigate(`/projects/${project.id}`)}>
                  <div className="flex items-center gap-sm mb-md">
                    <div style={{
                      width: 10, height: 10,
                      borderRadius: 'var(--radius-full)',
                      background: project.color
                    }} />
                    <span className={`badge badge-${project.status.toLowerCase()}`}>{project.status}</span>
                  </div>
                  <h4 className="mb-sm">{project.name}</h4>
                  <p className="text-sm text-secondary mb-md" style={{
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical', overflow: 'hidden'
                  }}>{project.description}</p>

                  <div className="progress-bar mb-sm">
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted mb-md">
                    <span>{doneTasks}/{projectTasks.length} task</span>
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
                    {project.deadline && (
                      <div className="text-xs text-muted flex items-center gap-xs">
                        <Calendar size={12} />
                        {new Date(project.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingProject ? 'Edit Proyek' : 'Buat Proyek Baru'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingProject ? 'Simpan' : 'Buat Proyek'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Proyek *</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Contoh: Website Redesign"
              required
              id="project-name-input"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea
              className="form-textarea"
              value={form.description}
              onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Jelaskan proyek ini..."
              id="project-desc-input"
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-select" value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="Aktif">Aktif</option>
                <option value="Tertunda">Tertunda</option>
                <option value="Selesai">Selesai</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Deadline</label>
              <input type="date" className="form-input" value={form.deadline}
                onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Warna</label>
            <div className="flex gap-sm">
              {colorOptions.map(c => (
                <button key={c} type="button" onClick={() => setForm(p => ({ ...p, color: c }))}
                  style={{
                    width: 28, height: 28, borderRadius: 'var(--radius-full)', background: c,
                    border: form.color === c ? '2px solid white' : '2px solid transparent',
                    cursor: 'pointer', transition: 'transform 0.15s'
                  }}
                />
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Anggota Tim</label>
            <div className="flex flex-col gap-xs">
              {members.map(m => (
                <label key={m.id} className="flex items-center gap-sm" style={{
                  padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  background: form.memberIds.includes(m.id) ? 'var(--gradient-primary-soft)' : 'var(--bg-card)',
                  border: '1px solid var(--border-color)', cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}>
                  <input type="checkbox" checked={form.memberIds.includes(m.id)}
                    onChange={() => toggleMember(m.id)}
                    style={{ accentColor: 'var(--primary)' }}
                  />
                  <Avatar name={m.name} size="sm" />
                  <div>
                    <div className="text-sm font-medium">{m.name}</div>
                    <div className="text-xs text-muted">{m.role}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}
