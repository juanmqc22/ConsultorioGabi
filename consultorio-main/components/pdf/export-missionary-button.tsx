'use client'
import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { MissionaryReport, MissionaryReportData } from './missionary-report'

export function ExportMissionaryPdfButton({ data }: { data: MissionaryReportData }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const blob = await pdf(<MissionaryReport data={data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${data.missionary.preferred_name.toLowerCase().replace(/\s+/g, '-')}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40"
      style={{
        background: 'rgba(16,185,129,0.15)',
        color: '#34d399',
        border: '1px solid rgba(16,185,129,0.3)',
      }}
    >
      {loading ? 'Gerando...' : 'Exportar PDF'}
    </button>
  )
}
