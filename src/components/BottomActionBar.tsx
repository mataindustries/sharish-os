interface BottomActionBarProps {
  previousLabel: string
  primaryLabel: string
  secondaryLabel: string
}

export function BottomActionBar({
  previousLabel,
  primaryLabel,
  secondaryLabel,
}: BottomActionBarProps) {
  return (
    <div className="bottom-action-bar">
      <button type="button" className="action-btn action-btn--secondary">
        <span className="mono">{previousLabel}</span>
      </button>
      <button type="button" className="action-btn action-btn--primary">
        {primaryLabel}
      </button>
      <button type="button" className="action-btn action-btn--critical">
        <span className="mono">{secondaryLabel}</span>
      </button>
    </div>
  )
}
