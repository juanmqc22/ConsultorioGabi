'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createAppointment(formData: FormData) {
  const supabase = await createClient()

  const patient_id = formData.get('patient_id') as string
  const scheduled_at = formData.get('scheduled_at') as string
  if (!patient_id?.trim()) throw new Error('Paciente não selecionado.')
  if (!scheduled_at) throw new Error('Data e hora são obrigatórias.')

  const { error } = await supabase.from('appointments').insert({
    patient_id: formData.get('patient_id') as string,
    scheduled_at: formData.get('scheduled_at') as string,
    reason: formData.get('reason') as string || null,
    status: 'scheduled',
    notes: formData.get('notes') as string || null,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/agenda')
  revalidatePath('/dashboard')
}

export async function updateAppointmentStatus(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/agenda')
  revalidatePath('/dashboard')
}
