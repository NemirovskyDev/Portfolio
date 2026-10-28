import { describe, it, expect, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { AppStateProvider, useAppState } from './AppState'

const wrapper = ({ children }: { children: ReactNode }) => <AppStateProvider>{children}</AppStateProvider>

beforeEach(() => {
  localStorage.clear()
  document.documentElement.lang = 'pt-BR'
})

describe('AppState', () => {
  it('starts in pt', () => {
    const { result } = renderHook(() => useAppState(), { wrapper })
    expect(result.current.lang).toBe('pt')
  })

  it('setLang updates document.documentElement.lang and persists', () => {
    const { result } = renderHook(() => useAppState(), { wrapper })
    act(() => result.current.setLang('en'))
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem('lang')).toBe('en')
  })

  it('restores the language from storage and ignores invalid values', () => {
    localStorage.setItem('lang', 'en')
    expect(renderHook(() => useAppState(), { wrapper }).result.current.lang).toBe('en')
    localStorage.setItem('lang', 'xx')
    expect(renderHook(() => useAppState(), { wrapper }).result.current.lang).toBe('pt')
  })

  it('keeps working for the session when localStorage throws', () => {
    const original = Storage.prototype.setItem
    Storage.prototype.setItem = () => {
      throw new Error('blocked')
    }
    try {
      const { result } = renderHook(() => useAppState(), { wrapper })
      act(() => result.current.setLang('en'))
      expect(result.current.lang).toBe('en')
    } finally {
      Storage.prototype.setItem = original
    }
  })

  it('throws a clear error outside the provider', () => {
    expect(() => renderHook(() => useAppState())).toThrow(/AppStateProvider/)
  })
})
