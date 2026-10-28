import type { Lang, L10n, Status } from './types'

const dict: Record<string, L10n> = {
  'site.name': { pt: 'Bernardo Nemirovsky', en: 'Bernardo Nemirovsky' },
  'site.fullName': { pt: 'Bernardo Paes Nemirovsky Borges', en: 'Bernardo Paes Nemirovsky Borges' },
  'chapter.details': { pt: 'Ver detalhes', en: 'See details' },
  'modal.close': { pt: 'Fechar', en: 'Close' },
  'modal.purpose': { pt: 'Propósito', en: 'Purpose' },
  'modal.role': { pt: 'Meu papel', en: 'My role' },
  'modal.features': { pt: 'Funcionalidades', en: 'Key features' },
  'modal.challenges': { pt: 'Desafios e aprendizados', en: 'Challenges and lessons learned' },
  'modal.gallery': { pt: 'Capturas de tela', en: 'Screenshots' },
  'link.newTab': { pt: 'abre em nova aba', en: 'opens in a new tab' },
  'modal.stack': { pt: 'Tecnologias', en: 'Technologies' },
  'modal.links': { pt: 'Links', en: 'Links' },
  'status.concluido': { pt: 'Concluído', en: 'Completed' },
  'status.no-ar': { pt: 'No ar', en: 'Live' },
  'status.em-andamento': { pt: 'Em andamento', en: 'In progress' },
  'about.title': { pt: 'Sobre mim e contato', en: 'About me and contact' },
  'about.text': {
    pt: 'Sou estudante de Engenharia de Computação no IBMEC, com foco em Inteligência Artificial, agentes e orquestração multiagente. Aqui estão os projetos que já construí.',
    en: "I'm a Computer Engineering student at IBMEC, focused on Artificial Intelligence, agents and multi-agent orchestration. Here are the projects I've built.",
  },
  'about.github': { pt: 'GitHub', en: 'GitHub' },
  'about.linkedin': { pt: 'LinkedIn', en: 'LinkedIn' },
  'lang.switch': { pt: 'EN: mudar idioma para inglês', en: 'PT: switch language to Portuguese' },
  'lang.short': { pt: 'EN', en: 'PT' },
  'opening.line': { pt: 'Engenharia de Computação, foco em IA e agentes', en: 'Computer Engineering, focused on AI and agents' },
  'opening.count': { pt: '{n} projetos', en: '{n} projects' },
  'opening.scroll': { pt: 'Role para começar', en: 'Scroll to start' },
  'timeline.label': { pt: 'Linha do tempo dos projetos', en: 'Project timeline' },
  'index.open': { pt: 'Índice', en: 'Index' },
  'index.title': { pt: 'Todos os projetos', en: 'All projects' },
  'index.close': { pt: 'Fechar índice', en: 'Close index' },
  'credits.top': { pt: 'Voltar ao início', en: 'Back to the top' },
}

const categories: Record<string, L10n> = {
  Sites: { pt: 'Sites', en: 'Websites' },
  Hackathons: { pt: 'Hackathons', en: 'Hackathons' },
  'IA e Agentes': { pt: 'IA e Agentes', en: 'AI and Agents' },
  Universidade: { pt: 'Universidade', en: 'University' },
  Hardware: { pt: 'Hardware', en: 'Hardware' },
  Ferramentas: { pt: 'Ferramentas', en: 'Tools' },
}

export function t(key: string, lang: Lang): string {
  return dict[key]?.[lang] ?? key
}

export function categoryLabel(categoria: string, lang: Lang): string {
  return categories[categoria]?.[lang] ?? categoria
}

const linkLabels: Record<string, L10n> = {
  Site: { pt: 'Site', en: 'Website' },
}

/** Link labels live in the data as plain strings; known ones are translated, others shown as written. */
export function linkLabel(label: string, lang: Lang): string {
  return linkLabels[label]?.[lang] ?? label
}

export function statusLabel(status: Status, lang: Lang): string {
  return t(`status.${status}`, lang)
}
