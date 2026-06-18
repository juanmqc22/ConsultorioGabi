import { Missionary } from '@/lib/types'

export function MedicalInfoBlock({ missionary: m }: { missionary: Missionary }) {
  return (
    <div className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
      <h3 className="text-xs uppercase tracking-wide mb-3" style={{ color: 'var(--text-muted)' }}>Info Médica</h3>
      <div className="flex flex-col gap-2 text-sm">
        {m.blood_type && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Tipo de sangre</span>
            <span className="font-medium">{m.blood_type}</span>
          </div>
        )}
        {m.allergies && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Alergias</span>
            <span className="font-medium text-red-400">{m.allergies}</span>
          </div>
        )}
        {m.chronic_conditions && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Condiciones</span>
            <span className="font-medium text-right max-w-[60%]">{m.chronic_conditions}</span>
          </div>
        )}
        {m.emergency_contact_name && (
          <div className="flex justify-between">
            <span style={{ color: 'var(--text-muted)' }}>Contacto emergencia</span>
            <span className="font-medium text-right">
              {m.emergency_contact_name}
              {m.emergency_contact_phone && ` · ${m.emergency_contact_phone}`}
            </span>
          </div>
        )}
        {!m.blood_type && !m.allergies && !m.chronic_conditions && !m.emergency_contact_name && (
          <p style={{ color: 'var(--text-muted)' }}>Sin información médica registrada.</p>
        )}
      </div>
    </div>
  )
}
