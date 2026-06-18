'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadConsultationFile(formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file') as File
  const consultationId = formData.get('consultationId') as string
  const patientId = formData.get('patientId') as string

  if (!file || file.size === 0) throw new Error('Arquivo inválido.')
  if (file.size > 10 * 1024 * 1024) throw new Error('Arquivo deve ter no máximo 10MB.')

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
  if (!allowedTypes.includes(file.type)) throw new Error('Tipo de arquivo não suportado.')

  const safeName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`
  const path = `${patientId}/${consultationId}/${safeName}`

  const { error: storageError } = await supabase.storage
    .from('consultation-files')
    .upload(path, file)

  if (storageError) throw new Error(storageError.message)

  const { error: dbError } = await supabase.from('consultation_files').insert({
    consultation_id: consultationId,
    file_name: file.name,
    file_path: path,
    file_type: file.type,
    file_size: file.size,
  })

  if (dbError) {
    await supabase.storage.from('consultation-files').remove([path])
    throw new Error(dbError.message)
  }

  revalidatePath(`/consultas/${consultationId}`)
}

export async function deleteConsultationFile(
  fileId: string,
  filePath: string,
  consultationId: string
) {
  const supabase = await createClient()

  const { error: dbError } = await supabase
    .from('consultation_files')
    .delete()
    .eq('id', fileId)

  if (dbError) throw new Error(dbError.message)

  const { error: storageError } = await supabase.storage
    .from('consultation-files')
    .remove([filePath])

  if (storageError) throw new Error(storageError.message)

  revalidatePath(`/consultas/${consultationId}`)
}
