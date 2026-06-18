import { createClient } from '@/lib/supabase/server'
import { ConsultationStatus, ConsultationWithDetails, ConsultationFilterResult } from '@/lib/types'

export async function getConsultationById(id: string): Promise<ConsultationWithDetails> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      missionary:missionaries(id, preferred_name, full_name, mission_id, mission:missions(short_name, color)),
      files:consultation_files(id, file_name, file_path, file_type, file_size, created_at)
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  const files = data.files ?? []
  const filesWithUrls = await Promise.all(
    files.map(async (file: { id: string; file_name: string; file_path: string; file_type: string; file_size: number; created_at: string }) => {
      const { data: urlData } = await supabase.storage
        .from('consultation-files')
        .createSignedUrl(file.file_path, 3600)
      return { ...file, url: urlData?.signedUrl ?? null }
    })
  )

  return { ...data, files: filesWithUrls } as ConsultationWithDetails
}

export async function getConsultationsByFilters({
  missionId,
  month,
  year,
  status,
  missionaryId,
}: {
  missionId: string
  month: number
  year: number
  status?: ConsultationStatus | 'all'
  missionaryId?: string
}): Promise<ConsultationFilterResult[]> {
  const supabase = await createClient()

  let missionaryQuery = supabase
    .from('missionaries')
    .select('id')
    .eq('mission_id', missionId)
    .eq('status', 'active')

  if (missionaryId) missionaryQuery = missionaryQuery.eq('id', missionaryId)

  const { data: missionaryData } = await missionaryQuery
  const missionaryIds = (missionaryData ?? []).map((m: { id: string }) => m.id)

  if (missionaryIds.length === 0) return []

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const daysInMonth = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}T23:59:59`

  let query = supabase
    .from('consultations')
    .select(`
      id, consulted_at, chief_complaint, diagnosis, status,
      missionary:missionaries(preferred_name, full_name, mission:missions(short_name))
    `)
    .in('missionary_id', missionaryIds)
    .gte('consulted_at', startDate)
    .lte('consulted_at', endDate)
    .order('consulted_at', { ascending: false })

  if (status && status !== 'all') query = query.eq('status', status as ConsultationStatus)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as ConsultationFilterResult[]
}
