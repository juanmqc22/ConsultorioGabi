'use client'
import { useState } from 'react'
import { pdf } from '@react-pdf/renderer'
import { PeriodReport, PeriodReportData } from './period-report'

const MONTHS_ES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function ExportPeriodPdfButton({ data }: { data: PeriodReportData }) {
  const [loading, setLoading] = useState(false)

  async function handleExport() {
    setLoading(true)
    try {
      const blob = await pdf(<PeriodReport data={data} />).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-${MONTHS_ES[data.month]}-${data.year}.pdf`.toLowerCase()
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading || data.consultations.length === 0}
      className="w-full py-3 rounded-xl font-semibold transition-colors disabled:opacity-40"
      style={{ background: '#7c3aed', color: 'white' }}
    >
      {loading ? 'Gerando PDF...' : `Gerar PDF (${data.consultations.length})`}
    </button>
  )
}
