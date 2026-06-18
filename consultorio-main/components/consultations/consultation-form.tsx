'use client'
import { AllergyAlert } from './allergy-alert'
import { VitalSignsFields } from './vital-signs-fields'
import { Patient } from '@/lib/types'
import { useState } from 'react'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { DatePicker } from '@/components/ui/date-picker'

interface Props {
  patients: Pick<Patient, 'id' | 'preferred_name' | 'allergies'>[]
  preselectedPatientId?: string
  action: (formData: FormData) => Promise<void>
}

export function ConsultationForm({ patients, preselectedPatientId, action }: Props) {
  const [selectedId, setSelectedId] = useState(preselectedPatientId ?? '')
  const selected = patients.find(p => p.id === selectedId)

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="patient_id" value={selectedId} />

      <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Paciente *</label>
          <select
            required
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="">Selecionar paciente...</option>
            {patients.map(p => (
              <option key={p.id} value={p.id}>
                {p.preferred_name}
              </option>
            ))}
          </select>
        </div>

        {selected?.allergies && <AllergyAlert allergies={selected.allergies} />}

        <DateTimePicker name="consulted_at" label="Data e hora" required />
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
        <VitalSignsFields />
      </div>

      <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <TextArea label="Motivo da consulta" name="chief_complaint" placeholder="Descreva o motivo da consulta..." />
        <TextArea label="Notas clínicas" name="clinical_notes" placeholder="Exame físico, observações..." />
      </div>

      <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <TextArea label="Diagnóstico" name="diagnosis" placeholder="Ex: Lombalgia aguda" />
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>CID-10 (opcional)</label>
          <input
            name="cid10"
            type="text"
            placeholder="Ex: M54.5"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
        <TextArea label="Tratamento / Medicação" name="treatment" placeholder="Ex: Ibuprofeno 400mg 8/8h por 5 dias..." />
      </div>

      <div className="rounded-xl p-4 grid grid-cols-2 gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <DatePicker name="follow_up_date" label="Data de retorno" />
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Status</label>
          <select
            name="status"
            defaultValue="resolved"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="resolved">Resolvido</option>
            <option value="follow_up">Acompanhamento</option>
            <option value="referral">Encaminhamento</option>
          </select>
        </div>
      </div>

      <div className="rounded-xl p-4 flex flex-col gap-3" style={{ background: 'var(--bg-overlay)' }}>
        <label className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
          Anexos (opcional)
        </label>
        <label
          className="flex flex-col items-center justify-center gap-2 rounded-lg py-6 text-sm cursor-pointer transition-colors"
          style={{
            border: '1px dashed rgba(124,58,237,0.4)',
            color: 'var(--text-muted)',
          }}
        >
          <span className="text-2xl">📎</span>
          <span>Clique para selecionar arquivos</span>
          <span className="text-xs" style={{ color: 'var(--text-muted)', opacity: 0.7 }}>
            PDF, JPG, PNG · máx 10MB cada
          </span>
          <input
            type="file"
            name="files"
            multiple
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={!selectedId}
        className="bg-violet-600 hover:bg-violet-700 disabled:opacity-40 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        Salvar Consulta
      </button>
    </form>
  )
}

function TextArea({ label, name, placeholder }: { label: string; name: string; placeholder?: string }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>{label}</label>
      <textarea
        name={name}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 resize-none"
        style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
      />
    </div>
  )
}
