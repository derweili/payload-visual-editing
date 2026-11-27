/**
 * Wire protocol shared by the Payload plugin and the frontend overlay.
 *
 * Everything that crosses a boundary (stega payload, postMessage) uses short keys
 * to keep encoded strings small. Bump PROTOCOL_VERSION on any breaking change.
 */

export const PROTOCOL_VERSION = 1 as const
export type ProtocolVersion = typeof PROTOCOL_VERSION

/** Marks a stega payload or message as ours ("payload visual editing"). */
export const PROTOCOL_ORIGIN = 'pve' as const

export type DocumentId = string | number

interface SourceRefBase {
  /** Origin marker, always "pve". */
  o: typeof PROTOCOL_ORIGIN
  /** Protocol version. */
  v: ProtocolVersion
  /** Data path, e.g. "team.2.name". */
  p: string
  /** Locale of the value, when the field is localized. */
  l?: string
  /** Full admin URL (keeps the ref compatible with Vercel's Content Link format). */
  href?: string
}

/** Ref to a field in a collection document. */
export interface CollectionSourceRef extends SourceRefBase {
  /** Collection slug. */
  c: string
  /** Document id. */
  id: DocumentId
  g?: never
}

/** Ref to a field in a global. */
export interface GlobalSourceRef extends SourceRefBase {
  /** Global slug. */
  g: string
  c?: never
  id?: never
}

/** Stega payload: points at one field value in Payload. */
export type SourceRef = CollectionSourceRef | GlobalSourceRef

export const FOCUS_MESSAGE_TYPE = 'pve:focus' as const
export const READY_MESSAGE_TYPE = 'pve:ready' as const

/** Overlay → admin: focus the field the ref points at. */
export interface FocusMessage {
  type: typeof FOCUS_MESSAGE_TYPE
  v: ProtocolVersion
  ref: SourceRef
}

/** Admin → overlay: the admin listens for focus messages (handshake). */
export interface ReadyMessage {
  type: typeof READY_MESSAGE_TYPE
  v: ProtocolVersion
}

export type ProtocolMessage = FocusMessage | ReadyMessage
