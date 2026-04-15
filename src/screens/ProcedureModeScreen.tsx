import patients from '../data/patients.json'
import procedure from '../data/procedure.json'
import { BottomActionBar } from '../components/BottomActionBar'
import { Panel } from '../components/Panel'

export function ProcedureModeScreen() {
  return (
    <div className="screen-stack">
      <section className="hero-procedure">
        <div className="hero-procedure__context">
          <div>
            <div className="mono eyebrow">Current Patient</div>
            <div className="hero-procedure__patient">
              {patients.activePatient.fullName} // {patients.activePatient.chartId}
            </div>
          </div>
          <div className="hero-procedure__meta">
            <span className="hud-chip hud-chip--cobalt mono">{procedure.caseContext.phase}</span>
            <span className="hud-chip mono">{procedure.caseContext.elapsed}</span>
          </div>
        </div>

        <div className="hero-procedure__step">
          <div className="mono eyebrow">{procedure.currentStep.label}</div>
          <div className="hero-procedure__title">{procedure.currentStep.title}</div>
          <p className="hero-procedure__detail">{procedure.currentStep.detail}</p>
        </div>

        <div className="hero-procedure__handoff">
          <div className="signal-block signal-block--cobalt">
            <div className="mono signal-block__label">{procedure.nextHandoff.label}</div>
            <strong>{procedure.nextHandoff.instrument}</strong>
            <p>{procedure.nextHandoff.supportingItem}</p>
          </div>
          <div className="signal-block signal-block--amber">
            <div className="mono signal-block__label">{procedure.doctorPreference.title}</div>
            <strong>Doctor preference injected</strong>
            <p>{patients.activePatient.doctorPreference}</p>
          </div>
        </div>
      </section>

      <div className="panel-grid">
        <Panel
          eyebrow="Procedure Timeline"
          title="Phase Tracking"
          aside={<span className="status-block status-block--cyan">Live</span>}
        >
          <div className="timeline-list">
            {procedure.timeline.map((item) => (
              <div className={`timeline-row timeline-row--${item.state}`} key={item.id}>
                <div>
                  <strong>{item.label}</strong>
                  <span className="mono">{item.time}</span>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Clinical Flags" title="Readiness + Safety">
          <div className="badge-row">
            {patients.activePatient.medicalFlags.map((flag) => (
              <span className="status-block status-block--amber" key={flag}>
                {flag}
              </span>
            ))}
            {patients.activePatient.allergies.map((allergy) => (
              <span className="status-block status-block--red" key={allergy}>
                Allergy: {allergy}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      <BottomActionBar
        previousLabel="Review Prior"
        primaryLabel="Next Step"
        secondaryLabel="Mark Missing Item"
      />
    </div>
  )
}
