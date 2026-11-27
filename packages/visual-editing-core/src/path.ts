/**
 * Data paths: dot-separated field names with numeric array indices, e.g. "team.2.name".
 *
 * Named tabs and groups appear in the path; unnamed tabs, collapsibles and rows don't
 * (they don't nest data). A segment made only of digits is always an array index.
 */

export type PathSegment = string | number

const INDEX_PATTERN = /^(0|[1-9]\d*)$/

function assertSegment(segment: PathSegment): void {
  if (typeof segment === 'number') {
    if (!Number.isSafeInteger(segment) || segment < 0) {
      throw new TypeError(`Invalid array index in path: ${segment}`)
    }
    return
  }
  if (segment.length === 0 || segment.includes('.')) {
    throw new TypeError(`Invalid path segment: "${segment}"`)
  }
}

/** "team.2.name" → ["team", 2, "name"]. Throws on empty segments. An empty path is []. */
export function parsePath(path: string): PathSegment[] {
  if (path === '') return []
  return path.split('.').map((segment) => {
    if (segment === '') throw new TypeError(`Invalid path: "${path}"`)
    return INDEX_PATTERN.test(segment) ? Number(segment) : segment
  })
}

/** ["team", 2, "name"] → "team.2.name". */
export function formatPath(segments: readonly PathSegment[]): string {
  segments.forEach(assertSegment)
  return segments.join('.')
}

/** Appends segments to a path: appendPath("team", 2, "name") → "team.2.name". */
export function appendPath(base: string, ...segments: PathSegment[]): string {
  return formatPath([...parsePath(base), ...segments])
}

/** Drops array indices: "team.2.name" → "team.name" (the schema-level path). */
export function stripIndices(path: string): string {
  return parsePath(path)
    .filter((segment) => typeof segment === 'string')
    .join('.')
}

/** True when the segment is an array index. */
export function isIndexSegment(segment: PathSegment): segment is number {
  return typeof segment === 'number'
}
