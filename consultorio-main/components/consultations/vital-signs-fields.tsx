export function VitalSignsFields() {
  const fields = [
    { name: 'vital_bp', label: 'Presión arterial', placeholder: '120/80', unit: 'mmHg' },
    { name: 'vital_temp', label: 'Temperatura', placeholder: '36.5', unit: '°C', step: '0.1' },
    { name: 'vital_hr', label: 'Frec. cardíaca', placeholder: '75', unit: 'bpm' },
    { name: 'vital_spo2', label: 'SpO2', placeholder: '98', unit: '%' },
    { name: 'vital_weight', label: 'Peso', placeholder: '70', unit: 'kg', step: '0.1' },
  ]
  return (
    <div>
      <div className="text-xs uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>
        Signos Vitales <span className="normal-case ml-1 opacity-50">(opcional)</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {fields.map(f => (
          <div key={f.name} className="rounded-lg p-3" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <label className="text-xs block mb-1" style={{ color: 'var(--text-muted)' }}>{f.label}</label>
            <div className="flex items-center gap-1.5">
              <input
                name={f.name}
                type={f.step ? 'number' : 'text'}
                step={f.step}
                placeholder={f.placeholder}
                className="w-full bg-transparent text-sm outline-none"
                style={{ color: 'var(--text)' }}
              />
              <span className="text-xs flex-shrink-0" style={{ color: 'var(--text-muted)' }}>{f.unit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
