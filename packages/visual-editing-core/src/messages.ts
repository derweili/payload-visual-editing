import {
  FOCUS_MESSAGE_TYPE,
  PROTOCOL_VERSION,
  READY_MESSAGE_TYPE,
  type FocusMessage,
  type ReadyMessage,
  type SourceRef,
} from './protocol.ts'
import { isSourceRef } from './ref.ts'

export function createFocusMessage(ref: SourceRef): FocusMessage {
  return { type: FOCUS_MESSAGE_TYPE, v: PROTOCOL_VERSION, ref }
}

export function createReadyMessage(): ReadyMessage {
  return { type: READY_MESSAGE_TYPE, v: PROTOCOL_VERSION }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

/** Validates `event.data`. Callers must still check `event.origin`. */
export function isFocusMessage(value: unknown): value is FocusMessage {
  return (
    isRecord(value) &&
    value.type === FOCUS_MESSAGE_TYPE &&
    value.v === PROTOCOL_VERSION &&
    isSourceRef(value.ref)
  )
}

/** Validates `event.data`. Callers must still check `event.origin`. */
export function isReadyMessage(value: unknown): value is ReadyMessage {
  return isRecord(value) && value.type === READY_MESSAGE_TYPE && value.v === PROTOCOL_VERSION
}
