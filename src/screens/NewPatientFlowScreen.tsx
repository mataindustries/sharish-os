import { useEffect, useState } from 'react'
import { BottomActionBar } from '../components/BottomActionBar'
import { Panel } from '../components/Panel'
import patients from '../data/patients.json'

type FlowTaskState = 'complete' | 'active' | 'queued' | 'blocked' | 'missing'

type FlowTask = {
  id: string
  label: string
  detail: string
  role: string
  state: FlowTaskState
}

const roleOrder = ['Front Desk', 'Assistant', 'Doctor']
const flow = patients.newPatientFlow

function cloneTemplateTasks(templateId: string): FlowTask[] {
  const template = flow.templates.find((entry) => entry.id === templateId) ?? flow.templates[0]
  return template.tasks.map((task) => ({
    ...task,
    state: task.state as FlowTaskState,
  }))
}

function normalizeTasks(tasks: FlowTask[]): FlowTask[] {
  const hasFrontlineStop = tasks.some(
    (task) => task.role !== 'Doctor' && (task.state === 'missing' || task.state === 'blocked'),
  )

  return tasks.map((task) => {
    if (task.role !== 'Doctor' || task.state === 'complete' || task.state === 'missing') {
      return task
    }

    return {
      ...task,
      state: hasFrontlineStop ? 'blocked' : task.state === 'active' ? 'active' : 'queued',
    }
  })
}

export function NewPatientFlowScreen() {
  const [selectedTemplateId, setSelectedTemplateId] = useState(flow.activeTemplateId)
  const [tasks, setTasks] = useState<FlowTask[]>(() => cloneTemplateTasks(flow.activeTemplateId))
  const [selectedTaskId, setSelectedTaskId] = useState(tasks[0]?.id ?? '')

  useEffect(() => {
    const nextTasks = cloneTemplateTasks(selectedTemplateId)
    setTasks(normalizeTasks(nextTasks))
    setSelectedTaskId(nextTasks[0]?.id ?? '')
  }, [selectedTemplateId])

  const selectedTemplate =
    flow.templates.find((template) => template.id === selectedTemplateId) ?? flow.templates[0]
  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0]
  const completeCount = tasks.filter((task) => task.state === 'complete').length
  const blockedCount = tasks.filter((task) => task.state === 'blocked').length
  const missingCount = tasks.filter((task) => task.state === 'missing').length

  function resetBoard() {
    const nextTasks = cloneTemplateTasks(selectedTemplateId)
    setTasks(normalizeTasks(nextTasks))
    setSelectedTaskId(nextTasks[0]?.id ?? '')
  }

  function advanceProtocol() {
    setTasks((currentTasks) => {
      const nextTasks = currentTasks.map((task) => ({ ...task }))
      const activeIndex = nextTasks.findIndex((task) => task.state === 'active')

      if (activeIndex >= 0) {
        nextTasks[activeIndex].state = 'complete'

        const nextQueuedIndex = nextTasks.findIndex((task) => task.state === 'queued')

        if (nextQueuedIndex >= 0) {
          nextTasks[nextQueuedIndex].state = 'active'
        }

        return normalizeTasks(nextTasks)
      }

      const firstQueuedIndex = nextTasks.findIndex((task) => task.state === 'queued')

      if (firstQueuedIndex >= 0) {
        nextTasks[firstQueuedIndex].state = 'active'
      }

      return normalizeTasks(nextTasks)
    })
  }

  function toggleSelectedMissing() {
    if (!selectedTask) {
      return
    }

    setTasks((currentTasks) =>
      normalizeTasks(
        currentTasks.map((task) => {
          if (task.id !== selectedTask.id) {
            return task
          }

          if (task.state === 'missing') {
            return { ...task, state: 'queued' }
          }

          return { ...task, state: 'missing' }
        }),
      ),
    )
  }

  return (
    <div className="screen-stack">
      <Panel
        eyebrow="New Patient Flow"
        title="Intake Protocol Board"
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
            <span className="mono">Doctor Preference</span>
            <strong>{patients.activePatient.doctorPreference}</strong>
          </div>
        </div>

        <div className="template-selector">
          {flow.templates.map((template) => (
            <button
              key={template.id}
              type="button"
              className={`template-card ${selectedTemplateId === template.id ? 'is-active' : ''}`}
              onClick={() => setSelectedTemplateId(template.id)}
            >
              <div className="template-card__header">
                <strong>{template.name}</strong>
                <div className="badge-row">
                  {template.tags.map((tag) => (
                    <span className="role-pill" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <p>{template.summary}</p>
            </button>
          ))}
        </div>
      </Panel>

      <div className="panel-grid panel-grid--wide">
        <Panel
          eyebrow="Execution Board"
          title={selectedTemplate.name}
          aside={
            <div className="status-stack">
              <span className="status-block status-block--cyan">{completeCount} complete</span>
              <span className="status-block status-block--amber">{blockedCount} blocked</span>
              <span className="status-block status-block--red">{missingCount} missing</span>
            </div>
          }
        >
          <div className="execution-board">
            {roleOrder.map((role) => (
              <div className="execution-lane" key={role}>
                <div className="execution-lane__header">
                  <span className="mono">Role lane</span>
                  <h3>{role}</h3>
                </div>
                <div className="execution-lane__stack">
                  {tasks
                    .filter((task) => task.role === role)
                    .map((task) => (
                      <button
                        key={task.id}
                        type="button"
                        className={`execution-card execution-card--${task.state} ${selectedTask?.id === task.id ? 'is-selected' : ''}`}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        <div className="execution-card__header">
                          <span className={`role-pill role-pill--${task.role.toLowerCase().replace(/\s+/g, '-')}`}>
                            {task.role}
                          </span>
                          <span className={`tray-state tray-state--${task.state}`}>{task.state}</span>
                        </div>
                        <strong>{task.label}</strong>
                        <p>{task.detail}</p>
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Routing" title="Selected Task">
          <div className="signal-stack">
            <div
              className={`signal-block ${
                selectedTask?.state === 'missing'
                  ? 'signal-block--red'
                  : selectedTask?.state === 'blocked'
                    ? 'signal-block--amber'
                    : 'signal-block--cobalt'
              }`}
            >
              <div className="mono signal-block__label">Current selection</div>
              <strong>{selectedTask?.label}</strong>
              <div className="ops-meta-list">
                <span>Owner: {selectedTask?.role}</span>
                <span>Status: {selectedTask?.state}</span>
                <span>{selectedTask?.detail}</span>
              </div>
            </div>

            <div className="signal-block">
              <div className="mono signal-block__label">Board protocol</div>
              <strong>Doctor lane does not open early</strong>
              <p>
                Front-desk and assistant blockers stay visible here so the room only turns once the
                intake packet is genuinely ready.
              </p>
            </div>
          </div>
        </Panel>
      </div>

      <BottomActionBar
        previousLabel="Reset Board"
        previousMeta="Restore template defaults"
        primaryLabel="Advance Board"
        primaryMeta={selectedTask ? `${selectedTask.role} // ${selectedTask.label}` : 'No task selected'}
        secondaryLabel={selectedTask?.state === 'missing' ? 'Clear Missing' : 'Mark Missing'}
        secondaryMeta={selectedTask?.state === 'blocked' ? 'Blocked handoff remains visible' : 'Open intake blocker'}
        onPrevious={resetBoard}
        onPrimary={advanceProtocol}
        onSecondary={toggleSelectedMissing}
      />
    </div>
  )
}
