/** The page with this slug is the homepage. */
export const HOME_SLUG = 'home'

/** Path of a page. `projects` resolves to /projects by itself, which has its own route. */
export const pagePath = (slug?: string | null) => (!slug || slug === HOME_SLUG ? '/' : `/${slug}`)
