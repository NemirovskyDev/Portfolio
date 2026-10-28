import raw from './projects.json'
import { validateProjects } from '../lib/validate'

export const projects = validateProjects(raw)
