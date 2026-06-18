'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createConsultation(formData: FormData) {
  const supabase = await createClient()
  const patientId = formData.get('patient_id') as string

  if (!patientId?.trim()) throw new Error('Paciente não selecionado.')
  const consulted_at = formData.get('consulted_at') as string
  if (!consulted_at) throw new Error('Data da consulta é obrigatória.')

  const { data, error } = await supabase.from('consultations').insert({
    patient_id: patientId,
    appointment_id: formData.get('appointment_id') as string || null,
    consulted_at,
    chief_complaint: formData.get('chief_complaint') as string || null,
    vital_bp: formData.get('vital_bp') as string || null,
    vital_temp: formData.get('vital_temp') ? parseFloat(formData.get('vital_temp') as string) : null,
    vital_hr: formData.get('vital_hr') ? parseInt(formData.get('vital_hr') as string) : null,
    vital_spo2: formData.get('vital_spo2') ? parseInt(formData.get('vital_spo2') as string) : null,
    vital_weight: formData.get('vital_weight') ? parseFloat(formData.get('vital_weight') as string) : null,
    clinical_notes: formData.get('clinical_notes') as string || null,
    diagnosis: formData.get('diagnosis') as string || null,
    cid10: formData.get('cid10') as string || null,
    treatment: formData.get('treatment') as string || null,
    follow_up_date: formData.get('follow_up_date') as string || null,
    status: formData.get('status') as string || 'resolved',
  }).select('id').single()

  if (error) throw new Error(error.message)

  const consultationId = data.id

  const files = formData.getAll('files') as File[]
  const validFiles = files.filter(f => f.size > 0)

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  for (const file of validFiles) {
    if (file.size > 10 * 1024 * 1024) continue
    if (!allowedTypes.includes(file.type)) continue

    const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const path = `${patientId}/${consultationId}/${safeName}`

    const { error: storageError } = await supabase.storage
      .from('consultation-files')
      .upload(path, file)

    if (!storageError) {
      await supabase.from('consultation_files').insert({
        consultation_id: consultationId,
        file_name: file.name,
        file_path: path,
        file_type: file.type,
        file_size: file.size,
      })
    }
  }

  revalidatePath(`/pacientes/${patientId}`)
  redirect(`/consultas/${consultationId}`)
}
