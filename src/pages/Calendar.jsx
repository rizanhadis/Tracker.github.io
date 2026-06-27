import { useState, useMemo } from 'react'
import { useApp } from '../context/AppContext'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default function CalendarPage() {
  const { projects, tasks } = useApp()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())
  const [selectedDate, setSelectedDate] = useState(null)

  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1)
    const lastDay = new Date(currentYear, currentMonth + 1, 0)
    const startOffset = firstDay.getDay()

    const days = []

    // Previous month days
    const prevMonthLast = new Date(currentYear, currentMonth, 0).getDate()
    for (let i = startOffset - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth - 1, prevMonthLast - i),
        otherMonth: true
      })
    }

    // Current month days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({
        date: new Date(currentYear, currentMonth, d),
        otherMonth: false
      })
    }

    // Next month days to fill grid
    const remaining = 42 - days.length
    for (let d = 1; d <= remaining; d++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, d),
        otherMonth: true
      })
    }

    return days
  }, [currentMonth, currentYear])

  // All deadlines (tasks + projects)
  const deadlines = useMemo(() => {
    const items = []
    tasks.forEach(t => {
      if (t.deadline) {
        const project = projects.find(p => p.id === t.projectId)
        items.push({
          date: t.deadline,
          title: t.title,
          type: 'task',
          color: project?.color || 'var(--primary)',
          status: t.status,
          projectName: project?.name
        })
      }
    })
    projects.forEach(p => {
      if (p.deadline) {
        items.push({
          date: p.deadline,
          title: `🎯 ${p.name}`,
          type: 'project',
          color: p.color,
          status: p.status
        })
      }
    })
    return items
  }, [tasks, projects])

  const getDateDeadlines = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return deadlines.filter(d => d.date === dateStr)
  }

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }

  const goToday = () => {
    setCurrentMonth(today.getMonth())
    setCurrentYear(today.getFullYear())
  }

  const isToday = (date) => {
    return date.toDateString() === today.toDateString()
  }

  const selectedDeadlines = selectedDate ? getDateDeadlines(selectedDate) : []

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>Kalender</h1>
        <button className="btn btn-secondary btn-sm" onClick={goToday}>Hari Ini</button>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: '1fr 320px', gap: 'var(--space-lg)' }}>
        {/* Calendar */}
        <div className="calendar">
          <div className="calendar-header">
            <button className="btn btn-ghost btn-icon" onClick={prevMonth}>
              <ChevronLeft size={18} />
            </button>
            <h3>{MONTH_NAMES[currentMonth]} {currentYear}</h3>
            <button className="btn btn-ghost btn-icon" onClick={nextMonth}>
              <ChevronRight size={18} />
            </button>
          </div>

          <div className="calendar-grid">
            {DAY_NAMES.map(d => (
              <div key={d} className="calendar-day-name">{d}</div>
            ))}
            {calendarDays.map((day, i) => {
              const dayDeadlines = getDateDeadlines(day.date)
              const selected = selectedDate && day.date.toDateString() === selectedDate.toDateString()

              return (
                <div
                  key={i}
                  className={`calendar-day ${day.otherMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
                  onClick={() => setSelectedDate(day.date)}
                  style={{
                    outline: selected ? '2px solid var(--primary)' : 'none',
                    outlineOffset: -2,
                    borderRadius: selected ? 'var(--radius-sm)' : 0
                  }}
                >
                  <div className="calendar-day-number">{day.date.getDate()}</div>
                  {dayDeadlines.slice(0, 3).map((dl, j) => (
                    <div key={j} className="calendar-event"
                      style={{ background: `${dl.color}25`, color: dl.color }}>
                      {dl.title}
                    </div>
                  ))}
                  {dayDeadlines.length > 3 && (
                    <div className="text-xs text-muted" style={{ padding: '0 6px' }}>
                      +{dayDeadlines.length - 3} lainnya
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Sidebar detail */}
        <div className="card-static" style={{ alignSelf: 'start', position: 'sticky', top: 'calc(var(--topbar-height) + var(--space-lg))' }}>
          <h4 className="mb-md">
            {selectedDate
              ? selectedDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
              : 'Pilih tanggal'}
          </h4>

          {selectedDate ? (
            selectedDeadlines.length > 0 ? (
              <div className="flex flex-col gap-sm">
                {selectedDeadlines.map((dl, i) => (
                  <div key={i} style={{
                    padding: '10px 14px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    borderLeft: `3px solid ${dl.color}`
                  }}>
                    <div className="text-sm font-medium">{dl.title}</div>
                    <div className="flex items-center gap-sm mt-xs">
                      <span className={`badge badge-${dl.status?.toLowerCase().replace(' ', '')}`} style={{ fontSize: '0.65rem' }}>
                        {dl.status}
                      </span>
                      {dl.projectName && (
                        <span className="text-xs text-muted">{dl.projectName}</span>
                      )}
                      <span className="text-xs text-muted">{dl.type === 'project' ? 'Proyek' : 'Task'}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-secondary">Tidak ada deadline pada tanggal ini</p>
            )
          ) : (
            <p className="text-sm text-secondary">Klik tanggal di kalender untuk melihat detail</p>
          )}
        </div>
      </div>
    </div>
  )
}
