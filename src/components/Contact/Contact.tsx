import { useRef, useState } from 'react'
import contact from '../../data/contact.json'
import { gsap, useGSAP } from '../../lib/gsap'
import { t } from '../../lib/i18n'
import type { FluidColors } from '../../lib/palette'
import { useAppState } from '../../state/AppState'
import { FluidBackdrop } from '../Fluid/FluidBackdrop'
import { RollText } from '../RollText'
import './Contact.css'

type Props = { colors: FluidColors; live: boolean; animated: boolean; onTop: () => void; paused?: boolean }

type CopyState = 'idle' | 'copied' | 'failed'

/** Closing section: the way to reach me. No backend, so no form: email (with copy), LinkedIn and GitHub. */
export function Contact({ colors, live, animated, onTop, paused = false }: Props) {
  const { lang } = useAppState()
  const root = useRef<HTMLElement>(null)
  const [copy, setCopy] = useState<CopyState>('idle')
  const links = [
    { key: 'about.linkedin', url: contact.linkedin },
    { key: 'about.github', url: contact.github },
  ].filter((l) => /^https?:\/\//.test(l.url))

  useGSAP(
    () => {
      if (!animated) return
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.from('.contact-body > *', {
          opacity: 0,
          y: 32,
          stagger: 0.12,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: { trigger: root.current, start: 'top 70%', once: true },
        })
      })
    },
    { scope: root, dependencies: [animated] },
  )

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email)
      setCopy('copied')
    } catch {
      // clipboard blocked (insecure context, permission): the status message carries the address to copy by hand
      setCopy('failed')
    }
  }

  const failed = t('contact.copyFailed', lang)
  // plain text for the screen reader announcement; the visible message wraps the address so one click selects it
  const status = copy === 'copied' ? t('contact.copied', lang) : copy === 'failed' ? failed.replace('{email}', contact.email) : ''
  const [before, after = ''] = failed.split('{email}')

  return (
    <section ref={root} id="contato" className="contact" aria-labelledby="contact-title">
      <FluidBackdrop colors={colors} intensity={0.55} live={live} paused={paused} />
      <div className="contact-body">
        <h2 id="contact-title">{t('contact.title', lang)}</h2>
        <p className="contact-text">{t('contact.text', lang)}</p>
        <div className="contact-actions">
          <a className="contact-primary roll-host" data-magnetic="0.35" href={`mailto:${contact.email}`}>
            <RollText>{t('contact.write', lang)}</RollText>
          </a>
          <button type="button" className="contact-ghost roll-host" data-magnetic="0.35" onClick={copyEmail}>
            <RollText>{t('contact.copy', lang)}</RollText>
          </button>
          {links.map((l) => (
            <a key={l.key} className="contact-ghost roll-host" data-magnetic="0.35" href={l.url} target="_blank" rel="noopener noreferrer">
              <RollText>{t(l.key, lang)}</RollText>
              <span className="sr-only"> ({t('link.newTab', lang)})</span>
            </a>
          ))}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>
        {status && (
          <p className="contact-status" aria-hidden="true">
            {copy === 'failed' ? (
              <>
                {before}
                <span className="contact-status-email">{contact.email}</span>
                {after}
              </>
            ) : (
              status
            )}
          </p>
        )}
        <button type="button" className="contact-top roll-host" data-magnetic="0.35" onClick={onTop}>
          <RollText>{t('contact.top', lang)}</RollText>
        </button>
      </div>
    </section>
  )
}
