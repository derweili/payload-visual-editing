import { stripIndices } from '@derweili/payload-visual-editing-core'

/**
 * Compiles include/exclude patterns into one test on data paths.
 * Patterns match the path without array indices: `team.2.links.0.label` → `team.links.label`.
 * - `*` matches one segment (or part of one: `meta*`), `**` any number of segments (also none)
 * - a pattern without a dot matches a field name at any depth (`slug` ≙ `**.slug`)
 */
export function createPathMatcher(patterns: readonly string[]): (path: string) => boolean {
  const compiled = patterns.map((pattern) =>
    (pattern.includes('.') ? pattern : `**.${pattern}`).split('.').map(compileSegment),
  )
  return (path) => {
    const segments = stripIndices(path).split('.')
    return compiled.some((pattern) => matches(pattern, 0, segments, 0))
  }
}

type Segment = '**' | RegExp

function compileSegment(segment: string): Segment {
  if (segment === '**') return '**'
  const escaped = segment.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
  return new RegExp(`^${escaped}$`)
}

function matches(pattern: Segment[], p: number, path: string[], s: number): boolean {
  if (p === pattern.length) return s === path.length
  const segment = pattern[p]!
  if (segment === '**') {
    // Zero or more segments
    for (let next = s; next <= path.length; next++) {
      if (matches(pattern, p + 1, path, next)) return true
    }
    return false
  }
  return s < path.length && segment.test(path[s]!) && matches(pattern, p + 1, path, s + 1)
}
