'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createMissionary(formData: FormData) {
  const supabase = await createClient()

  const required = ['full_name', 'preferred_name', 'birthdate', 'mission_id']
  for (const field of required) {
    const val = formData.get(field) as string
    if (!val?.trim()) throw new Error(`Campo obrigatório ausente: ${field}`)
  }

  const { data, error } = await supabase
    .from('missionaries')
    .insert({
      full_name: formData.get('full_name') as string,
      preferred_name: formData.get('preferred_name') as string,
      birthdate: formData.get('birthdate') as string,
      country_of_origin: (formData.get('country_of_origin') as string) || 'Brasil',
      mission_id: formData.get('mission_id') as string,
      current_area: formData.get('current_area') as string || null,
      companion_name: formData.get('companion_name') as string || null,
      mission_start_date: formData.get('mission_start_date') as string || null,
      mission_expected_end: formData.get('mission_expected_end') as string || null,
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
  redirect(`/missionaries/${data.id}`)
}

export async function updateMissionary(id: string, formData: FormData) {
  const supabase = await createClient()

  const required = ['full_name', 'preferred_name', 'birthdate', 'mission_id', 'status']
  for (const field of required) {
    const val = formData.get(field) as string
    if (!val?.trim()) throw new Error(`Campo obrigatório ausente: ${field}`)
  }

  const { error } = await supabase
    .from('missionaries')
    .update({
      full_name: formData.get('full_name') as string,
      preferred_name: formData.get('preferred_name') as string,
      birthdate: formData.get('birthdate') as string,
      country_of_origin: (formData.get('country_of_origin') as string) || 'Brasil',
      mission_id: formData.get('mission_id') as string,
      current_area: formData.get('current_area') as string || null,
      companion_name: formData.get('companion_name') as string || null,
      mission_start_date: formData.get('mission_start_date') as string || null,
      mission_expected_end: formData.get('mission_expected_end') as string || null,
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
  redirect(`/missionaries/${id}`)
}

export async function deleteMissionary(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('missionaries')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)
  redirect('/missionaries')
}
