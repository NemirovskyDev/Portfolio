/** Resolves a path under public/ against the deploy base (works on GitHub Pages sub-paths). */
export const asset = (path: string): string => `${import.meta.env.BASE_URL}${path}`
