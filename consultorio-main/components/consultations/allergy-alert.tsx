export function AllergyAlert({ allergies }: { allergies: string }) {
  return (
    <div className="flex items-start gap-3 rounded-xl p-4 border border-red-500/30 bg-red-500/10">
      <span className="text-xl flex-shrink-0">⚠️</span>
      <div>
        <div className="font-semibold text-red-400 text-sm">Alergia registrada</div>
        <div className="text-sm mt-0.5" style={{ color: 'var(--text)' }}>{allergies}</div>
      </div>
    </div>
  )
}
