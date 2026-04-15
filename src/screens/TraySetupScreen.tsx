import tray from '../data/tray.json'
import { Panel } from '../components/Panel'

export function TraySetupScreen() {
  return (
    <div className="screen-stack">
      <Panel
        eyebrow="Tray Setup"
        title="Procedure Staging Blueprint"
        aside={
          <div className="status-stack">
            <span className="status-block status-block--cyan">
              {tray.readiness.zonesChecked}/{tray.readiness.zonesTotal} zones
            </span>
            <span className="status-block status-block--amber">Cord reserve low</span>
          </div>
        }
      >
        <div className="blueprint-grid">
          {tray.items.map((item) => (
            <div className={`blueprint-cell blueprint-cell--${item.state}`} key={item.id}>
              <div className="mono">{item.slot}</div>
              <strong>{item.name}</strong>
            </div>
          ))}
        </div>
      </Panel>

      <div className="panel-grid">
        <Panel eyebrow="Readiness Sequence" title="Setup Checklist">
          <div className="checklist-stack">
            {tray.setupChecklist.map((item) => (
              <div className={`checklist-row checklist-row--${item.state}`} key={item.id}>
                <div className="checklist-row__state mono">{item.state}</div>
                <div>
                  <strong>{item.title}</strong>
                  <p>{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Exception Routing" title="Missing Material Escalation">
          <div className="signal-block signal-block--red">
            <div className="mono signal-block__label">Critical gap</div>
            <strong>Impression material not staged</strong>
            <p>Keep assistant lane visible and flag before margin refinement begins.</p>
          </div>
        </Panel>
      </div>
    </div>
  )
}
