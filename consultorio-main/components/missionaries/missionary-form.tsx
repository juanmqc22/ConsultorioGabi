'use client'
import { Mission, Missionary } from '@/lib/types'
import { DatePicker } from '@/components/ui/date-picker'

interface Props {
  missions: Mission[]
  missionary?: Missionary
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export function MissionaryForm({ missions, missionary: m, action, submitLabel }: Props) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <section className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <h3 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Datos Personales</h3>
        <Field label="Nombre completo" name="full_name" required defaultValue={m?.full_name} />
        <Field label="Nombre preferido (ej: Elder Silva)" name="preferred_name" required defaultValue={m?.preferred_name} />
        <div className="grid grid-cols-2 gap-3">
          <DatePicker label="Fecha de nacimiento" name="birthdate" required defaultValue={m?.birthdate} yearRange={{ from: 1980, to: new Date().getFullYear() }} />
          <Field label="País de origen" name="country_of_origin" defaultValue={m?.country_of_origin ?? 'Bolivia'} />
        </div>
        <Field label="Teléfono" name="phone" type="tel" defaultValue={m?.phone ?? ''} />
      </section>

      <section className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <h3 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Misión</h3>
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Misión *</label>
          <select
            name="mission_id"
            required
            defaultValue={m?.mission_id ?? ''}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="">Seleccionar...</option>
            {missions.map(miss => (
              <option key={miss.id} value={miss.id}>{miss.name}</option>
            ))}
          </select>
        </div>
        <Field label="Área actual" name="current_area" defaultValue={m?.current_area ?? ''} />
        <Field label="Nombre del compañero" name="companion_name" defaultValue={m?.companion_name ?? ''} />
        <div className="grid grid-cols-2 gap-3">
          <DatePicker label="Fecha de llegada" name="mission_start_date" defaultValue={m?.mission_start_date ?? undefined} />
          <DatePicker label="Fin previsto" name="mission_expected_end" defaultValue={m?.mission_expected_end ?? undefined} />
        </div>
        {m && (
          <div>
            <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Estado</label>
            <select
              name="status"
              defaultValue={m.status}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              <option value="active">Activo</option>
              <option value="transferred">Transferido</option>
              <option value="released">Liberado</option>
              <option value="medical_leave">Licencia médica</option>
            </select>
          </div>
        )}
      </section>

      <section className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <h3 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Info Médica</h3>
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Tipo de sangre</label>
          <select
            name="blood_type"
            defaultValue={m?.blood_type ?? ''}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="">Desconocido</option>
            {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <Field label="Alergias" name="allergies" defaultValue={m?.allergies ?? ''} placeholder="Ej: Penicilina, Dipirona" />
        <Field label="Condiciones crónicas" name="chronic_conditions" defaultValue={m?.chronic_conditions ?? ''} textarea />
        <Field label="Contacto de emergencia (nombre)" name="emergency_contact_name" defaultValue={m?.emergency_contact_name ?? ''} />
        <Field label="Contacto de emergencia (teléfono)" name="emergency_contact_phone" type="tel" defaultValue={m?.emergency_contact_phone ?? ''} />
        <Field label="Observaciones generales" name="notes" defaultValue={m?.notes ?? ''} textarea />
      </section>

      <button
        type="submit"
        className="bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  )
}

function Field({
  label, name, required, defaultValue, type = 'text', placeholder, textarea
}: {
  label: string
  name: string
  required?: boolean
  defaultValue?: string
  type?: string
  placeholder?: string
  textarea?: boolean
}) {
  const sharedStyle = {
    background: 'var(--bg-base)',
    color: 'var(--text)',
    border: '1px solid var(--border)',
  }
  const sharedClass = 'w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500'
  return (
    <div>
      <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>
        {label}{required && ' *'}
      </label>
      {textarea ? (
        <textarea name={name} defaultValue={defaultValue} placeholder={placeholder} rows={3} className={sharedClass} style={sharedStyle} />
      ) : (
        <input name={name} type={type} defaultValue={defaultValue} placeholder={placeholder} required={required} className={sharedClass} style={sharedStyle} />
      )}
    </div>
  )
}
