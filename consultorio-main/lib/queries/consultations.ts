import { createClient } from '@/lib/supabase/server'
import { ConsultationStatus, ConsultationWithDetails, ConsultationFilterResult } from '@/lib/types'

export async function getConsultationById(id: string): Promise<ConsultationWithDetails> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('consultations')
    .select(`
      *,
      patient:patients(id, preferred_name, full_name),
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
  month,
  year,
  status,
  patientId,
}: {
  month: number
  year: number
  status?: ConsultationStatus | 'all'
  patientId?: string
}): Promise<ConsultationFilterResult[]> {
  const supabase = await createClient()

  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const daysInMonth = new Date(year, month, 0).getDate()
  const endDate = `${year}-${String(month).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}T23:59:59`

  let query = supabase
    .from('consultations')
    .select(`
      id, consulted_at, chief_complaint, diagnosis, status,
      patient:patients(preferred_name, full_name)
    `)
    .gte('consulted_at', startDate)
    .lte('consulted_at', endDate)
    .order('consulted_at', { ascending: false })

  if (patientId) query = query.eq('patient_id', patientId)
  if (status && status !== 'all') query = query.eq('status', status as ConsultationStatus)

  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as unknown as ConsultationFilterResult[]
}
