import type { Access } from 'payload'

export const authenticated: Access = ({ req }) => Boolean(req.user)

export const anyone: Access = () => true

/** Logged-in users see drafts; everyone else only published documents. */
export const authenticatedOrPublished: Access = ({ req }) =>
  req.user ? true : { _status: { equals: 'published' } }
