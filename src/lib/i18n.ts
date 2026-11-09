import type { Lang, L10n, Status } from './types'

const dict: Record<string, L10n> = {
  'site.name': { pt: 'Bernardo Nemirovsky', en: 'Bernardo Nemirovsky' },
  'site.fullName': { pt: 'Bernardo Paes Nemirovsky Borges', en: 'Bernardo Paes Nemirovsky Borges' },
  'chapter.details': { pt: 'Ver detalhes', en: 'See details' },
  'modal.close': { pt: 'Fechar', en: 'Close' },
  'modal.purpose': { pt: 'Propósito', en: 'Purpose' },
  'modal.role': { pt: 'Meu papel', en: 'My role' },
  'modal.features': { pt: 'Funcionalidades', en: 'Key features' },
  'lightbox.enlarge': { pt: 'ampliar imagem', en: 'enlarge image' },
  'lightbox.prev': { pt: 'Imagem anterior', en: 'Previous image' },
  'lightbox.next': { pt: 'Próxima imagem', en: 'Next image' },
  'modal.how': { pt: 'Como funciona', en: 'How it works' },
  'modal.tools': { pt: 'Ferramentas utilizadas', en: 'Tools used' },
  'modal.methods': { pt: 'Metodologia e práticas', en: 'Methodology and practices' },
  'modal.challenges': { pt: 'Desafios e aprendizados', en: 'Challenges and lessons learned' },
  'demo.title': { pt: 'Demonstração', en: 'Demo' },
  'demo.start': { pt: 'Testar o site aqui', en: 'Try the site here' },
  'demo.startApp': { pt: 'Testar o app aqui', en: 'Try the app here' },
  'demo.interact': { pt: 'Clique para usar o site', en: 'Click to use the site' },
  'demo.fullscreen': { pt: 'Tela cheia', en: 'Full screen' },
  'demo.newTab': { pt: 'Abrir em nova aba', en: 'Open in a new tab' },
  'demo.loading': { pt: 'Carregando…', en: 'Loading…' },
  'demo.slow': { pt: 'Está demorando. Se não aparecer, abra em nova aba.', en: 'Taking a while. If it does not show up, open it in a new tab.' },
  'demo.frame': { pt: 'Demonstração de {name}', en: 'Demo of {name}' },
  'demo.video': { pt: 'Vídeo de demonstração de {name}', en: 'Demo video of {name}' },
  'modal.gallery': { pt: 'Capturas de tela', en: 'Screenshots' },
  'link.newTab': { pt: 'abre em nova aba', en: 'opens in a new tab' },
  'modal.stack': { pt: 'Tecnologias', en: 'Technologies' },
  'modal.links': { pt: 'Links', en: 'Links' },
  'status.concluido': { pt: 'Concluído', en: 'Completed' },
  'status.no-ar': { pt: 'No ar', en: 'Live' },
  'status.em-andamento': { pt: 'Em andamento', en: 'In progress' },
  'about.title': { pt: 'Sobre mim', en: 'About me' },
  'about.text': {
    pt: 'Sou estudante de Engenharia de Computação no IBMEC, no Rio de Janeiro, com foco em Inteligência Artificial, agentes e orquestração multiagente. Construo de ponta a ponta: do agente de IA ao site no ar e ao circuito montado em uma caixa impressa em 3D.',
    en: "I'm a Computer Engineering student at IBMEC in Rio de Janeiro, focused on Artificial Intelligence, agents and multi-agent orchestration. I build end to end: from the AI agent to the live website and the circuit mounted in a 3D-printed case.",
  },
  'about.skills': { pt: 'Competências', en: 'Skills' },
  'about.github': { pt: 'GitHub', en: 'GitHub' },
  'about.linkedin': { pt: 'LinkedIn', en: 'LinkedIn' },
  'lang.switch': { pt: 'EN: mudar idioma para inglês', en: 'PT: switch language to Portuguese' },
  'lang.short': { pt: 'EN', en: 'PT' },
  'hero.line': { pt: 'Engenharia de Computação no IBMEC, com foco em IA e agentes', en: 'Computer Engineering at IBMEC, focused on AI and agents' },
  'hero.count': { pt: '{n} projetos', en: '{n} projects' },
  'hero.cta': { pt: 'Ver projetos', en: 'See the projects' },
  'hero.contact': { pt: 'Falar comigo', en: 'Get in touch' },
  'hero.scroll': { pt: 'Role para conhecer', en: 'Scroll to explore' },
  'nav.label': { pt: 'Seções', en: 'Sections' },
  'nav.about': { pt: 'Sobre', en: 'About' },
  'nav.projects': { pt: 'Projetos', en: 'Projects' },
  'nav.contact': { pt: 'Contato', en: 'Contact' },
  'nav.menu': { pt: 'Menu', en: 'Menu' },
  'nav.home': { pt: 'Ir para o início', en: 'Go to the top' },
  'projects.title': { pt: 'Projetos', en: 'Projects' },
  'contact.title': { pt: 'Vamos conversar', en: "Let's talk" },
  'contact.text': {
    pt: 'Estou aberto a conversar sobre vagas e projetos em IA, agentes e desenvolvimento web. O caminho mais rápido é o e-mail ou o LinkedIn.',
    en: "I'm open to talking about roles and projects in AI, agents and web development. Email or LinkedIn is the fastest way to reach me.",
  },
  'contact.write': { pt: 'Enviar e-mail', en: 'Send an email' },
  'contact.copy': { pt: 'Copiar e-mail', en: 'Copy email' },
  'contact.copied': { pt: 'E-mail copiado', en: 'Email copied' },
  'contact.copyFailed': { pt: 'Não deu para copiar. Meu e-mail é {email}.', en: "Couldn't copy. My email is {email}." },
  'about.usedIn': { pt: 'Usado em', en: 'Used in' },
  'palette.open': { pt: 'Buscar (Ctrl+K)', en: 'Search (Ctrl+K)' },
  'palette.title': { pt: 'Buscar no portfólio', en: 'Search the portfolio' },
  'palette.placeholder': { pt: 'Buscar projeto, competência ou seção', en: 'Search a project, skill or section' },
  'palette.empty': { pt: 'Nenhum resultado', en: 'No results' },
  'palette.results': { pt: '{n} resultados', en: '{n} results' },
  'palette.close': { pt: 'Fechar busca', en: 'Close search' },
  'palette.group.sections': { pt: 'Seções', en: 'Sections' },
  'palette.group.projects': { pt: 'Projetos', en: 'Projects' },
  'palette.group.skills': { pt: 'Competências', en: 'Skills' },
  'palette.hint': { pt: 'Setas para navegar, Enter para abrir, Esc para fechar', en: 'Arrow keys to move, Enter to open, Esc to close' },
  'timeline.label': { pt: 'Linha do tempo dos projetos', en: 'Project timeline' },
  'index.open': { pt: 'Índice', en: 'Index' },
  'index.title': { pt: 'Todos os projetos', en: 'All projects' },
  'index.close': { pt: 'Fechar índice', en: 'Close index' },
  'contact.top': { pt: 'Voltar ao início', en: 'Back to the top' },
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
  Site: { pt: 'Ver site', en: 'View site' },
  GitHub: { pt: 'Ver código', en: 'View code' },
  Baixar: { pt: 'Baixar o app', en: 'Download the app' },
}

/** Link labels live in the data as plain strings; known ones are translated, others shown as written. */
export function linkLabel(label: string, lang: Lang): string {
  return linkLabels[label]?.[lang] ?? label
}

export function statusLabel(status: Status, lang: Lang): string {
  return t(`status.${status}`, lang)
}
