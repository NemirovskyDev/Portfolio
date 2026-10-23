import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AppStateProvider, useAppState } from './AppState'

const wrapper = ({ children }: { children: ReactNode }) => <AppStateProvider>{children}</AppStateProvider>

beforeEach(() => {
  localStorage.clear()
  document.documentElement.lang = 'pt-BR'
})

describe('AppState', () => {
  it('starts with no profile and pt', () => {
    const { result } = renderHook(() => useAppState(), { wrapper })
    expect(result.current.profile).toBeNull()
    expect(result.current.lang).toBe('pt')
  })

  it('setLang updates document.documentElement.lang and persists', () => {
    const { result } = renderHook(() => useAppState(), { wrapper })
    act(() => result.current.setLang('en'))
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem('lang')).toBe('en')
  })

  it('restores profile and lang from storage and ignores invalid values', () => {
    localStorage.setItem('profile', 'dev')
    localStorage.setItem('lang', 'xx')
    const { result } = renderHook(() => useAppState(), { wrapper })
    expect(result.current.profile).toBe('dev')
    expect(result.current.lang).toBe('pt')
  })

  it('works for the session when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    const { result } = renderHook(() => useAppState(), { wrapper })
    act(() => result.current.setProfile('curioso'))
    expect(result.current.profile).toBe('curioso')
    vi.restoreAllMocks()
  })

  it('throws a clear error outside the provider', () => {
    expect(() => renderHook(() => useAppState())).toThrow(/AppStateProvider/)
  })
})
