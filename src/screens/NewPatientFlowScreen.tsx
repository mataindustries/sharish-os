import patients from '../data/patients.json'
import { Panel } from '../components/Panel'

export function NewPatientFlowScreen() {
  const flow = patients.newPatientFlow

  return (
    <div className="screen-stack">
      <Panel
        eyebrow="New Patient Flow"
        title="Clinical Intake Pipeline"
        aside={<span className="status-block status-block--cobalt">{flow.arrivalWindow} arrival</span>}
      >
        <div className="intake-summary">
          <div className="summary-metric">
            <span className="mono">Referral Source</span>
            <strong>{flow.source}</strong>
          </div>
          <div className="summary-metric">
            <span className="mono">Visit Reason</span>
            <strong>{flow.reason}</strong>
          </div>
          <div className="summary-metric">
            <span className="mono">Preference Carry-Forward</span>
            <strong>{patients.activePatient.doctorPreference}</strong>
          </div>
        </div>
      </Panel>

      <div className="panel-grid">
        <Panel eyebrow="Intake Steps" title="Rooming Sequence">
          <div className="checklist-stack">
            {flow.steps.map((step) => (
              <div className={`checklist-row checklist-row--${step.state}`} key={step.id}>
                <div className="checklist-row__state mono">{step.state}</div>
                <div>
                  <strong>{step.label}</strong>
                  <p>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Patient Flags" title="Chart Injection">
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
    </div>
  )
}
