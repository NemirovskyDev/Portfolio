import contact from '../../data/contact.json'
import { t } from '../../lib/i18n'
import { useAppState } from '../../state/AppState'
import './About.css'

/** Links only: there is no backend, so no contact form. Empty entries in contact.json are skipped. */
export function About() {
  const { lang } = useAppState()
  const links = [
    { key: 'about.github', url: contact.github },
    { key: 'about.linkedin', url: contact.linkedin },
  ].filter((l) => /^https?:\/\//.test(l.url))

  return (
    <section className="about" aria-labelledby="about-title">
      <h2 id="about-title">{t('about.title', lang)}</h2>
      <p>{t('about.text', lang)}</p>
      <ul className="about-links">
        {links.map((l) => (
          <li key={l.key}>
            <a href={l.url} target="_blank" rel="noopener noreferrer">
              {t(l.key, lang)}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
