'use client'
import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ConsultationFile } from '@/lib/types'
import { uploadConsultationFile, deleteConsultationFile } from '@/lib/actions/files'

interface Props {
  consultationId: string
  patientId: string
  initialFiles: ConsultationFile[]
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function FileAttachments({ consultationId, patientId, initialFiles }: Props) {
  const [files, setFiles] = useState<ConsultationFile[]>(initialFiles)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? [])
    if (selected.length === 0) return

    setUploading(true)
    setError(null)

    let hasError = false
    for (const file of selected) {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('consultationId', consultationId)
      formData.append('patientId', patientId)
      try {
        await uploadConsultationFile(formData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao fazer upload.')
        hasError = true
      }
    }

    setUploading(false)
    e.target.value = ''
    if (!hasError) router.refresh()
  }

  function handleDelete(fileId: string, filePath: string) {
    startTransition(async () => {
      try {
        await deleteConsultationFile(fileId, filePath, consultationId)
        setFiles(prev => prev.filter(f => f.id !== fileId))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao remover arquivo.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Anexos
        </span>
        <label
          className="text-xs px-3 py-1 rounded-lg cursor-pointer transition-colors"
          style={{
            background: 'rgba(124,58,237,0.15)',
            color: '#a78bfa',
            border: '1px solid rgba(124,58,237,0.3)',
          }}
        >
          {uploading ? 'Enviando...' : '+ Adicionar'}
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={handleFileChange}
            disabled={uploading || isPending}
            className="hidden"
          />
        </label>
      </div>

      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {files.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Nenhum anexo.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {files.map(file => (
            <div
              key={file.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg text-sm"
              style={{ background: 'var(--bg-base)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base leading-none flex-shrink-0">
                  {file.file_type.startsWith('image/') ? '🖼️' : '📄'}
                </span>
                <div className="min-w-0">
                  <div className="truncate font-medium">{file.file_name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatFileSize(file.file_size)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                {file.url && (
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Abrir
                  </a>
                )}
                <button
                  onClick={() => handleDelete(file.id, file.file_path)}
                  disabled={isPending}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors disabled:opacity-40"
                >
                  Remover
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
