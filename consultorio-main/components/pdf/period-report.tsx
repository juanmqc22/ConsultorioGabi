import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { ConsultationStatus, ConsultationFilterResult } from '@/lib/types'

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  resolved: 'Resolvido',
  follow_up: 'Acompanhamento',
  referral: 'Encaminhamento',
}

const MONTHS_PT = [
  '', 'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  header: { marginBottom: 20, borderBottom: '2px solid #7c3aed', paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#666' },
  table: { marginTop: 12 },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f3f4f6',
    padding: '6 8',
    borderBottom: '1px solid #e0e0e0',
  },
  tableRow: {
    flexDirection: 'row',
    padding: '5 8',
    borderBottom: '1px solid #f0f0f0',
  },
  colPatient: { width: '25%', fontSize: 9 },
  colDate: { width: '12%', fontSize: 9 },
  colComplaint: { width: '28%', fontSize: 9 },
  colDiagnosis: { width: '25%', fontSize: 9 },
  colStatus: { width: '10%', fontSize: 9 },
  headerText: { fontSize: 8, fontWeight: 'bold', color: '#666', textTransform: 'uppercase' },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 32,
    right: 32,
    textAlign: 'center',
    fontSize: 8,
    color: '#aaa',
    borderTop: '1px solid #eee',
    paddingTop: 6,
  },
  summary: { fontSize: 10, color: '#666', marginBottom: 12 },
})

export interface PeriodReportData {
  month: number
  year: number
  consultations: ConsultationFilterResult[]
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

export function PeriodReport({ data }: { data: PeriodReportData }) {
  const { month, year, consultations } = data
  const today = new Date().toLocaleDateString('pt-BR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>
            Relatório de Consultas — {MONTHS_PT[month]} {year}
          </Text>
          <Text style={styles.subtitle}>Consultório Médico</Text>
        </View>

        <Text style={styles.summary}>
          {consultations.length} consulta{consultations.length !== 1 ? 's' : ''} encontrada{consultations.length !== 1 ? 's' : ''} no período.
        </Text>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.colPatient, styles.headerText]}>Paciente</Text>
            <Text style={[styles.colDate, styles.headerText]}>Data</Text>
            <Text style={[styles.colComplaint, styles.headerText]}>Motivo</Text>
            <Text style={[styles.colDiagnosis, styles.headerText]}>Diagnóstico</Text>
            <Text style={[styles.colStatus, styles.headerText]}>Status</Text>
          </View>

          {consultations.map((c, i) => (
            <View key={c.id} style={[styles.tableRow, i % 2 === 0 ? {} : { backgroundColor: '#fafafa' }]}>
              <Text style={styles.colPatient}>
                {c.patient?.preferred_name ?? '—'}
              </Text>
              <Text style={styles.colDate}>
                {formatDate(c.consulted_at)}
              </Text>
              <Text style={styles.colComplaint}>
                {c.chief_complaint ?? '—'}
              </Text>
              <Text style={styles.colDiagnosis}>
                {c.diagnosis ?? '—'}
              </Text>
              <Text style={styles.colStatus}>
                {STATUS_LABELS[c.status]}
              </Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>
          Gerado em {today} — Consultório Médico
        </Text>
      </Page>
    </Document>
  )
}
