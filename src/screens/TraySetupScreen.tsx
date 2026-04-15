import { useState } from 'react'
import { BottomActionBar } from '../components/BottomActionBar'
import { Panel } from '../components/Panel'
import procedure from '../data/procedure.json'
import tray from '../data/tray.json'

type TrayItemState = 'ready' | 'warning' | 'missing'

type TrayItem = {
  id: string
  name: string
  slot: string
  zone: string
  detail: string
  state: TrayItemState
  note: string
}

export function TraySetupScreen() {
  const [items, setItems] = useState<TrayItem[]>(() =>
    tray.items.map((item) => ({ ...item, state: item.state as TrayItemState })),
  )
  const [selectedItemId, setSelectedItemId] = useState(tray.items[0]?.id ?? '')
  const [confirmed, setConfirmed] = useState(false)

  const selectedItem = items.find((item) => item.id === selectedItemId) ?? items[0]
  const readyCount = items.filter((item) => item.state === 'ready').length
  const warningCount = items.filter((item) => item.state === 'warning').length
  const missingCount = items.filter((item) => item.state === 'missing').length
  const readinessPercent = Math.round((readyCount / items.length) * 100)
  const releaseBlocked = missingCount > 0
  const needsReview = !releaseBlocked && warningCount > 0
  const gateStatus = releaseBlocked ? 'blocked' : needsReview ? 'review' : 'ready'

  const checklist = tray.setupChecklist.map((entry) => {
    if (entry.id === 'zoning') {
      return { ...entry, state: readyCount >= 4 ? 'complete' : 'active' }
    }

    if (entry.id === 'preferences') {
      const articulatingReady = items.some((item) => item.id === 'articulating' && item.state === 'ready')
      return { ...entry, state: articulatingReady ? 'complete' : 'active' }
    }

    if (entry.id === 'fallback') {
      if (missingCount > 0) {
        return { ...entry, state: 'blocked' }
      }

      return { ...entry, state: warningCount > 0 ? 'active' : 'complete' }
    }

    return entry
  })

  const selectedAction = selectedItem
    ? selectedItem.state === 'ready'
      ? {
          label: 'Flag Watch',
          meta: 'Needs review before room release',
          tone: 'warning' as const,
          nextState: 'warning' as TrayItemState,
        }
      : selectedItem.state === 'warning'
        ? {
            label: 'Escalate Missing',
            meta: 'Convert this watch item into a room hold',
            tone: 'critical' as const,
            nextState: 'missing' as TrayItemState,
          }
        : {
            label: 'Restore Ready',
            meta: 'Return this lane to seat-ready status',
            tone: 'success' as const,
            nextState: 'ready' as TrayItemState,
          }
    : null

  function updateItemState(itemId: string, nextState: TrayItemState) {
    setConfirmed(false)
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, state: nextState } : item)),
    )
  }

  function resetTray() {
    setConfirmed(false)
    setItems(tray.items.map((item) => ({ ...item, state: item.state as TrayItemState })))
    setSelectedItemId(tray.items[0]?.id ?? '')
  }

  function runSelectedAction() {
    if (!selectedItem || !selectedAction) {
      return
    }

    updateItemState(selectedItem.id, selectedAction.nextState)
  }

  function confirmSetup() {
    setConfirmed(!releaseBlocked)
  }

  return (
    <div className="screen-stack">
      <Panel
        eyebrow="Tray Setup"
        title="Crown Prep Staging"
        aside={
          <div className="status-stack">
            <span className="status-block status-block--cyan">{readyCount} ready</span>
            <span className="status-block status-block--amber">{warningCount} warning</span>
            <span className="status-block status-block--red">{missingCount} missing</span>
          </div>
        }
      >
        <div className="blueprint-grid">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`blueprint-cell blueprint-cell--${item.state} ${selectedItem?.id === item.id ? 'is-selected' : ''}`}
              onClick={() => setSelectedItemId(item.id)}
            >
              <div className="blueprint-cell__header">
                <span className="mono">{item.slot}</span>
                <span className={`tray-state tray-state--${item.state}`}>{item.state}</span>
              </div>
              <div className="blueprint-cell__body">
                <strong>{item.name}</strong>
                <span>{item.zone}</span>
                <p>{item.detail}</p>
              </div>
              <div className="blueprint-cell__footer">
                <span className="blueprint-cell__prompt">Select item</span>
                {selectedItem?.id === item.id ? <span className="tray-action-hint">Selected</span> : null}
              </div>
            </button>
          ))}
        </div>

        <div className="tray-ops-strip">
          <div className="signal-block signal-block--amber">
            <div className="mono signal-block__label">{tray.doctorNote.title}</div>
            <strong>{procedure.caseContext.doctor}</strong>
            <p>{tray.doctorNote.detail}</p>
          </div>

          <div
            className={`signal-block ${
              selectedItem?.state === 'missing'
                ? 'signal-block--red'
                : selectedItem?.state === 'warning'
                  ? 'signal-block--amber'
                  : 'signal-block--cobalt'
            }`}
          >
            <div className="mono signal-block__label">Selected Tray Item</div>
            <strong>{selectedItem?.name}</strong>
            <div className="ops-meta-list">
              <span>Slot: {selectedItem?.slot}</span>
              <span>Status: {selectedItem?.state}</span>
              <span>{selectedItem?.detail}</span>
              <span>Note: {selectedItem?.note}</span>
              {selectedAction ? <span>Next action: {selectedAction.label}</span> : null}
            </div>
          </div>
        </div>
      </Panel>

      <div className="panel-grid">
        <Panel eyebrow="Readiness Sequence" title="Seat-Ready Checklist">
          <div className="checklist-stack">
            {checklist.map((item) => (
              <div className={`checklist-row checklist-row--${item.state}`} key={item.id}>
                <div className="checklist-row__state mono">{item.state}</div>
                <div className="checklist-row__copy">
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
                <span className="role-pill">{item.owner}</span>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          eyebrow="Setup Confirmation"
          title="Release Gate"
          aside={
            <span
              className={`status-block ${
                confirmed
                  ? 'status-block--cyan'
                  : gateStatus === 'blocked'
                    ? 'status-block--red'
                    : gateStatus === 'review'
                      ? 'status-block--amber'
                      : 'status-block--cobalt'
              }`}
            >
              {confirmed
                ? 'Released'
                : gateStatus === 'blocked'
                  ? 'Hold'
                  : gateStatus === 'review'
                    ? 'Review'
                    : 'Ready'}
            </span>
          }
        >
          <div className="release-gate">
            <div className="release-gate__header">
              <strong>
                {releaseBlocked
                  ? 'Tray hold is live'
                  : needsReview
                    ? 'Tray can move with active review'
                    : confirmed
                      ? 'Tray released to room'
                      : 'Tray is clear for release'}
              </strong>
              <span
                className={`tray-state tray-state--${
                  gateStatus === 'ready' ? 'ready' : gateStatus === 'review' ? 'warning' : 'missing'
                }`}
              >
                {gateStatus}
              </span>
            </div>

            <div className="readiness-meter" aria-hidden="true">
              <div className="readiness-meter__fill" style={{ width: `${readinessPercent}%` }} />
            </div>

            <div className="signal-stack">
              <div className={`signal-block ${missingCount > 0 ? 'signal-block--red' : 'signal-block--cyan'}`}>
                <div className="mono signal-block__label">{tray.confirmation.title}</div>
                <strong>
                  {confirmed
                    ? 'Tray released to room'
                    : releaseBlocked
                      ? 'Resolve missing tray lane before seat'
                      : `${readinessPercent}% staged`}
                </strong>
                <p>
                  {missingCount > 0
                    ? `${missingCount} missing item keeps this room on hold. Restage it or clear the fallback plan with the doctor before seat.`
                    : needsReview
                      ? `${warningCount} tray item still needs review. The room can move, but the watch item should stay visible until the doctor sits.`
                      : tray.confirmation.detail}
                </p>
              </div>

              <div className="readiness-summary-grid">
                <div className="summary-metric">
                  <span className="mono">Sterile zones</span>
                  <strong>
                    {tray.readiness.zonesChecked}/{tray.readiness.zonesTotal}
                  </strong>
                </div>
                <div className="summary-metric">
                  <span className="mono">Ready items</span>
                  <strong>{readyCount}</strong>
                </div>
                <div className="summary-metric">
                  <span className="mono">Warnings</span>
                  <strong>{warningCount}</strong>
                </div>
              </div>

              <div className={`release-gate__line release-gate__line--${releaseBlocked ? 'blocked' : 'ready'}`}>
                <strong>Fallback capture lane</strong>
                <span>
                  {releaseBlocked
                    ? 'Backup material is still missing and keeps the room on a hard hold.'
                    : 'Backup material is staged or explicitly cleared for this room.'}
                </span>
              </div>

              <div className={`release-gate__line release-gate__line--${needsReview ? 'review' : 'ready'}`}>
                <strong>Preference and tissue lanes</strong>
                <span>
                  {needsReview
                    ? 'A watch item is still open. Keep the selected lane visible as the room turns.'
                    : 'Doctor preference items and tissue lane are staged cleanly.'}
                </span>
              </div>
            </div>
          </div>
        </Panel>
      </div>

      <BottomActionBar
        previousLabel="Reset Tray"
        previousMeta="Restore default staging"
        primaryLabel={confirmed ? 'Tray Released' : 'Release Tray'}
        primaryMeta={
          releaseBlocked
            ? `${missingCount} item still blocks release`
            : needsReview
              ? `${warningCount} watch item stays visible`
              : 'Seat-ready gate clear'
        }
        secondaryLabel={selectedAction?.label ?? 'Inspect Tray'}
        secondaryMeta={selectedItem ? `${selectedItem.slot} // ${selectedAction?.meta ?? selectedItem.name}` : 'Select tray item'}
        onPrevious={resetTray}
        onPrimary={confirmSetup}
        onSecondary={runSelectedAction}
        primaryTone={confirmed ? 'success' : 'primary'}
        secondaryTone={selectedAction?.tone ?? 'secondary'}
        primaryDisabled={releaseBlocked}
        secondaryDisabled={!selectedAction}
      />
    </div>
  )
}
