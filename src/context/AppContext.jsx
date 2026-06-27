import { createContext, useContext, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { seedProjects, seedTasks, seedMembers, seedTimeEntries, seedActiveTimer } from '../data/seedData'

const AppContext = createContext()

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

export function AppProvider({ children }) {
  const [projects, setProjects] = useLocalStorage('inprotim_projects', seedProjects)
  const [tasks, setTasks] = useLocalStorage('inprotim_tasks', seedTasks)
  const [members, setMembers] = useLocalStorage('inprotim_members', seedMembers)
  const [timeEntries, setTimeEntries] = useLocalStorage('inprotim_timeEntries', seedTimeEntries)
  const [activeTimer, setActiveTimer] = useLocalStorage('inprotim_activeTimer', seedActiveTimer)

  // === Project CRUD ===
  const addProject = useCallback((project) => {
    const newProject = { ...project, id: generateId(), createdAt: new Date().toISOString() }
    setProjects(prev => [...prev, newProject])
    return newProject
  }, [setProjects])

  const updateProject = useCallback((id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p))
  }, [setProjects])

  const deleteProject = useCallback((id) => {
    setProjects(prev => prev.filter(p => p.id !== id))
    setTasks(prev => prev.filter(t => t.projectId !== id))
    setTimeEntries(prev => prev.filter(te => te.projectId !== id))
  }, [setProjects, setTasks, setTimeEntries])

  // === Task CRUD ===
  const addTask = useCallback((task) => {
    const newTask = { ...task, id: generateId(), createdAt: new Date().toISOString() }
    setTasks(prev => [...prev, newTask])
    return newTask
  }, [setTasks])

  const updateTask = useCallback((id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }, [setTasks])

  const deleteTask = useCallback((id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
    setTimeEntries(prev => prev.filter(te => te.taskId !== id))
  }, [setTasks, setTimeEntries])

  // === Member CRUD ===
  const addMember = useCallback((member) => {
    const newMember = { ...member, id: generateId(), joinedAt: new Date().toISOString().split('T')[0] }
    setMembers(prev => [...prev, newMember])
    return newMember
  }, [setMembers])

  const updateMember = useCallback((id, updates) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m))
  }, [setMembers])

  const deleteMember = useCallback((id) => {
    setMembers(prev => prev.filter(m => m.id !== id))
    setProjects(prev => prev.map(p => ({
      ...p,
      memberIds: p.memberIds.filter(mId => mId !== id)
    })))
    setTasks(prev => prev.map(t => t.assigneeId === id ? { ...t, assigneeId: null } : t))
  }, [setMembers, setProjects, setTasks])

  // === Time Tracking ===
  const startTimer = useCallback((taskId, projectId, memberId) => {
    setActiveTimer({
      taskId, projectId, memberId,
      startTime: new Date().toISOString(),
      isRunning: true
    })
  }, [setActiveTimer])

  const stopTimer = useCallback((note = '') => {
    if (!activeTimer) return
    const endTime = new Date().toISOString()
    const duration = Math.floor((new Date(endTime) - new Date(activeTimer.startTime)) / 1000)
    const entry = {
      id: generateId(),
      taskId: activeTimer.taskId,
      projectId: activeTimer.projectId,
      memberId: activeTimer.memberId,
      startTime: activeTimer.startTime,
      endTime,
      duration,
      note
    }
    setTimeEntries(prev => [...prev, entry])
    setActiveTimer(null)
    return entry
  }, [activeTimer, setTimeEntries, setActiveTimer])

  const cancelTimer = useCallback(() => {
    setActiveTimer(null)
  }, [setActiveTimer])

  const addTimeEntry = useCallback((entry) => {
    const newEntry = { ...entry, id: generateId() }
    setTimeEntries(prev => [...prev, newEntry])
    return newEntry
  }, [setTimeEntries])

  const deleteTimeEntry = useCallback((id) => {
    setTimeEntries(prev => prev.filter(te => te.id !== id))
  }, [setTimeEntries])

  // === Helpers ===
  const getProjectTasks = useCallback((projectId) => {
    return tasks.filter(t => t.projectId === projectId)
  }, [tasks])

  const getProjectMembers = useCallback((projectId) => {
    const project = projects.find(p => p.id === projectId)
    if (!project) return []
    return members.filter(m => project.memberIds.includes(m.id))
  }, [projects, members])

  const getMemberProjects = useCallback((memberId) => {
    return projects.filter(p => p.memberIds.includes(memberId))
  }, [projects])

  const getProjectTimeEntries = useCallback((projectId) => {
    return timeEntries.filter(te => te.projectId === projectId)
  }, [timeEntries])

  const getMemberTimeEntries = useCallback((memberId) => {
    return timeEntries.filter(te => te.memberId === memberId)
  }, [timeEntries])

  const getTotalDuration = useCallback((entries) => {
    return entries.reduce((sum, e) => sum + (e.duration || 0), 0)
  }, [])

  const formatDuration = useCallback((seconds) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}j ${m}m`
    if (m > 0) return `${m}m ${s}d`
    return `${s}d`
  }, [])

  const value = {
    // Data
    projects, tasks, members, timeEntries, activeTimer,
    // Project
    addProject, updateProject, deleteProject,
    // Task
    addTask, updateTask, deleteTask,
    // Member
    addMember, updateMember, deleteMember,
    // Timer
    startTimer, stopTimer, cancelTimer, addTimeEntry, deleteTimeEntry,
    // Helpers
    getProjectTasks, getProjectMembers, getMemberProjects,
    getProjectTimeEntries, getMemberTimeEntries,
    getTotalDuration, formatDuration
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}
