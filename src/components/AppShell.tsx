import clsx from 'clsx'
import { useMemo, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import patients from '../data/patients.json'
import procedure from '../data/procedure.json'
import tray from '../data/tray.json'
import voice from '../data/voice.json'

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

  const currentMeta = routeMeta[location.pathname] ?? routeMeta['/procedure-mode']
  const readinessCount = tray.items.filter((item) => item.state === 'ready').length
  const criticalCount = tray.items.filter((item) => item.state === 'critical').length

  const patientLabel = useMemo(() => {
    const active = patients.activePatient
    return `${active.displayName} // ${active.chartId}`
  }, [])

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
              <div className="mono eyebrow">Operatory 04 // Clinical Ops</div>
              <h1 className="hud-title">{currentMeta.title}</h1>
            </div>
          </div>

          <div className="top-hud__status">
            <div className="hud-chip hud-chip--cyan mono">{currentMeta.status}</div>
            <div className="hud-chip mono">{patientLabel}</div>
            <div className="hud-chip hud-chip--cobalt mono">
              {procedure.caseContext.doctor} // {procedure.caseContext.procedureName}
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
                  <span className="status-block status-block--red">{criticalCount} critical</span>
                </div>
              </div>
              <div className="panel__body">
                <div className="readiness-meter" aria-hidden="true">
                  <div
                    className="readiness-meter__fill"
                    style={{ width: `${tray.readiness.readyPercent}%` }}
                  />
                </div>

                <div className="tray-list" role="list">
                  {tray.items.map((item) => (
                    <div className="tray-row" role="listitem" key={item.id}>
                      <span className={clsx('tray-dot', `tray-dot--${item.state}`)} />
                      <div className="tray-row__copy">
                        <strong>{item.name}</strong>
                        <span className="mono">{item.slot}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="command-preview">
                  <div className="mono panel__eyebrow">Voice Layer</div>
                  <p>{voice.overlay.prompt}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
