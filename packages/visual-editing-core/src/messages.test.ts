import { describe, expect, it } from 'vitest'

import { createFocusMessage, createReadyMessage, isFocusMessage, isReadyMessage } from './messages.ts'
import { PROTOCOL_VERSION } from './protocol.ts'
import { encodeRef } from './ref.ts'

const ref = encodeRef({ collection: 'pages', id: 'abc', path: 'team.2.name' })

describe('createFocusMessage / createReadyMessage', () => {
  it('creates versioned messages', () => {
    expect(createFocusMessage(ref)).toEqual({ type: 'pve:focus', v: PROTOCOL_VERSION, ref })
    expect(createReadyMessage()).toEqual({ type: 'pve:ready', v: PROTOCOL_VERSION })
  })

  it('survives structured cloning (postMessage)', () => {
    const message = structuredClone(createFocusMessage(ref))
    expect(isFocusMessage(message)).toBe(true)
  })
})

describe('isFocusMessage', () => {
  it('accepts a valid message', () => {
    expect(isFocusMessage(createFocusMessage(ref))).toBe(true)
  })

  it.each([
    ['null', null],
    ['a string', 'pve:focus'],
    ['a ready message', createReadyMessage()],
    ['the wrong version', { type: 'pve:focus', v: 2, ref }],
    ['a missing ref', { type: 'pve:focus', v: 1 }],
    ['an invalid ref', { type: 'pve:focus', v: 1, ref: { ...ref, o: 'x' } }],
    // Payload's own Live Preview messages
    ['a Payload live preview message', { type: 'payload-live-preview', data: {} }],
    ['a Payload document event', { type: 'payload-document-event', entitySlug: 'pages' }],
  ])('rejects %s', (_label, value) => {
    expect(isFocusMessage(value)).toBe(false)
  })
})

describe('isReadyMessage', () => {
  it('accepts a valid message', () => {
    expect(isReadyMessage(createReadyMessage())).toBe(true)
  })

  it.each([
    ['null', null],
    ['a focus message', createFocusMessage(ref)],
    ['the wrong version', { type: 'pve:ready', v: 0 }],
    ['a foreign message', { type: 'ready' }],
  ])('rejects %s', (_label, value) => {
    expect(isReadyMessage(value)).toBe(false)
  })
})
