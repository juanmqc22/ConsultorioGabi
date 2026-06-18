import { createClient } from '@/lib/supabase/server'

export async function getMissionaries(missionId?: string, search?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('missionaries')
    .select(`
      id, preferred_name, full_name, birthdate, country_of_origin,
      mission_id, allergies, status,
      mission:missions(id, short_name, color),
      last_consultation:consultations(status, consulted_at)
    `)
    .eq('status', 'active')
    .order('preferred_name')
    .order('consulted_at', { ascending: false, foreignTable: 'last_consultation' })
    .limit(1, { foreignTable: 'last_consultation' })

  if (missionId) query = query.eq('mission_id', missionId)
  if (search) query = query.ilike('preferred_name', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getMissionaryById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('missionaries')
    .select('*, mission:missions(*)')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getMissions() {
  const supabase = await createClient()
  const { data } = await supabase.from('missions').select('*').order('short_name')
  return data ?? []
}

export async function getConsultationHistory(missionaryId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('consultations')
    .select(`
      id, consulted_at, chief_complaint, diagnosis, cid10, treatment,
      status, follow_up_date, clinical_notes, vital_bp, vital_hr,
      vital_temp, vital_spo2, vital_weight,
      files:consultation_files(id, file_name, file_path, file_type, file_size, created_at)
    `)
    .eq('missionary_id', missionaryId)
    .order('consulted_at', { ascending: false })
  return data ?? []
}

export async function getMissionariesByMission(missionId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('missionaries')
    .select('id, preferred_name')
    .eq('mission_id', missionId)
    .eq('status', 'active')
    .order('preferred_name')
  return data ?? []
}
