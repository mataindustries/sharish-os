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

const trayStateCycle: TrayItemState[] = ['ready', 'warning', 'missing']

function getNextTrayState(state: TrayItemState): TrayItemState {
  const currentIndex = trayStateCycle.indexOf(state)
  return trayStateCycle[(currentIndex + 1) % trayStateCycle.length]
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

  function updateItemState(itemId: string, nextState: TrayItemState) {
    setConfirmed(false)
    setItems((currentItems) =>
      currentItems.map((item) => (item.id === itemId ? { ...item, state: nextState } : item)),
    )
  }

  function cycleItemState(itemId: string) {
    const item = items.find((entry) => entry.id === itemId)

    if (!item) {
      return
    }

    updateItemState(itemId, getNextTrayState(item.state))
  }

  function resetTray() {
    setConfirmed(false)
    setItems(tray.items.map((item) => ({ ...item, state: item.state as TrayItemState })))
    setSelectedItemId(tray.items[0]?.id ?? '')
  }

  function toggleSelectedMissing() {
    if (!selectedItem) {
      return
    }

    updateItemState(selectedItem.id, selectedItem.state === 'missing' ? 'ready' : 'missing')
  }

  function confirmSetup() {
    setConfirmed(missingCount === 0)
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
              onClick={() => {
                setSelectedItemId(item.id)
                cycleItemState(item.id)
              }}
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
            </button>
          ))}
        </div>

        <div className="tray-ops-strip">
          <div className="signal-block signal-block--amber">
            <div className="mono signal-block__label">{tray.doctorNote.title}</div>
            <strong>{procedure.caseContext.doctor}</strong>
            <p>{tray.doctorNote.detail}</p>
          </div>

            <div className={`signal-block ${selectedItem?.state === 'missing' ? 'signal-block--red' : 'signal-block--cobalt'}`}>
              <div className="mono signal-block__label">Selected Tray Item</div>
              <strong>{selectedItem?.name}</strong>
            <div className="ops-meta-list">
              <span>Slot: {selectedItem?.slot}</span>
              <span>Status: {selectedItem?.state}</span>
              <span>{selectedItem?.detail}</span>
              <span>Note: {selectedItem?.note}</span>
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
            <span className={`status-block ${confirmed ? 'status-block--cyan' : 'status-block--amber'}`}>
              {confirmed ? 'Released' : 'Hold'}
            </span>
          }
        >
          <div className="signal-stack">
            <div className={`signal-block ${missingCount > 0 ? 'signal-block--red' : 'signal-block--cyan'}`}>
              <div className="mono signal-block__label">{tray.confirmation.title}</div>
              <strong>{confirmed ? 'Tray released to room' : `${readinessPercent}% staged`}</strong>
              <p>
                {missingCount > 0
                  ? `${missingCount} missing item keeps this room on hold. Restage it or clear the fallback plan with the doctor before seat.`
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
          </div>
        </Panel>
      </div>

      <BottomActionBar
        previousLabel="Reset Tray"
        previousMeta="Restore default staging"
        primaryLabel={confirmed ? 'Tray Released' : 'Release Tray'}
        primaryMeta={missingCount > 0 ? `${missingCount} item still blocks release` : 'Seat-ready gate'}
        secondaryLabel={selectedItem?.state === 'missing' ? 'Clear Missing' : 'Mark Missing'}
        secondaryMeta={selectedItem ? `${selectedItem.slot} // ${selectedItem.name}` : 'Select tray item'}
        onPrevious={resetTray}
        onPrimary={confirmSetup}
        onSecondary={toggleSelectedMissing}
        primaryTone={confirmed ? 'success' : 'primary'}
      />
    </div>
  )
}
