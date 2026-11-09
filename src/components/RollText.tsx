import './RollText.css'

/** Label that rolls up on hover/focus of its `.roll-host`. The copy is aria-hidden, so the accessible name stays single. */
export function RollText({ children }: { children: string }) {
  return (
    <span className="roll">
      <span className="roll-a">{children}</span>
      <span className="roll-b" aria-hidden="true">
        {children}
      </span>
    </span>
  )
}
