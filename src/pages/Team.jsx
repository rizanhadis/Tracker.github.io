import { useState } from 'react'
import { useApp } from '../context/AppContext'
import Modal from '../components/UI/Modal'
import Avatar from '../components/UI/Avatar'
import { Plus, Mail, Briefcase, Trash2, Edit, Users as UsersIcon, Clock, FolderKanban } from 'lucide-react'

export default function Team() {
  const { members, projects, timeEntries, addMember, updateMember, deleteMember, getMemberProjects, getMemberTimeEntries, formatDuration, getTotalDuration } = useApp()
  const [showModal, setShowModal] = useState(false)
  const [editingMember, setEditingMember] = useState(null)
  const [form, setForm] = useState({ name: '', email: '', role: '' })

  const openCreate = () => {
    setEditingMember(null)
    setForm({ name: '', email: '', role: '' })
    setShowModal(true)
  }

  const openEdit = (member) => {
    setEditingMember(member)
    setForm({ name: member.name, email: member.email, role: member.role })
    setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    if (editingMember) {
      updateMember(editingMember.id, form)
    } else {
      addMember(form)
    }
    setShowModal(false)
  }

  const handleDelete = (id) => {
    if (window.confirm('Hapus anggota ini? Anggota akan dikeluarkan dari semua proyek.')) {
      deleteMember(id)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Tim</h1>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openCreate} id="add-member-btn">
            <Plus size={18} />
            Tambah Anggota
          </button>
        </div>
      </div>

      {members.length === 0 ? (
        <div className="empty-state">
          <UsersIcon size={64} />
          <p>Belum ada anggota tim</p>
          <button className="btn btn-primary" onClick={openCreate}>
            <Plus size={16} /> Tambah Anggota
          </button>
        </div>
      ) : (
        <div className="grid-3 stagger-children">
          {members.map(member => {
            const memberProjects = getMemberProjects(member.id)
            const memberTime = getMemberTimeEntries(member.id)
            const totalTime = getTotalDuration(memberTime)

            return (
              <div key={member.id} className="card" style={{ cursor: 'default' }}>
                <div className="flex items-center justify-between mb-md">
                  <Avatar name={member.name} size="lg" />
                  <div className="flex gap-xs">
                    <button className="btn btn-ghost btn-icon" onClick={() => openEdit(member)}>
                      <Edit size={14} />
                    </button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(member.id)}
                      style={{ color: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h4 className="mb-xs">{member.name}</h4>
                <div className="flex items-center gap-xs text-sm text-secondary mb-sm">
                  <Briefcase size={13} />
                  {member.role}
                </div>
                <div className="flex items-center gap-xs text-sm text-muted mb-md">
                  <Mail size={13} />
                  {member.email}
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
                  <div className="flex items-center justify-between text-sm mb-sm">
                    <div className="flex items-center gap-xs text-secondary">
                      <FolderKanban size={13} />
                      {memberProjects.length} proyek
                    </div>
                    <div className="flex items-center gap-xs text-secondary">
                      <Clock size={13} />
                      {formatDuration(totalTime)}
                    </div>
                  </div>

                  {memberProjects.length > 0 && (
                    <div className="flex gap-xs" style={{ flexWrap: 'wrap' }}>
                      {memberProjects.map(p => (
                        <span key={p.id} className="badge" style={{
                          background: `${p.color}20`,
                          color: p.color,
                          fontSize: '0.7rem'
                        }}>
                          {p.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingMember ? 'Edit Anggota' : 'Tambah Anggota Baru'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
            <button className="btn btn-primary" onClick={handleSubmit}>
              {editingMember ? 'Simpan' : 'Tambah'}
            </button>
          </>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Lengkap *</label>
            <input className="form-input" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Nama lengkap" required id="member-name-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="email@contoh.com" id="member-email-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Role / Jabatan</label>
            <input className="form-input" value={form.role}
              onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              placeholder="Contoh: Frontend Developer" id="member-role-input" />
          </div>
        </form>
      </Modal>
    </div>
  )
}
