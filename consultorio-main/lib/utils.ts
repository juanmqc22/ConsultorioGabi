import { ConsultationStatus, HealthStatus, AppointmentStatus } from './types'

export function getMissionaryHealthStatus(
  missionary: { allergies: string | null },
  lastConsultation: { status: ConsultationStatus } | null
): HealthStatus {
  if (missionary.allergies && missionary.allergies.trim().length > 0) return 'alergia'
  if (lastConsultation?.status === 'follow_up') return 'acompanhamento'
  return 'saudavel'
}

export function formatAge(birthdate: string): number {
  const birth = new Date(birthdate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

export function formatDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export function startOfDay(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString()
}

export function endOfDay(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999).toISOString()
}

export function startOfWeek(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() - d.getDay())
  return startOfDay(d)
}

export function endOfWeek(date: Date): string {
  const d = new Date(date)
  d.setDate(d.getDate() + (6 - d.getDay()))
  return endOfDay(d)
}

/** Returns 7 Date objects for the week containing `date`, starting on Monday. */
export function getWeekDays(date: Date): Date[] {
  const d = new Date(date)
  const day = d.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(12, 0, 0, 0)
  return Array.from({ length: 7 }, (_, i) => {
    const weekDay = new Date(d)
    weekDay.setDate(d.getDate() + i)
    return weekDay
  })
}

/** Formats a Date to YYYY-MM-DD string */
export function toDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export const HEALTH_STATUS_LABELS: Record<HealthStatus, string> = {
  saudavel: 'Saludable',
  acompanhamento: 'Seguimiento',
  alergia: 'Alergia',
}

export const HEALTH_STATUS_COLORS: Record<HealthStatus, string> = {
  saudavel: 'bg-emerald-500/20 text-emerald-400',
  acompanhamento: 'bg-amber-500/20 text-amber-400',
  alergia: 'bg-red-500/20 text-red-400',
}

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  scheduled: 'Programado',
  confirmed: 'Confirmado',
  completed: 'Realizado',
  cancelled: 'Cancelado',
  no_show: 'No se presentó',
}

export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  scheduled: 'bg-slate-500/20 text-slate-300',
  confirmed: 'bg-emerald-500/20 text-emerald-400',
  completed: 'bg-violet-500/20 text-violet-400',
  cancelled: 'bg-red-500/20 text-red-400',
  no_show: 'bg-red-500/20 text-red-400',
}
