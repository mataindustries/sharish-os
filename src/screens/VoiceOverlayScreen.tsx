import voice from '../data/voice.json'
import { Panel } from '../components/Panel'

export function VoiceOverlayScreen() {
  return (
    <div className="screen-stack">
      <section className="voice-overlay">
        <div className="voice-overlay__header">
          <div>
            <div className="mono eyebrow">Voice Overlay Mock</div>
            <h2 className="voice-overlay__title">Command Layer Active</h2>
          </div>
          <div className="status-stack">
            <span className="status-block status-block--cyan">
              Wake word: {voice.overlay.wakeWord}
            </span>
            <span className="status-block status-block--cobalt">{voice.overlay.mode}</span>
          </div>
        </div>

        <div className="voice-ring" aria-hidden="true">
          <div className="voice-ring__core" />
        </div>

        <div className="signal-block signal-block--cyan">
          <div className="mono signal-block__label">Active prompt</div>
          <strong>{voice.overlay.prompt}</strong>
        </div>
      </section>

      <div className="panel-grid">
        <Panel eyebrow="Recognized Commands" title="Mapped Phrases">
          <div className="command-grid">
            {voice.commands.map((command) => (
              <div className="command-card" key={command.id}>
                <div className="mono">{command.phrase}</div>
                <p>{command.response}</p>
              </div>
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
          </div>
        </Panel>
      </div>
    </div>
  )
}
