import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { FileAttachments } from './file-attachments'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/lib/actions/files', () => ({
  uploadConsultationFile: vi.fn(),
  deleteConsultationFile: vi.fn(),
}))

const baseProps = {
  consultationId: 'c-123',
  missionaryId: 'm-456',
}

describe('FileAttachments', () => {
  it('renders empty state when no files', () => {
    render(<FileAttachments {...baseProps} initialFiles={[]} />)
    expect(screen.getByText('Nenhum anexo.')).toBeInTheDocument()
  })

  it('renders file names when files are provided', () => {
    const files = [
      {
        id: 'f-1',
        consultation_id: 'c-123',
        file_name: 'radiografia.jpg',
        file_path: 'path/to/file.jpg',
        file_type: 'image/jpeg',
        file_size: 204800,
        created_at: '2026-04-20T10:00:00Z',
        url: 'https://example.com/signed-url',
      },
    ]
    render(<FileAttachments {...baseProps} initialFiles={files} />)
    expect(screen.getByText('radiografia.jpg')).toBeInTheDocument()
    expect(screen.getByText('200 KB')).toBeInTheDocument()
  })
})
