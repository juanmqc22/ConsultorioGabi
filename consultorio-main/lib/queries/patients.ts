import { createClient } from '@/lib/supabase/server'

export async function getPatients(search?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('patients')
    .select(`
      id, preferred_name, full_name, birthdate, cpf, email, phone,
      allergies, status,
      last_consultation:consultations(status, consulted_at)
    `)
    .eq('status', 'active')
    .order('preferred_name')
    .order('consulted_at', { ascending: false, foreignTable: 'last_consultation' })
    .limit(1, { foreignTable: 'last_consultation' })

  if (search) query = query.ilike('preferred_name', `%${search}%`)

  const { data, error } = await query
  if (error) throw error
  return data ?? []
}

export async function getPatientById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function getConsultationHistory(patientId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('consultations')
    .select(`
      id, consulted_at, chief_complaint, diagnosis, cid10, treatment,
      status, follow_up_date, clinical_notes, vital_bp, vital_hr,
      vital_temp, vital_spo2, vital_weight,
      files:consultation_files(id, file_name, file_path, file_type, file_size, created_at)
    `)
    .eq('patient_id', patientId)
    .order('consulted_at', { ascending: false })
  return data ?? []
}

export async function getPatientsForSelect() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('patients')
    .select('id, preferred_name')
    .eq('status', 'active')
    .order('preferred_name')
  return data ?? []
}
