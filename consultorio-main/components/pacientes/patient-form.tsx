'use client'
import { Patient } from '@/lib/types'
import { DatePicker } from '@/components/ui/date-picker'

interface Props {
  patient?: Patient
  action: (formData: FormData) => Promise<void>
  submitLabel: string
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export function PatientForm({ patient: p, action, submitLabel }: Props) {
  return (
    <form action={action} className="flex flex-col gap-5">
      <section className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <h3 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Dados Pessoais</h3>
        <Field label="Nome completo" name="full_name" required defaultValue={p?.full_name} />
        <Field label="Nome preferido" name="preferred_name" required defaultValue={p?.preferred_name} />
        <DatePicker label="Data de nascimento" name="birthdate" required defaultValue={p?.birthdate} yearRange={{ from: 1920, to: new Date().getFullYear() }} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="CPF" name="cpf" defaultValue={p?.cpf ?? ''} placeholder="000.000.000-00" />
          <Field label="Telefone" name="phone" type="tel" defaultValue={p?.phone ?? ''} />
        </div>
        <Field label="E-mail" name="email" type="email" defaultValue={p?.email ?? ''} />
      </section>

      {p && (
        <section className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
          <h3 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Status</h3>
          <div>
            <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Status do paciente</label>
            <select
              name="status"
              defaultValue={p.status}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
              style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
            >
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </select>
          </div>
        </section>
      )}

      <section className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <h3 className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Info Médica</h3>
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Tipo sanguíneo</label>
          <select
            name="blood_type"
            defaultValue={p?.blood_type ?? ''}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="">Desconhecido</option>
            {BLOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <Field label="Alergias" name="allergies" defaultValue={p?.allergies ?? ''} placeholder="Ex: Penicilina, Dipirona" />
        <Field label="Condições crônicas" name="chronic_conditions" defaultValue={p?.chronic_conditions ?? ''} textarea />
        <Field label="Contato de emergência (nome)" name="emergency_contact_name" defaultValue={p?.emergency_contact_name ?? ''} />
        <Field label="Contato de emergência (telefone)" name="emergency_contact_phone" type="tel" defaultValue={p?.emergency_contact_phone ?? ''} />
        <Field label="Observações gerais" name="notes" defaultValue={p?.notes ?? ''} textarea />
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
