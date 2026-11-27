import type { SourceLocation } from './ref.ts'

/**
 * Source tags for values that can't carry stega text: images and other populated documents,
 * numbers, dates, selects, link fields. The server plugin sets them when it encodes a document.
 *
 * Symbols (Symbol.for, so every copy of this package agrees): invisible to JSON, REST responses,
 * `Object.keys` and spreading into props, so the data looks exactly as before. They don't survive
 * serialization either: read them on the server and pass the plain `SourceLocation` on.
 */
export const SOURCE_TAG = Symbol.for('payload-visual-editing.source')
export const FIELD_SOURCES_TAG = Symbol.for('payload-visual-editing.field-sources')

type Tagged = { [SOURCE_TAG]?: SourceLocation; [FIELD_SOURCES_TAG]?: Record<string, SourceLocation> }

const isObject = (value: unknown): value is object => typeof value === 'object' && value !== null

/** The field a populated document (e.g. an image from an upload field) was read through. */
export function sourceOf(value: unknown): SourceLocation | null {
  return isObject(value) ? ((value as Tagged)[SOURCE_TAG] ?? null) : null
}

/** The source of a field without stega text, read from its parent: `fieldSourceOf(project, 'year')`. */
export function fieldSourceOf(parent: unknown, name: string): SourceLocation | null {
  return isObject(parent) ? ((parent as Tagged)[FIELD_SOURCES_TAG]?.[name] ?? null) : null
}

/**
 * A shallow copy of `value` tagged with its source. A copy, because Payload may hand out one
 * populated document for several fields (the same image used twice).
 */
export function withSource<T extends object>(value: T, source: SourceLocation): T {
  const copy = (Array.isArray(value) ? [...value] : { ...value }) as T & Tagged
  copy[SOURCE_TAG] = source
  return copy
}

/** Records the source of field `name` on its parent object, under a symbol key. */
export function setFieldSource(parent: object, name: string, source: SourceLocation): void {
  const tagged = parent as Tagged
  tagged[FIELD_SOURCES_TAG] = { ...tagged[FIELD_SOURCES_TAG], [name]: source }
}
