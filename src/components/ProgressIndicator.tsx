export function ProgressIndicator({ value, total, label }: { value: number; total: number; label: string }) {
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={value}
      aria-valuetext={label}
    >
      <div className="progress__fill" style={{ transform: `scaleX(${value / total})` }} />
    </div>
  )
}
