import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { ConsultationStatus, Patient, Consultation, ConsultationFile } from '@/lib/types'

const STATUS_LABELS: Record<ConsultationStatus, string> = {
  resolved: 'Resolvido',
  follow_up: 'Acompanhamento',
  referral: 'Encaminhamento',
}

const styles = StyleSheet.create({
  page: { padding: 32, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  header: { marginBottom: 20, borderBottom: '2px solid #7c3aed', paddingBottom: 12 },
  name: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  subtitle: { fontSize: 10, color: '#666' },
  sectionTitle: {
    fontSize: 8,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#7c3aed',
    marginBottom: 6,
    marginTop: 14,
    letterSpacing: 0.5,
  },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  infoItem: { width: '45%' },
  infoLabel: { fontSize: 8, color: '#888', marginBottom: 1 },
  infoValue: { fontSize: 10 },
  consultationCard: {
    border: '1px solid #e0e0e0',
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  consultationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  consultationTitle: { fontSize: 11, fontWeight: 'bold', flex: 1 },
  badge: {
    fontSize: 8,
    padding: '2 6',
    borderRadius: 10,
    color: '#555',
    border: '1px solid #ccc',
  },
  vitalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 6 },
  vitalChip: { fontSize: 9, color: '#555' },
  field: { marginBottom: 4 },
  fieldLabel: { fontSize: 8, color: '#888', marginBottom: 1 },
  fieldValue: { fontSize: 9 },
  attachmentsList: { fontSize: 8, color: '#888', marginTop: 4 },
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
  noConsultations: { fontSize: 10, color: '#999', fontStyle: 'italic' },
})

export interface PatientReportData {
  patient: Patient
  consultations: (Consultation & { files?: ConsultationFile[] })[]
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('T')[0].split('-')
  return `${d}/${m}/${y}`
}

export function PatientReport({ data }: { data: PatientReportData }) {
  const { patient, consultations } = data
  const today = new Date().toLocaleDateString('pt-BR')

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{patient.full_name}</Text>
          <Text style={styles.subtitle}>
            {patient.phone ?? ''}{patient.email ? ` · ${patient.email}` : ''}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Informações Pessoais</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nome preferido</Text>
            <Text style={styles.infoValue}>{patient.preferred_name}</Text>
          </View>
          {patient.cpf && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>CPF</Text>
              <Text style={styles.infoValue}>{patient.cpf}</Text>
            </View>
          )}
          {patient.phone && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Telefone</Text>
              <Text style={styles.infoValue}>{patient.phone}</Text>
            </View>
          )}
          {patient.email && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>E-mail</Text>
              <Text style={styles.infoValue}>{patient.email}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Informações Médicas</Text>
        <View style={styles.infoGrid}>
          {patient.blood_type && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tipo sanguíneo</Text>
              <Text style={styles.infoValue}>{patient.blood_type}</Text>
            </View>
          )}
          {patient.allergies && (
            <View style={{ width: '100%' }}>
              <Text style={styles.infoLabel}>Alergias</Text>
              <Text style={styles.infoValue}>{patient.allergies}</Text>
            </View>
          )}
          {patient.chronic_conditions && (
            <View style={{ width: '100%' }}>
              <Text style={styles.infoLabel}>Condições crônicas</Text>
              <Text style={styles.infoValue}>{patient.chronic_conditions}</Text>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>
          Histórico de Consultas ({consultations.length})
        </Text>

        {consultations.length === 0 ? (
          <Text style={styles.noConsultations}>Sem consultas registradas.</Text>
        ) : (
          consultations.map(c => (
            <View key={c.id} style={styles.consultationCard}>
              <View style={styles.consultationHeader}>
                <Text style={styles.consultationTitle}>
                  {formatDate(c.consulted_at)} — {c.chief_complaint ?? c.diagnosis ?? 'Consulta'}
                </Text>
                <Text style={styles.badge}>{STATUS_LABELS[c.status]}</Text>
              </View>

              {(c.vital_bp || c.vital_hr || c.vital_temp || c.vital_spo2 || c.vital_weight) && (
                <View style={styles.vitalsRow}>
                  {c.vital_bp && <Text style={styles.vitalChip}>PA: {c.vital_bp}</Text>}
                  {c.vital_hr && <Text style={styles.vitalChip}>FC: {c.vital_hr} bpm</Text>}
                  {c.vital_temp && <Text style={styles.vitalChip}>Temp: {c.vital_temp}°C</Text>}
                  {c.vital_spo2 && <Text style={styles.vitalChip}>SpO2: {c.vital_spo2}%</Text>}
                  {c.vital_weight && <Text style={styles.vitalChip}>Peso: {c.vital_weight} kg</Text>}
                </View>
              )}

              {c.diagnosis && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Diagnóstico</Text>
                  <Text style={styles.fieldValue}>
                    {c.diagnosis}{c.cid10 ? ` (${c.cid10})` : ''}
                  </Text>
                </View>
              )}
              {c.treatment && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Tratamento</Text>
                  <Text style={styles.fieldValue}>{c.treatment}</Text>
                </View>
              )}
              {c.clinical_notes && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Notas clínicas</Text>
                  <Text style={styles.fieldValue}>{c.clinical_notes}</Text>
                </View>
              )}
              {c.follow_up_date && (
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Retorno</Text>
                  <Text style={styles.fieldValue}>{formatDate(c.follow_up_date)}</Text>
                </View>
              )}
              {c.files && c.files.length > 0 && (
                <Text style={styles.attachmentsList}>
                  Anexos: {c.files.map(f => f.file_name).join(', ')}
                </Text>
              )}
            </View>
          ))
        )}

        <Text style={styles.footer}>
          Gerado em {today} — Consultório Médico
        </Text>
      </Page>
    </Document>
  )
}
