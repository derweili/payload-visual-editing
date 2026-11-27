import { isIndexSegment, parsePath, type PathSegment } from '@derweili/payload-visual-editing-core'

/**
 * Turns a data path (`team.1.links.0.label`) into the steps that make the field visible in the
 * admin form: which tab to open, which array/block row to expand. Pure: works on the client
 * config's field tree, no DOM, no React.
 */

/** The parts of a client field this module reads (structural subset of Payload's ClientField). */
export interface FieldLike {
  type: string
  name?: string
  fields?: FieldLike[]
  tabs?: { name?: string; fields: FieldLike[] }[]
  blocks?: { slug: string; fields: FieldLike[] }[]
  blockReferences?: (string | { slug: string; fields: FieldLike[] })[]
}

export type FocusStep =
  /**
   * Open tab `index` of a tabs field. `ordinal` is the position of that tabs field among the
   * tabs fields of its scope (the form, or the tab content it is nested in), in render order.
   * null: the tabs field sits inside an array/block row, where it can't be located.
   */
  | { type: 'tab'; ordinal: number | null; index: number }
  /** Expand row `index` of the array or blocks field at `path`. */
  | { type: 'row'; path: string; index: number }

export interface FocusPlan {
  steps: FocusStep[]
  /** Path of the field to focus (the data path, as Payload's field ids use it). */
  path: string
}

export interface ResolveOptions {
  /** Block definitions referenced by slug (`config.blocksMap` on the client). */
  blocksMap?: Record<string, { slug: string; fields: FieldLike[] } | undefined>
  /** The `blockType` of the block row at `rowPath`, e.g. `layout.2` (from form state). */
  getBlockType?: (path: string) => string | undefined
}

/** Tabs fields directly in this scope (not inside tabs, arrays or blocks), in render order. */
const PASS_THROUGH = new Set(['row', 'collapsible'])

/** Number of tabs fields this field renders directly into the current scope. */
function countTabs(field: FieldLike): number {
  if (field.type === 'tabs') return 1
  if (PASS_THROUGH.has(field.type) || field.type === 'group') {
    return (field.fields ?? []).reduce((sum, child) => sum + countTabs(child), 0)
  }
  return 0
}

interface Walk {
  segments: PathSegment[]
  /** Data path walked so far. */
  prefix: string
  /** Tabs fields seen before in the current scope; null inside array/block rows. */
  ordinal: { next: number } | null
  steps: FocusStep[]
}

const join = (prefix: string, segment: PathSegment) => (prefix ? `${prefix}.${segment}` : String(segment))

export function resolveFocus(fields: FieldLike[], path: string, options: ResolveOptions = {}): FocusPlan | null {
  let segments: PathSegment[]
  try {
    segments = parsePath(path)
  } catch {
    return null // malformed, e.g. "a..b"
  }
  if (segments.length === 0) return null
  const steps: FocusStep[] = []
  return walkFields(fields, { segments, prefix: '', ordinal: { next: 0 }, steps }, options)
    ? { steps, path }
    : null
}

/** Walks one list of fields; true when the path was found (steps are then filled in). */
function walkFields(fields: FieldLike[], walk: Walk, options: ResolveOptions): boolean {
  for (const field of fields) {
    const before = walk.ordinal?.next ?? 0
    if (walkField(field, walk, options)) return true
    // Whatever a failed search counted inside, this field adds exactly its own tabs fields
    if (walk.ordinal) walk.ordinal.next = before + countTabs(field)
  }
  return false
}

function walkField(field: FieldLike, walk: Walk, options: ResolveOptions): boolean {
  const [head, ...rest] = walk.segments
  if (head === undefined) return false

  // Fields without data of their own: their children live in the same scope and path
  if (PASS_THROUGH.has(field.type) || (field.type === 'group' && !field.name)) {
    return walkFields(field.fields ?? [], walk, options)
  }

  if (field.type === 'tabs') {
    const ordinal = walk.ordinal ? walk.ordinal.next : null
    for (const [index, tab] of (field.tabs ?? []).entries()) {
      const step: FocusStep = { type: 'tab', ordinal, index }
      // A tab's content is its own scope for nested tabs fields
      const inner = { ordinal: walk.ordinal ? { next: 0 } : null, steps: [...walk.steps, step] }
      const found = tab.name
        ? head === tab.name &&
          walkFields(tab.fields, { ...walk, ...inner, segments: rest, prefix: join(walk.prefix, tab.name) }, options)
        : walkFields(tab.fields, { ...walk, ...inner }, options)
      if (found) {
        walk.steps.splice(0, walk.steps.length, ...inner.steps)
        return true
      }
    }
    return false
  }

  if (!field.name || field.name !== head) return false
  const path = join(walk.prefix, head)

  if (field.type === 'group') {
    return rest.length > 0 && walkFields(field.fields ?? [], { ...walk, segments: rest, prefix: path }, options)
  }

  if (field.type === 'array' || field.type === 'blocks') {
    const [index, ...inside] = rest
    // A path that ends at the array itself focuses the array field
    if (index === undefined) return true
    if (!isIndexSegment(index)) return false
    const rowPath = `${path}.${index}`
    const rowFields = field.type === 'array' ? (field.fields ?? []) : blockFields(field, rowPath, options)
    if (!rowFields) return false
    const steps = [...walk.steps, { type: 'row', path, index: Number(index) } as const]
    if (inside.length === 0) {
      walk.steps.splice(0, walk.steps.length, ...steps)
      return true
    }
    const inner: Walk = { segments: inside, prefix: rowPath, ordinal: null, steps }
    if (!walkFields(rowFields, inner, options)) return false
    walk.steps.splice(0, walk.steps.length, ...inner.steps)
    return true
  }

  // Any other named field (text, richText, upload, …) is the target
  return rest.length === 0
}

function blockFields(field: FieldLike, rowPath: string, options: ResolveOptions): FieldLike[] | undefined {
  const blockType = options.getBlockType?.(rowPath)
  if (!blockType) return undefined
  for (const block of field.blockReferences ?? field.blocks ?? []) {
    const resolved = typeof block === 'string' ? options.blocksMap?.[block] : block
    if (resolved?.slug === blockType) return resolved.fields
  }
  return undefined
}
