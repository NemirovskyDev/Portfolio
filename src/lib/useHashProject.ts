import { useCallback, useEffect, useState } from 'react'
import type { Project } from './types'

const PREFIX = '#/p/'

const readId = (): string | null => {
  const h = window.location.hash
  return h.startsWith(PREFIX) ? decodeURIComponent(h.slice(PREFIX.length)) || null : null
}

/** The open project lives in the URL hash so a project can be linked directly. Unknown ids resolve to no project. */
export function useHashProject(projects: Project[]) {
  const [id, setId] = useState<string | null>(readId)

  useEffect(() => {
    const sync = () => setId(readId())
    window.addEventListener('hashchange', sync)
    window.addEventListener('popstate', sync)
    return () => {
      window.removeEventListener('hashchange', sync)
      window.removeEventListener('popstate', sync)
    }
  }, [])

  const open = useCallback((next: string) => {
    window.location.hash = `${PREFIX}${encodeURIComponent(next)}`
    setId(next)
  }, [])

  const close = useCallback(() => {
    window.history.replaceState(null, '', window.location.pathname + window.location.search)
    setId(null)
  }, [])

  return { project: projects.find((p) => p.id === id) ?? null, open, close }
}
