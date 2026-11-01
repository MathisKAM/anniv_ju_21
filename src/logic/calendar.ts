/** Builds and downloads a one-event .ics file from a local ISO date-time (YYYY-MM-DDTHH:mm). */
export function downloadInvitation(dateISO: string, title: string, location: string | null) {
  const start = new Date(dateISO)
  if (Number.isNaN(start.getTime())) return
  const end = new Date(start.getTime() + 3 * 60 * 60 * 1000)
  const fmt = (d: Date) => {
    const p = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}T${p(d.getHours())}${p(d.getMinutes())}00`
  }
  const esc = (s: string) => s.replace(/([,;\\])/g, '\\$1')
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Anniv//FR',
    'BEGIN:VEVENT',
    `UID:${fmt(start)}@anniv-surprise`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${esc(title)}`,
    ...(location ? [`LOCATION:${esc(location)}`] : []),
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  const url = URL.createObjectURL(new Blob([lines.join('\r\n')], { type: 'text/calendar' }))
  const a = document.createElement('a')
  a.href = url
  a.download = 'rendez-vous.ics'
  a.click()
  URL.revokeObjectURL(url)
}
