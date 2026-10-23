import type { Lang, L10n, Status } from './types'

const dict: Record<string, L10n> = {
  'site.name': { pt: 'Bernardo Nemirovsky', en: 'Bernardo Nemirovsky' },
  'gate.title': { pt: 'Quem está assistindo?', en: "Who's watching?" },
  'gate.hint': { pt: 'Escolha um perfil para ver os projetos do seu jeito.', en: 'Pick a profile to see the projects your way.' },
  'profile.recrutador': { pt: 'Recrutador', en: 'Recruiter' },
  'profile.recrutador.desc': { pt: 'IA e entregas primeiro', en: 'AI and deliveries first' },
  'profile.dev': { pt: 'Dev', en: 'Dev' },
  'profile.dev.desc': { pt: 'Stack e código em evidência', en: 'Stack and code up front' },
  'profile.curioso': { pt: 'Curioso', en: 'Curious' },
  'profile.curioso.desc': { pt: 'Tudo, sem ordem fixa', en: 'Everything, no fixed order' },
  'profile.switch': { pt: 'Trocar perfil', en: 'Switch profile' },
  'hero.featured': { pt: 'Em destaque', en: 'Featured' },
  'hero.details': { pt: 'Ver detalhes', en: 'See details' },
  'modal.close': { pt: 'Fechar', en: 'Close' },
  'modal.purpose': { pt: 'Propósito', en: 'Purpose' },
  'modal.role': { pt: 'Meu papel', en: 'My role' },
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
  'lang.switch': { pt: 'Mudar idioma para inglês', en: 'Switch language to Portuguese' },
  'lang.short': { pt: 'EN', en: 'PT' },
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

export function statusLabel(status: Status, lang: Lang): string {
  return t(`status.${status}`, lang)
}
