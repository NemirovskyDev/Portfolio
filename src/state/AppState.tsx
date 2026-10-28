import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang } from '../lib/types'
import { safeGet, safeSet } from '../lib/storage'

type AppState = {
  lang: Lang
  setLang: (l: Lang) => void
}

const Ctx = createContext<AppState | null>(null)

const readLang = (): Lang => {
  const v = safeGet('lang')
  return v === 'en' || v === 'pt' ? v : 'pt'
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang)

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    safeSet('lang', l)
  }, [])

  const value = useMemo(() => ({ lang, setLang }), [lang, setLang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider')
  return ctx
}
