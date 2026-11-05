import { useRef, useState } from 'react'
import contact from '../../data/contact.json'
import { gsap, useGSAP } from '../../lib/gsap'
import { t } from '../../lib/i18n'
import type { FluidColors } from '../../lib/palette'
import { useAppState } from '../../state/AppState'
import { FluidBackdrop } from '../Fluid/FluidBackdrop'
import './Contact.css'

type Props = { colors: FluidColors; live: boolean; animated: boolean; onTop: () => void }

type CopyState = 'idle' | 'copied' | 'failed'

/** Closing section: the way to reach me. No backend, so no form: email (with copy), LinkedIn and GitHub. */
export function Contact({ colors, live, animated, onTop }: Props) {
  const { lang } = useAppState()
  const root = useRef<HTMLElement>(null)
  const emailRef = useRef<HTMLParagraphElement>(null)
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
    { scope: root, dependencies: [animated, lang] },
  )

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(contact.email)
      setCopy('copied')
    } catch {
      // clipboard blocked (insecure context, permission): select the address so Ctrl+C works
      const node = emailRef.current
      if (node) {
        const range = document.createRange()
        range.selectNodeContents(node)
        const sel = window.getSelection()
        sel?.removeAllRanges()
        sel?.addRange(range)
      }
      setCopy('failed')
    }
  }

  const status = copy === 'copied' ? t('contact.copied', lang) : copy === 'failed' ? t('contact.copyFailed', lang) : ''

  return (
    <section ref={root} id="contato" className="contact" aria-labelledby="contact-title">
      <FluidBackdrop colors={colors} intensity={0.55} live={live} />
      <div className="contact-body">
        <h2 id="contact-title">{t('contact.title', lang)}</h2>
        <p className="contact-text">{t('contact.text', lang)}</p>
        <p ref={emailRef} className="contact-email">
          {contact.email}
        </p>
        <div className="contact-actions">
          <a className="contact-primary" href={`mailto:${contact.email}`}>
            {t('contact.write', lang)}
          </a>
          <button type="button" className="contact-ghost" onClick={copyEmail}>
            {t('contact.copy', lang)}
          </button>
          {links.map((l) => (
            <a key={l.key} className="contact-ghost" href={l.url} target="_blank" rel="noopener noreferrer">
              {t(l.key, lang)}
              <span className="sr-only"> ({t('link.newTab', lang)})</span>
            </a>
          ))}
        </div>
        <p className="sr-only" role="status" aria-live="polite">
          {status}
        </p>
        {status && (
          <p className="contact-status" aria-hidden="true">
            {status}
          </p>
        )}
        <button type="button" className="contact-top" onClick={onTop}>
          {t('contact.top', lang)}
        </button>
      </div>
    </section>
  )
}
