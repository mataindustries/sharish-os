interface BottomActionBarProps {
  previousLabel: string
  primaryLabel: string
  secondaryLabel: string
  previousMeta?: string
  primaryMeta?: string
  secondaryMeta?: string
  onPrevious?: () => void
  onPrimary?: () => void
  onSecondary?: () => void
  previousDisabled?: boolean
  primaryDisabled?: boolean
  secondaryDisabled?: boolean
  primaryTone?: 'primary' | 'success'
  secondaryTone?: 'secondary' | 'warning' | 'critical' | 'success'
}

export function BottomActionBar({
  previousLabel,
  primaryLabel,
  secondaryLabel,
  previousMeta,
  primaryMeta,
  secondaryMeta,
  onPrevious,
  onPrimary,
  onSecondary,
  previousDisabled = false,
  primaryDisabled = false,
  secondaryDisabled = false,
  primaryTone = 'primary',
  secondaryTone = 'critical',
}: BottomActionBarProps) {
  return (
    <div className="bottom-action-bar">
      <button
        type="button"
        className="action-btn action-btn--secondary"
        onClick={onPrevious}
        disabled={previousDisabled}
      >
        <span className="action-btn__label-wrap">
          <span className="mono action-btn__label">{previousLabel}</span>
          {previousMeta ? <span className="action-btn__meta">{previousMeta}</span> : null}
        </span>
      </button>
      <button
        type="button"
        className={`action-btn ${primaryTone === 'success' ? 'action-btn--success' : 'action-btn--primary'}`}
        onClick={onPrimary}
        disabled={primaryDisabled}
      >
        <span className="action-btn__label-wrap">
          <span className="action-btn__headline">{primaryLabel}</span>
          {primaryMeta ? <span className="action-btn__meta">{primaryMeta}</span> : null}
        </span>
      </button>
      <button
        type="button"
        className={`action-btn action-btn--${secondaryTone}`}
        onClick={onSecondary}
        disabled={secondaryDisabled}
      >
        <span className="action-btn__label-wrap">
          <span className="mono action-btn__label">{secondaryLabel}</span>
          {secondaryMeta ? <span className="action-btn__meta">{secondaryMeta}</span> : null}
        </span>
      </button>
    </div>
  )
}
