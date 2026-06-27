import { getInitials, getAvatarColor } from '../../data/seedData'

export default function Avatar({ name, size = 'md', className = '' }) {
  const initials = getInitials(name)
  const color = getAvatarColor(name)

  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : size === 'xl' ? 'avatar-xl' : ''

  return (
    <div
      className={`avatar ${sizeClass} ${className}`}
      style={{ background: color }}
      title={name}
    >
      {initials}
    </div>
  )
}
