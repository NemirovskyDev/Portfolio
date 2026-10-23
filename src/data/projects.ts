import raw from './projects.json'
import { asset } from '../lib/assets'
import { validateProjects } from '../lib/validate'

export const projects = validateProjects(raw)
export const covers = projects.map((p) => asset(p.capa))
