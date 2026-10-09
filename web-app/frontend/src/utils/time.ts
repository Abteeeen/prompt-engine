/** "just now", "5 mins ago", "yesterday", or a locale date for older timestamps. */
export function formatRelative(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const diffMs = Date.now() - date.getTime()
  const mins = Math.floor(diffMs / 60000)
  const hours = Math.floor(diffMs / 3600000)
  const days = Math.floor(diffMs / 86400000)

  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min${mins > 1 ? 's' : ''} ago`
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days} days ago`
  return date.toLocaleDateString()
}
