import type { PropsWithChildren, ReactNode } from 'react'

interface PanelProps extends PropsWithChildren {
  eyebrow?: string
  title: string
  aside?: ReactNode
  className?: string
}

export function Panel({ eyebrow, title, aside, className, children }: PanelProps) {
  return (
    <section className={className ? `panel ${className}` : 'panel'}>
      <div className="panel__header">
        <div>
          {eyebrow ? <div className="mono panel__eyebrow">{eyebrow}</div> : null}
          <h2 className="panel__title">{title}</h2>
        </div>
        {aside}
      </div>
      <div className="panel__body">{children}</div>
    </section>
  )
}
