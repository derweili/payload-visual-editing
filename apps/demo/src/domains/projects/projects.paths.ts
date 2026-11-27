/** The CMS page that renders at /projects (it has its own route, next to project details). */
export const PROJECTS_SLUG = 'projects'

export const PROJECTS_PATH = '/projects'

export const projectPath = (slug?: string | null) => `${PROJECTS_PATH}/${slug ?? ''}`
