/**
 * Walks a document alongside its `flattenedFields` and appends a stega ref to every text value.
 * Fields that can't carry stega text (uploads, relationships, numbers, dates, selects, …, and text
 * left unencoded: excluded or URL/date-like) get a source tag instead (core `source.ts`): populated
 * documents are replaced by a tagged copy, other values are recorded on their parent.
 *
 * `flattenedFields` already drops unnamed tabs, rows and collapsibles (they don't nest data);
 * named tabs appear as `type: 'tab'`. So the walk only follows data nesting: groups, named tabs,
 * arrays and blocks. Mutates `data` in place, like Payload's own afterRead hooks.
 */
import {
  appendPath,
  encodeRef,
  hasStega,
  setFieldSource,
  stegaEncode,
  withSource,
  type SourceLocation,
} from '@derweili/payload-visual-editing-core'
import type { FlattenedBlock, FlattenedField } from 'payload'

export type EncodeTarget = { collection: string; id: string | number } | { global: string }

export interface EncodeDocumentArgs {
  fields: FlattenedField[]
  data: Record<string, unknown>
  target: EncodeTarget
  /** `req.locale`: a locale code, "all", or undefined without localization. */
  locale: string | undefined
  /** Locale codes of the config, or null without localization. */
  locales: string[] | null
  skip: 'auto' | boolean
  /** Whether a data path should get a ref (include/exclude). */
  shouldEncodePath: (path: string) => boolean
  /** Resolves blocks referenced by slug (`config.blocks`). */
  resolveBlock: (slug: string) => FlattenedBlock | undefined
}

type Walk = Omit<EncodeDocumentArgs, 'fields' | 'data'>

const isRecord = (value: unknown): value is Record<string, any> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isLocalized = (field: FlattenedField) => 'localized' in field && field.localized === true

export function encodeDocument({ fields, data, ...walk }: EncodeDocumentArgs): void {
  encodeFields(walk, fields, data, '', undefined)
}

function encodeFields(
  walk: Walk,
  fields: FlattenedField[],
  data: Record<string, any>,
  basePath: string,
  /** Set once the value is known to belong to one locale. */
  valueLocale: string | undefined,
): void {
  for (const field of fields) {
    // IDs (document, array row, block) are identifiers, never content
    if (field.name === 'id') continue
    if ('virtual' in field && field.virtual) continue
    if (!(field.name in data)) continue

    const path = appendPath(basePath, field.name)
    const value = data[field.name]

    // locale "all": the outermost localized field holds { de: …, en: … }
    if (walk.locale === 'all' && valueLocale === undefined && isLocalized(field)) {
      if (isRecord(value) && walk.locales) {
        for (const code of walk.locales) {
          if (code in value) value[code] = encodeValue(walk, field, value[code], path, code)
        }
      }
      continue
    }

    const locale =
      valueLocale ?? (isLocalized(field) && walk.locale !== 'all' ? walk.locale : undefined)
    const encoded = encodeValue(walk, field, value, path, locale)
    data[field.name] = encoded
    tagSource(walk, field, data, encoded, path, locale)
  }
}

/** Data-nesting fields: their content is tagged or encoded field by field. */
const CONTAINERS = new Set(['group', 'tab', 'array', 'blocks'])

/** Gives a value without stega text a source tag (see the module comment). */
function tagSource(
  walk: Walk,
  field: FlattenedField,
  parent: Record<string, any>,
  value: unknown,
  path: string,
  locale: string | undefined,
): void {
  if (value === null || value === undefined || CONTAINERS.has(field.type) || field.type === 'richText') return
  if (typeof value === 'string' && hasStega(value)) return
  const source = location(walk, path, locale)
  if (field.type === 'upload' || field.type === 'relationship') {
    // Populated documents (objects) carry the tag themselves, so it survives mapping them
    if (Array.isArray(value)) {
      parent[field.name] = value.map((item) => (isRecord(item) ? withSource(item, source) : item))
    } else if (isRecord(value)) {
      parent[field.name] = withSource(value, source)
    }
  }
  setFieldSource(parent, field.name, source)
}

function encodeValue(
  walk: Walk,
  field: FlattenedField,
  value: unknown,
  path: string,
  locale: string | undefined,
): unknown {
  if (value === null || value === undefined) return value

  switch (field.type) {
    case 'text':
    case 'textarea': {
      if (typeof value !== 'string' || !walk.shouldEncodePath(path)) return value
      return stegaEncode(value, ref(walk, path, locale), { skip: walk.skip })
    }
    case 'richText': {
      if (walk.shouldEncodePath(path)) {
        encodeLexicalText(value, (text) => stegaEncode(text, ref(walk, path, locale), { skip: walk.skip }))
      }
      return value
    }
    case 'group':
    case 'tab': {
      if (isRecord(value)) encodeFields(walk, field.flattenedFields, value, path, locale)
      return value
    }
    case 'array': {
      if (Array.isArray(value)) {
        value.forEach((row, index) => {
          if (isRecord(row)) encodeFields(walk, field.flattenedFields, row, appendPath(path, index), locale)
        })
      }
      return value
    }
    case 'blocks': {
      if (Array.isArray(value)) {
        value.forEach((row, index) => {
          if (!isRecord(row) || typeof row.blockType !== 'string') return
          const block = findBlock(walk, field.blockReferences ?? field.blocks, row.blockType)
          if (block) encodeFields(walk, block.flattenedFields, row, appendPath(path, index), locale)
        })
      }
      return value
    }
    default:
      // relationship/upload: a populated document is encoded by its own collection's hook.
      // number, date, select, email, json, code, point, checkbox, join: not text content.
      return value
  }
}

function findBlock(walk: Walk, blocks: (FlattenedBlock | string)[], slug: string) {
  for (const block of blocks) {
    if (typeof block === 'string') {
      if (block === slug) return walk.resolveBlock(slug)
    } else if (block.slug === slug) {
      return block
    }
  }
  return undefined
}

function location(walk: Walk, path: string, locale: string | undefined): SourceLocation {
  return { ...walk.target, path, ...(locale ? { locale } : {}) } as SourceLocation
}

function ref(walk: Walk, path: string, locale: string | undefined) {
  return encodeRef(location(walk, path, locale))
}

/**
 * Encodes the text nodes of a Lexical state. Every node gets the ref of the field itself;
 * node-level refs are a later option (ADR 0001). Only `children` are followed, so populated
 * documents inside upload/relationship nodes and the fields of link and block nodes stay as they are.
 */
function encodeLexicalText(state: unknown, encode: (text: string) => string): void {
  if (!isRecord(state) || !isRecord(state.root)) return
  const visit = (node: unknown) => {
    if (!isRecord(node)) return
    if (node.type === 'text' && typeof node.text === 'string') node.text = encode(node.text)
    if (Array.isArray(node.children)) node.children.forEach(visit)
  }
  visit(state.root)
}
