import type { PayloadRequest } from 'payload'

/** `req.context` key that switches encoding on (Local API: `context: { encodeSourceMaps: true }`). */
export const ENCODE_CONTEXT_KEY = 'encodeSourceMaps'
/** REST query parameter that switches encoding on (`?encodeSourceMaps=true`), subject to `canEncode`. */
export const ENCODE_QUERY_PARAM = 'encodeSourceMaps'

export interface SourceMapOptions {
  /** Default: true. false removes the encoding hooks entirely. */
  enabled?: boolean
  /**
   * Who may switch encoding on with the REST query parameter.
   * Default: logged-in users only. The Local API context flag is trusted (server code).
   */
  canEncode?: (args: { req: PayloadRequest }) => boolean | Promise<boolean>
  /**
   * How URL- or date-like strings are treated. "auto" (default) leaves them unencoded: dates as
   * in @vercel/stega, URLs only without whitespace (see `looksLikeUrlOrDate` in core).
   * false encodes every string that isn't excluded; true encodes nothing.
   */
  skip?: 'auto' | boolean
  /**
   * Only encode fields whose path matches one of these patterns. Default: every field.
   * Patterns match the data path without array indices (`team.links.label`):
   * `*` is one segment, `**` any number of segments, and a pattern without a dot matches a
   * field name at any depth.
   */
  include?: string[]
  /** Never encode fields matching these patterns (same syntax). Replaces the defaults. */
  exclude?: string[]
}

export interface VisualEditingPluginOptions {
  /** Turns the whole plugin off without removing it from the config. Default: true. */
  enabled?: boolean
  /** Collections whose documents get source maps and field focusing. Default: none. */
  collections?: string[]
  /** Globals that get source maps and field focusing. Default: none. */
  globals?: string[]
  sourceMaps?: SourceMapOptions
  /**
   * Adds the admin component that focuses a field from `?field=` or a click in the Live Preview
   * to the edit views of these collections and globals. Default: true. Run
   * `payload generate:importmap` after adding the plugin.
   */
  focusFields?: boolean
}

/** Text fields that usually feed logic rather than display. Fields named `id` are never encoded. */
export const DEFAULT_EXCLUDE = ['slug', 'url']

export interface ResolvedSourceMapOptions {
  enabled: boolean
  canEncode: NonNullable<SourceMapOptions['canEncode']>
  skip: 'auto' | boolean
  include: string[] | null
  exclude: string[]
}

export const defaultCanEncode: ResolvedSourceMapOptions['canEncode'] = ({ req }) => Boolean(req.user)

export function resolveSourceMapOptions(options: SourceMapOptions = {}): ResolvedSourceMapOptions {
  return {
    enabled: options.enabled ?? true,
    canEncode: options.canEncode ?? defaultCanEncode,
    skip: options.skip ?? 'auto',
    include: options.include ?? null,
    exclude: options.exclude ?? DEFAULT_EXCLUDE,
  }
}
