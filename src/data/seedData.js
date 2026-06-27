const now = new Date()
const today = now.toISOString().split('T')[0]
const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const twoWeeksLater = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
const twoMonthsLater = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

export const AVATAR_COLORS = [
  '#7c3aed', '#2563eb', '#06b6d4', '#10b981', '#f59e0b',
  '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316'
]

export function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function getInitials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

export const seedMembers = [
  { id: 'm1', name: 'Ahmad Rizki', email: 'ahmad@nyawit.com', role: 'Project Manager', joinedAt: '2025-01-15' },
  { id: 'm2', name: 'Siti Nurhaliza', email: 'siti@nyawit.com', role: 'Frontend Developer', joinedAt: '2025-02-01' },
  { id: 'm3', name: 'Budi Santoso', email: 'budi@nyawit.com', role: 'Backend Developer', joinedAt: '2025-02-15' },
  { id: 'm4', name: 'Dewi Lestari', email: 'dewi@nyawit.com', role: 'UI/UX Designer', joinedAt: '2025-03-01' },
  { id: 'm5', name: 'Reza Firmansyah', email: 'reza@nyawit.com', role: 'QA Engineer', joinedAt: '2025-03-15' },
]

export const seedProjects = [
  {
    id: 'p1',
    name: 'Website Redesign',
    description: 'Mendesain ulang website perusahaan dengan tampilan modern dan responsif',
    status: 'Aktif',
    deadline: twoWeeksLater,
    memberIds: ['m1', 'm2', 'm4'],
    color: '#7c3aed',
    createdAt: '2025-06-01'
  },
  {
    id: 'p2',
    name: 'Mobile App MVP',
    description: 'Mengembangkan versi MVP aplikasi mobile untuk platform Android dan iOS',
    status: 'Aktif',
    deadline: oneMonthLater,
    memberIds: ['m1', 'm2', 'm3', 'm5'],
    color: '#2563eb',
    createdAt: '2025-06-10'
  },
  {
    id: 'p3',
    name: 'API Integration',
    description: 'Integrasi API payment gateway dan third-party services',
    status: 'Tertunda',
    deadline: twoMonthsLater,
    memberIds: ['m3', 'm5'],
    color: '#06b6d4',
    createdAt: '2025-06-15'
  }
]

export const seedTasks = [
  // Project 1: Website Redesign
  { id: 't1', projectId: 'p1', title: 'Wireframe halaman utama', description: 'Buat wireframe untuk homepage baru', status: 'Done', priority: 'High', assigneeId: 'm4', deadline: weekAgo, createdAt: '2025-06-02' },
  { id: 't2', projectId: 'p1', title: 'Desain sistem warna', description: 'Tentukan color palette dan design tokens', status: 'Done', priority: 'Medium', assigneeId: 'm4', deadline: weekAgo, createdAt: '2025-06-03' },
  { id: 't3', projectId: 'p1', title: 'Implementasi header & nav', description: 'Coding responsive header dan navigation', status: 'In Progress', priority: 'High', assigneeId: 'm2', deadline: today, createdAt: '2025-06-05' },
  { id: 't4', projectId: 'p1', title: 'Halaman About Us', description: 'Desain dan implementasi halaman about', status: 'To Do', priority: 'Medium', assigneeId: 'm2', deadline: twoWeeksLater, createdAt: '2025-06-06' },
  { id: 't5', projectId: 'p1', title: 'Optimisasi performa', description: 'Lighthouse audit dan optimisasi', status: 'To Do', priority: 'Low', assigneeId: 'm2', deadline: twoWeeksLater, createdAt: '2025-06-07' },

  // Project 2: Mobile App
  { id: 't6', projectId: 'p2', title: 'Setup React Native', description: 'Inisialisasi project dan konfigurasi', status: 'Done', priority: 'High', assigneeId: 'm2', deadline: weekAgo, createdAt: '2025-06-11' },
  { id: 't7', projectId: 'p2', title: 'API Authentication', description: 'Implementasi login dan register API', status: 'In Progress', priority: 'High', assigneeId: 'm3', deadline: today, createdAt: '2025-06-12' },
  { id: 't8', projectId: 'p2', title: 'UI Screen Dashboard', description: 'Buat tampilan dashboard mobile', status: 'In Progress', priority: 'Medium', assigneeId: 'm2', deadline: twoWeeksLater, createdAt: '2025-06-13' },
  { id: 't9', projectId: 'p2', title: 'Testing E2E', description: 'Setup dan jalankan testing end-to-end', status: 'To Do', priority: 'Medium', assigneeId: 'm5', deadline: oneMonthLater, createdAt: '2025-06-14' },

  // Project 3: API Integration
  { id: 't10', projectId: 'p3', title: 'Riset payment gateway', description: 'Evaluasi opsi payment gateway yang tersedia', status: 'To Do', priority: 'High', assigneeId: 'm3', deadline: oneMonthLater, createdAt: '2025-06-16' },
  { id: 't11', projectId: 'p3', title: 'Dokumentasi API', description: 'Tulis dokumentasi endpoint API', status: 'To Do', priority: 'Low', assigneeId: 'm3', deadline: twoMonthsLater, createdAt: '2025-06-17' },
]

export const seedTimeEntries = [
  { id: 'te1', taskId: 't1', projectId: 'p1', memberId: 'm4', startTime: '2025-06-20T09:00:00', endTime: '2025-06-20T12:30:00', duration: 12600, note: 'Wireframe homepage v1' },
  { id: 'te2', taskId: 't2', projectId: 'p1', memberId: 'm4', startTime: '2025-06-20T13:30:00', endTime: '2025-06-20T16:00:00', duration: 9000, note: 'Research color palettes' },
  { id: 'te3', taskId: 't3', projectId: 'p1', memberId: 'm2', startTime: '2025-06-21T09:00:00', endTime: '2025-06-21T12:00:00', duration: 10800, note: 'Header component coding' },
  { id: 'te4', taskId: 't6', projectId: 'p2', memberId: 'm2', startTime: '2025-06-21T13:00:00', endTime: '2025-06-21T17:00:00', duration: 14400, note: 'RN project setup' },
  { id: 'te5', taskId: 't7', projectId: 'p2', memberId: 'm3', startTime: '2025-06-22T09:00:00', endTime: '2025-06-22T13:00:00', duration: 14400, note: 'Auth API endpoint' },
  { id: 'te6', taskId: 't7', projectId: 'p2', memberId: 'm3', startTime: '2025-06-22T14:00:00', endTime: '2025-06-22T17:30:00', duration: 12600, note: 'JWT token implementation' },
  { id: 'te7', taskId: 't3', projectId: 'p1', memberId: 'm2', startTime: '2025-06-23T09:00:00', endTime: '2025-06-23T11:30:00', duration: 9000, note: 'Responsive navigation' },
  { id: 'te8', taskId: 't8', projectId: 'p2', memberId: 'm2', startTime: '2025-06-23T13:00:00', endTime: '2025-06-23T16:00:00', duration: 10800, note: 'Dashboard UI mobile' },
]

export const seedActiveTimer = null
