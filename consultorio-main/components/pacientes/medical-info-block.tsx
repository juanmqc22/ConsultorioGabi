import { Patient } from '@/lib/types'

export function MedicalInfoBlock({ patient: p }: { patient: Patient }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
      <h3 className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Info Médica</h3>
      <div className="flex flex-col gap-2 text-sm">
        {p.blood_type && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Tipo sanguíneo</span>
            <span className="font-medium">{p.blood_type}</span>
          </div>
        )}
        {p.allergies && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Alergias</span>
            <span className="font-medium text-red-400">{p.allergies}</span>
          </div>
        )}
        {p.chronic_conditions && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Condições</span>
            <span className="font-medium text-right max-w-[60%]">{p.chronic_conditions}</span>
          </div>
        )}
        {p.cpf && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>CPF</span>
            <span className="font-medium">{p.cpf}</span>
          </div>
        )}
        {p.emergency_contact_name && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Contato emergência</span>
            <span className="font-medium text-right">
              {p.emergency_contact_name}
              {p.emergency_contact_phone && ` · ${p.emergency_contact_phone}`}
            </span>
          </div>
        )}
        {!p.blood_type && !p.allergies && !p.chronic_conditions && !p.emergency_contact_name && !p.cpf && (
          <p style={{ color: 'var(--text-muted)' }}>Sem informação médica registrada.</p>
        )}
      </div>
    </div>
  )
}
