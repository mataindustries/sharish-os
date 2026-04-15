import clsx from 'clsx'
import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import patients from '../data/patients.json'
import procedure from '../data/procedure.json'
import tray from '../data/tray.json'
import voice from '../data/voice.json'
import { formatElapsedTime, parseElapsedTime } from '../lib/time'

const navigation = [
  { to: '/procedure-mode', label: 'Procedure', shortLabel: 'PROC' },
  { to: '/tray-setup', label: 'Tray Setup', shortLabel: 'TRAY' },
  { to: '/voice-overlay', label: 'Voice Layer', shortLabel: 'VOICE' },
  { to: '/new-patient', label: 'New Patient', shortLabel: 'INTAKE' },
]

const routeMeta: Record<string, { title: string; status: string }> = {
  '/procedure-mode': { title: 'Procedure Mode', status: 'Live Assist' },
  '/tray-setup': { title: 'Tray Setup', status: 'Ready Check' },
  '/voice-overlay': { title: 'Voice Overlay', status: 'Command Layer' },
  '/new-patient': { title: 'New Patient Flow', status: 'Intake Active' },
}

export function AppShell() {
  const location = useLocation()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    parseElapsedTime(procedure.caseContext.elapsed),
  )

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const currentMeta = routeMeta[location.pathname] ?? routeMeta['/procedure-mode']
  const readinessCount = tray.items.filter((item) => item.state === 'ready').length
  const warningCount = tray.items.filter((item) => item.state === 'warning').length
  const missingCount = tray.items.filter((item) => item.state === 'missing').length
  const readinessPercent = Math.round((readinessCount / tray.items.length) * 100)
  const patientLabel = `${patients.activePatient.displayName} // ${patients.activePatient.chartId}`

  return (
    <div className="app-shell">
      <aside className="rail">
        <div className="brand-mark" aria-hidden="true" />
        <div className="rail-heading mono">Sharish OS</div>
        <nav className="rail-nav" aria-label="Primary">
          {navigation.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => clsx('rail-link', isActive && 'is-active')}
            >
              <span className="mono rail-link-code">{item.shortLabel}</span>
              <span className="rail-link-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="main-frame">
        <header className="top-hud">
          <div className="top-hud__group">
            <button
              type="button"
              className="drawer-toggle mono"
              onClick={() => setDrawerOpen((open) => !open)}
            >
              Tray State
            </button>
            <div>
              <div className="mono eyebrow">
                {procedure.caseContext.room} // Clinical Ops // {procedure.caseContext.phase}
              </div>
              <h1 className="hud-title">{currentMeta.title}</h1>
            </div>
          </div>

          <div className="top-hud__status">
            <div className="hud-chip hud-chip--cyan mono">{currentMeta.status}</div>
            <div className="hud-chip mono">{patientLabel}</div>
            <div className="hud-chip mono">Room {procedure.caseContext.room}</div>
            <div className="hud-chip mono">{procedure.caseContext.doctor}</div>
            <div className="hud-chip hud-chip--cobalt mono">{procedure.caseContext.procedureName}</div>
            <div className="hud-chip mono">Tooth {procedure.caseContext.tooth}</div>
            <div className="hud-chip hud-chip--cyan mono">
              Elapsed {formatElapsedTime(elapsedSeconds)}
            </div>
          </div>
        </header>

        <div className="workspace-shell">
          <main className="screen-stage">
            <Outlet />
          </main>

          <aside className={clsx('support-drawer', drawerOpen && 'is-open')}>
            <div className="panel">
              <div className="panel__header">
                <div>
                  <div className="mono panel__eyebrow">Tray Readiness</div>
                  <h2 className="panel__title">Sterile Field Status</h2>
                </div>
                <div className="status-stack">
                  <span className="status-block status-block--cyan">{readinessCount} ready</span>
                  <span className="status-block status-block--amber">{warningCount} warning</span>
                  <span className="status-block status-block--red">{missingCount} missing</span>
                </div>
              </div>
              <div className="panel__body">
                <div className="drawer-summary">
                  <strong>{readinessPercent}% staged</strong>
                  <span className="mono">
                    {tray.readiness.zonesChecked}/{tray.readiness.zonesTotal} sterile zones checked
                  </span>
                </div>

                <div className="readiness-meter" aria-hidden="true">
                  <div className="readiness-meter__fill" style={{ width: `${readinessPercent}%` }} />
                </div>

                <div className="tray-list" role="list">
                  {tray.items.map((item) => (
                    <div
                      className={clsx('tray-row', `tray-row--${item.state}`)}
                      role="listitem"
                      key={item.id}
                    >
                      <span className={clsx('tray-dot', `tray-dot--${item.state}`)} />
                      <div className="tray-row__copy">
                        <div className="tray-row__text">
                          <strong>{item.name}</strong>
                          <span>{item.detail}</span>
                        </div>
                        <div className="tray-row__meta">
                          <span className="mono">{item.slot}</span>
                          <span className={`tray-state tray-state--${item.state}`}>{item.state}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="signal-block signal-block--amber support-note">
                  <div className="mono signal-block__label">{tray.doctorNote.title}</div>
                  <strong>{procedure.caseContext.doctor}</strong>
                  <p>{tray.doctorNote.detail}</p>
                </div>

                <div className="command-preview">
                  <div className="mono panel__eyebrow">Voice Layer</div>
                  <p>
                    Wake word {voice.overlay.wakeWord}. {voice.overlay.instruction}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
