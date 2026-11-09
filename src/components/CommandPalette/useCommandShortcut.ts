import { useEffect, useRef } from 'react'

/** Ctrl+K / ⌘+K anywhere on the page. Skips events another handler already took. */
export function useCommandShortcut(onOpen: () => void) {
  // A fresh callback every render must not re-register the listener.
  const ref = useRef(onOpen)
  useEffect(() => {
    ref.current = onOpen
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.altKey || e.shiftKey) return
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'k') return
      e.preventDefault() // browsers use Ctrl+K to focus the address/search bar
      ref.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])
}
