'use client'
import { AllergyAlert } from './allergy-alert'
import { VitalSignsFields } from './vital-signs-fields'
import { Mission, Missionary } from '@/lib/types'
import { useState } from 'react'
import { DateTimePicker } from '@/components/ui/datetime-picker'
import { DatePicker } from '@/components/ui/date-picker'

interface Props {
  missionaries: (Pick<Missionary, 'id' | 'preferred_name' | 'allergies'> & { mission: Pick<Mission, 'short_name'> | null })[]
  preselectedMissionaryId?: string
  action: (formData: FormData) => Promise<void>
}

export function ConsultationForm({ missionaries, preselectedMissionaryId, action }: Props) {
  const [selectedId, setSelectedId] = useState(preselectedMissionaryId ?? '')
  const selected = missionaries.find(m => m.id === selectedId)

  return (
    <form action={action} className="flex flex-col gap-5">
      <input type="hidden" name="missionary_id" value={selectedId} />

      <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Misionero *</label>
          <select
            required
            value={selectedId}
            onChange={e => setSelectedId(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="">Seleccionar misionero...</option>
            {missionaries.map(m => (
              <option key={m.id} value={m.id}>
                {m.preferred_name} · {m.mission?.short_name}
              </option>
            ))}
          </select>
        </div>

        {selected?.allergies && <AllergyAlert allergies={selected.allergies} />}

        <DateTimePicker name="consulted_at" label="Fecha y hora" required />
      </div>

      <div className="rounded-xl p-4" style={{ background: 'var(--bg-overlay)' }}>
        <VitalSignsFields />
      </div>

      <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <TextArea label="Motivo de consulta" name="chief_complaint" placeholder="Describa el motivo de consulta..." />
        <TextArea label="Notas clínicas" name="clinical_notes" placeholder="Examen físico, observaciones..." />
      </div>

      <div className="rounded-xl p-4 flex flex-col gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <TextArea label="Diagnóstico" name="diagnosis" placeholder="Ex: Lombalgia aguda" />
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>CIE-10 (opcional)</label>
          <input
            name="cid10"
            type="text"
            placeholder="Ej: M54.5"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          />
        </div>
        <TextArea label="Tratamiento / Medicación" name="treatment" placeholder="Ej: Ibuprofeno 400mg 8/8h por 5 días..." />
      </div>

      <div className="rounded-xl p-4 grid grid-cols-2 gap-4" style={{ background: 'var(--bg-overlay)' }}>
        <DatePicker name="follow_up_date" label="Fecha de seguimiento" />
        <div>
          <label className="text-xs uppercase tracking-wide mb-1 block" style={{ color: 'var(--text-muted)' }}>Estado</label>
          <select
            name="status"
            defaultValue="resolved"
            className="w-full rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500"
            style={{ background: 'var(--bg-base)', color: 'var(--text)', border: '1px solid var(--border)' }}
          >
            <option value="resolved">Resuelto</option>
            <option value="follow_up">Seguimiento</option>
            <option value="referral">Derivación</option>
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
        Guardar Consulta
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
