import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Lang } from '../lib/types'
import { isProfile, type Profile } from '../lib/profiles'
import { safeGet, safeSet } from '../lib/storage'

type AppState = {
  profile: Profile | null
  lang: Lang
  setProfile: (p: Profile) => void
  setLang: (l: Lang) => void
}

const Ctx = createContext<AppState | null>(null)

const readLang = (): Lang => {
  const v = safeGet('lang')
  return v === 'en' || v === 'pt' ? v : 'pt'
}
const readProfile = (): Profile | null => {
  const v = safeGet('profile')
  return isProfile(v) ? v : null
}

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(readProfile)
  const [lang, setLangState] = useState<Lang>(readLang)

  useEffect(() => {
    document.documentElement.lang = lang === 'pt' ? 'pt-BR' : 'en'
  }, [lang])

  const setProfile = useCallback((p: Profile) => {
    setProfileState(p)
    safeSet('profile', p)
  }, [])
  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    safeSet('lang', l)
  }, [])

  const value = useMemo(() => ({ profile, lang, setProfile, setLang }), [profile, lang, setProfile, setLang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAppState(): AppState {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAppState must be used inside AppStateProvider')
  return ctx
}
