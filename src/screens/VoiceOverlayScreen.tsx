import { useEffect, useRef, useState } from 'react'
import { Panel } from '../components/Panel'
import patients from '../data/patients.json'
import procedure from '../data/procedure.json'
import tray from '../data/tray.json'
import voice from '../data/voice.json'

type OverlayState = 'listening' | 'thinking' | 'response'

export function VoiceOverlayScreen() {
  const [overlayState, setOverlayState] = useState<OverlayState>('listening')
  const [activeCommandId, setActiveCommandId] = useState(voice.commands[0]?.id ?? '')
  const [detectedPhrase, setDetectedPhrase] = useState(`${voice.overlay.wakeWord}, ${voice.commands[0]?.phrase}`)
  const [responseText, setResponseText] = useState(voice.commands[0]?.response ?? '')
  const responseTimerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (responseTimerRef.current) {
        window.clearTimeout(responseTimerRef.current)
      }
    }
  }, [])

  const activeCommand = voice.commands.find((command) => command.id === activeCommandId) ?? voice.commands[0]
  const readyCount = tray.items.filter((item) => item.state === 'ready').length
  const missingCount = tray.items.filter((item) => item.state === 'missing').length

  function armListening() {
    if (responseTimerRef.current) {
      window.clearTimeout(responseTimerRef.current)
    }

    setOverlayState('listening')
    setResponseText(activeCommand?.response ?? '')
  }

  function runCommand(commandId: string) {
    const command = voice.commands.find((entry) => entry.id === commandId)

    if (!command) {
      return
    }

    if (responseTimerRef.current) {
      window.clearTimeout(responseTimerRef.current)
    }

    setActiveCommandId(command.id)
    setDetectedPhrase(`${voice.overlay.wakeWord}, ${command.phrase}`)
    setOverlayState('thinking')
    setResponseText('')

    responseTimerRef.current = window.setTimeout(() => {
      setOverlayState('response')
      setResponseText(command.response)
    }, 650)
  }

  return (
    <div className="screen-stack">
      <section className="voice-scene">
        <div className="voice-underlay" aria-hidden="true">
          <div className="voice-underlay__header">
            <span className="mono">Procedure Context</span>
            <span className="voice-underlay__status">{procedure.caseContext.room}</span>
          </div>

          <div className="voice-underlay__title">{procedure.steps[0].title}</div>
          <div className="voice-underlay__grid">
            <div className="voice-underlay__card">
              <span className="mono">Patient</span>
              <strong>{patients.activePatient.displayName}</strong>
            </div>
            <div className="voice-underlay__card">
              <span className="mono">Doctor</span>
              <strong>{procedure.caseContext.doctor}</strong>
            </div>
            <div className="voice-underlay__card">
              <span className="mono">Tray</span>
              <strong>{readyCount} ready / {missingCount} missing</strong>
            </div>
            <div className="voice-underlay__card">
              <span className="mono">Next Handoff</span>
              <strong>{procedure.steps[0].predictedHandoff.instrument}</strong>
            </div>
          </div>
        </div>

        <div className={`voice-overlay voice-overlay--${overlayState}`}>
          <div className="voice-overlay__header">
            <div>
              <div className="mono eyebrow">Voice Overlay</div>
              <h2 className="voice-overlay__title">Command Layer Active</h2>
            </div>
            <div className="status-stack">
              <span className="status-block status-block--cyan">
                Wake word: {voice.overlay.wakeWord}
              </span>
              <span className="status-block status-block--cobalt">{overlayState}</span>
            </div>
          </div>

          <div className="voice-overlay__panel">
            <div className="voice-ring" aria-hidden="true">
              <div className="voice-ring__core" />
            </div>

            <div className="voice-command-stack">
              <div className="voice-state-line">
                <span className="mono">State</span>
                <strong>
                  {overlayState === 'listening' && 'Listening for short command'}
                  {overlayState === 'thinking' && 'Parsing command and routing response'}
                  {overlayState === 'response' && 'Command resolved'}
                </strong>
              </div>

              <div className="voice-state-line">
                <span className="mono">Detected</span>
                <strong>{detectedPhrase}</strong>
              </div>

              <div className="voice-state-line">
                <span className="mono">Response</span>
                <strong>{overlayState === 'thinking' ? '...' : responseText}</strong>
              </div>
            </div>
          </div>

          <div className="voice-command-row">
            <button type="button" className="drawer-toggle mono" onClick={armListening}>
              Arm Listening
            </button>
            {voice.commands.map((command) => (
              <button
                key={command.id}
                type="button"
                className={`command-chip ${activeCommandId === command.id ? 'is-active' : ''}`}
                onClick={() => runCommand(command.id)}
              >
                {command.phrase}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="panel-grid">
        <Panel eyebrow="Recognized Commands" title="Mapped Phrases">
          <div className="command-grid">
            {voice.commands.map((command) => (
              <button
                type="button"
                className={`command-card ${activeCommandId === command.id ? 'is-active' : ''}`}
                key={command.id}
                onClick={() => runCommand(command.id)}
              >
                <div className="mono">{command.phrase}</div>
                <p>{command.response}</p>
              </button>
            ))}
          </div>
        </Panel>

        <Panel eyebrow="Recent Events" title="Voice Event Stream">
          <div className="event-list">
            {voice.events.map((event) => (
              <div className={`event-row event-row--${event.type}`} key={event.time + event.content}>
                <span className="mono">{event.time}</span>
                <p>{event.content}</p>
              </div>
            ))}
            <div className={`event-row event-row--${overlayState === 'response' ? 'system' : 'detected'}`}>
              <span className="mono">Now</span>
              <p>
                {overlayState === 'listening' && `${voice.overlay.wakeWord} armed. Awaiting command phrase.`}
                {overlayState === 'thinking' && `Command received: ${detectedPhrase}`}
                {overlayState === 'response' && responseText}
              </p>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  )
}
