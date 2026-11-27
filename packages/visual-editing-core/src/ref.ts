import {
  PROTOCOL_ORIGIN,
  PROTOCOL_VERSION,
  type DocumentId,
  type SourceRef,
} from './protocol.ts'

interface SourceLocationBase {
  /** Data path, e.g. "team.2.name". */
  path: string
  locale?: string
  href?: string
}

export interface CollectionSourceLocation extends SourceLocationBase {
  collection: string
  id: DocumentId
  global?: never
}

export interface GlobalSourceLocation extends SourceLocationBase {
  global: string
  collection?: never
  id?: never
}

/** Readable form of a SourceRef, used in code; the short-key form is used on the wire. */
export type SourceLocation = CollectionSourceLocation | GlobalSourceLocation

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0

const isDocumentId = (value: unknown): value is DocumentId =>
  isNonEmptyString(value) || (typeof value === 'number' && Number.isFinite(value))

/** Converts a readable location into the compact wire format. */
export function encodeRef(location: SourceLocation): SourceRef {
  const base = {
    o: PROTOCOL_ORIGIN,
    v: PROTOCOL_VERSION,
    p: location.path,
    ...(location.locale ? { l: location.locale } : {}),
    ...(location.href ? { href: location.href } : {}),
  }
  if ('global' in location && location.global) {
    return { ...base, g: location.global }
  }
  return { ...base, c: location.collection as string, id: location.id as DocumentId }
}

/**
 * Checks that a value is a SourceRef of the current protocol version.
 * Foreign payloads (other stega producers, older versions) return false.
 */
export function isSourceRef(value: unknown): value is SourceRef {
  if (typeof value !== 'object' || value === null) return false
  const ref = value as Record<string, unknown>
  if (ref.o !== PROTOCOL_ORIGIN || ref.v !== PROTOCOL_VERSION) return false
  if (typeof ref.p !== 'string') return false
  if (ref.l !== undefined && !isNonEmptyString(ref.l)) return false
  if (ref.href !== undefined && !isNonEmptyString(ref.href)) return false

  const isGlobal = ref.g !== undefined
  const isCollection = ref.c !== undefined || ref.id !== undefined
  if (isGlobal === isCollection) return false
  if (isGlobal) return isNonEmptyString(ref.g)
  return isNonEmptyString(ref.c) && isDocumentId(ref.id)
}

/** Converts a wire ref back into a readable location; returns null for anything invalid. */
export function decodeRef(value: unknown): SourceLocation | null {
  if (!isSourceRef(value)) return null
  const base = {
    path: value.p,
    ...(value.l ? { locale: value.l } : {}),
    ...(value.href ? { href: value.href } : {}),
  }
  if (value.g !== undefined) return { ...base, global: value.g }
  return { ...base, collection: value.c, id: value.id }
}
