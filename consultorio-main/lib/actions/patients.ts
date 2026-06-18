'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createPatient(formData: FormData) {
  const supabase = await createClient()

  const required = ['full_name', 'preferred_name', 'birthdate']
  for (const field of required) {
    const val = formData.get(field) as string
    if (!val?.trim()) throw new Error(`Campo obrigatório ausente: ${field}`)
  }

  const { data, error } = await supabase
    .from('patients')
    .insert({
      full_name: formData.get('full_name') as string,
      preferred_name: formData.get('preferred_name') as string,
      birthdate: formData.get('birthdate') as string,
      cpf: formData.get('cpf') as string || null,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      emergency_contact_name: formData.get('emergency_contact_name') as string || null,
      emergency_contact_phone: formData.get('emergency_contact_phone') as string || null,
      blood_type: formData.get('blood_type') as string || null,
      allergies: formData.get('allergies') as string || null,
      chronic_conditions: formData.get('chronic_conditions') as string || null,
      notes: formData.get('notes') as string || null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  redirect(`/pacientes/${data.id}`)
}

export async function updatePatient(id: string, formData: FormData) {
  const supabase = await createClient()

  const required = ['full_name', 'preferred_name', 'birthdate', 'status']
  for (const field of required) {
    const val = formData.get(field) as string
    if (!val?.trim()) throw new Error(`Campo obrigatório ausente: ${field}`)
  }

  const { error } = await supabase
    .from('patients')
    .update({
      full_name: formData.get('full_name') as string,
      preferred_name: formData.get('preferred_name') as string,
      birthdate: formData.get('birthdate') as string,
      cpf: formData.get('cpf') as string || null,
      email: formData.get('email') as string || null,
      phone: formData.get('phone') as string || null,
      emergency_contact_name: formData.get('emergency_contact_name') as string || null,
      emergency_contact_phone: formData.get('emergency_contact_phone') as string || null,
      blood_type: formData.get('blood_type') as string || null,
      allergies: formData.get('allergies') as string || null,
      chronic_conditions: formData.get('chronic_conditions') as string || null,
      notes: formData.get('notes') as string || null,
      status: formData.get('status') as string || 'active',
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
  redirect(`/pacientes/${id}`)
}

export async function deletePatient(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  redirect('/pacientes')
}
