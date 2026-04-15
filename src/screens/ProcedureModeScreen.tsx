import { useEffect, useState } from 'react'
import { BottomActionBar } from '../components/BottomActionBar'
import { Panel } from '../components/Panel'
import patients from '../data/patients.json'
import procedure from '../data/procedure.json'
import { formatElapsedTime, parseElapsedTime } from '../lib/time'

export function ProcedureModeScreen() {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [elapsedSeconds, setElapsedSeconds] = useState(() =>
    parseElapsedTime(procedure.caseContext.elapsed),
  )
  const [exceptionRaised, setExceptionRaised] = useState(false)
  const [stepPulse, setStepPulse] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1)
    }, 1000)

    return () => window.clearInterval(timer)
  }, [])

  const currentStep = procedure.steps[currentStepIndex]
  const isFirstStep = currentStepIndex === 0
  const isLastStep = currentStepIndex === procedure.steps.length - 1

  function pulseCurrentStep() {
    setStepPulse(true)
    window.setTimeout(() => setStepPulse(false), 180)
  }

  function goToNextStep() {
    if (isLastStep) {
      pulseCurrentStep()
      return
    }

    setCurrentStepIndex((index) => index + 1)
    pulseCurrentStep()
  }

  function goToPreviousStep() {
    if (isFirstStep) {
      pulseCurrentStep()
      return
    }

    setCurrentStepIndex((index) => index - 1)
    pulseCurrentStep()
  }

  function toggleException() {
    setExceptionRaised((current) => !current)
  }

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
            <span className="hud-chip hud-chip--cobalt mono">{currentStep.phase}</span>
            <span className="hud-chip mono">Step {currentStepIndex + 1} / {procedure.steps.length}</span>
            <span className="hud-chip hud-chip--cyan mono">
              Elapsed {formatElapsedTime(elapsedSeconds)}
            </span>
          </div>
        </div>

        <div className={`hero-procedure__step ${stepPulse ? 'is-pulsed' : ''}`}>
          <div className="hero-procedure__step-header">
            <div>
              <div className="mono eyebrow">{currentStep.label}</div>
              <div className="hero-procedure__subhead">{procedure.caseContext.procedureName}</div>
            </div>
            <div className="hero-procedure__hud-grid">
              <div className="hero-procedure__hud-cell">
                <span className="mono">Room</span>
                <strong>{procedure.caseContext.room}</strong>
              </div>
              <div className="hero-procedure__hud-cell">
                <span className="mono">Doctor</span>
                <strong>{procedure.caseContext.doctor}</strong>
              </div>
              <div className="hero-procedure__hud-cell">
                <span className="mono">Assistant</span>
                <strong>{procedure.caseContext.assistant}</strong>
              </div>
              <div className="hero-procedure__hud-cell">
                <span className="mono">Tooth</span>
                <strong>{procedure.caseContext.tooth}</strong>
              </div>
            </div>
          </div>

          <div className="hero-procedure__title">{currentStep.title}</div>
          <p className="hero-procedure__detail">{currentStep.detail}</p>

          <div className="hero-procedure__signals">
            <div className="procedure-detail-block">
              <span className="mono">Assistant cue</span>
              <strong>{currentStep.operatorCue}</strong>
            </div>
            <div className="procedure-detail-block">
              <span className="mono">Ready to advance when</span>
              <strong>{currentStep.verification}</strong>
            </div>
          </div>
        </div>

        <div className="hero-procedure__handoff">
          <div className="signal-block signal-block--cobalt">
            <div className="mono signal-block__label">{currentStep.predictedHandoff.label}</div>
            <strong>{currentStep.predictedHandoff.instrument}</strong>
            <div className="ops-meta-list">
              <span>{currentStep.predictedHandoff.supportingItem}</span>
              <span>Owner: {currentStep.predictedHandoff.owner}</span>
              <span>Window: {currentStep.predictedHandoff.timing}</span>
              <span>Trigger: {currentStep.predictedHandoff.trigger}</span>
            </div>
          </div>

          <div className="signal-block signal-block--amber">
            <div className="mono signal-block__label">{procedure.doctorPreference.title}</div>
            <strong>{procedure.doctorPreference.priority}</strong>
            <div className="ops-meta-list">
              <span>{procedure.doctorPreference.detail}</span>
              <span>Trigger: {procedure.doctorPreference.trigger}</span>
            </div>
          </div>
        </div>
      </section>

      <div className="panel-grid">
        <Panel
          eyebrow="Procedure Timeline"
          title="Chairside Sequence"
          aside={<span className="status-block status-block--cyan">Live sequence</span>}
        >
          <div className="timeline-list">
            {procedure.steps.map((step, index) => {
              let state = 'queued'

              if (index < currentStepIndex) {
                state = 'complete'
              } else if (index === currentStepIndex) {
                state = 'active'
              }

              return (
                <div className={`timeline-row timeline-row--${state}`} key={step.id}>
                  <div className="timeline-row__copy">
                    <div>
                      <strong>{step.title}</strong>
                      <p>{step.verification}</p>
                    </div>
                    <span className="mono">{step.label}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel eyebrow="Clinical Flags" title="Readiness + Safety">
          <div className="badge-row">
            {procedure.safetyFlags.map((flag) => {
              const tone = flag.toLowerCase().includes('allergy') ? 'red' : 'amber'

              return (
                <span className={`status-block status-block--${tone}`} key={flag}>
                  {flag}
                </span>
              )
            })}
          </div>

          <div className="signal-stack">
            <div className={`signal-block ${exceptionRaised ? 'signal-block--red' : 'signal-block--cyan'}`}>
              <div className="mono signal-block__label">Tray Exception</div>
              <strong>{exceptionRaised ? 'Backup material issue has been flagged' : 'No active tray stops'}</strong>
              <p>
                {exceptionRaised
                  ? 'Capture backup has to be restaged before the room can safely lose scan as the primary path.'
                  : 'Field is clear to proceed. Keep the backup capture lane visible as the prep advances.'}
              </p>
            </div>

            <div className="signal-block">
              <div className="mono signal-block__label">Doctor Habit Reminder</div>
              <strong>Preference is still live in the room</strong>
              <p>{patients.activePatient.doctorPreference}</p>
            </div>
          </div>
        </Panel>
      </div>

      <BottomActionBar
        previousLabel="Review Prior"
        previousMeta={isFirstStep ? 'Start of sequence' : procedure.steps[currentStepIndex - 1].title}
        primaryLabel={isLastStep ? 'Final Step Live' : 'Next Step'}
        primaryMeta={isLastStep ? 'Capture sequence is up' : procedure.steps[currentStepIndex + 1].title}
        secondaryLabel={exceptionRaised ? 'Clear Exception' : 'Mark Missing Item'}
        secondaryMeta={exceptionRaised ? 'Tray alert remains logged' : 'Log a tray stop'}
        onPrevious={goToPreviousStep}
        onPrimary={goToNextStep}
        onSecondary={toggleException}
        previousDisabled={isFirstStep}
      />
    </div>
  )
}
