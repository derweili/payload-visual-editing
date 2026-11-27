/**
 * Thin wrapper around @vercel/stega (MPL-2.0, used unmodified as a dependency).
 * Only refs of our protocol are decoded; foreign stega payloads are ignored.
 */
import {
  VERCEL_STEGA_REGEX,
  vercelStegaCombine,
  vercelStegaDecodeAll,
} from '@vercel/stega'

import type { SourceRef } from './protocol.ts'
import { isSourceRef } from './ref.ts'

export interface StegaEncodeOptions {
  /**
   * "auto" (default) leaves strings that look like a URL or a date unchanged, because
   * hidden characters would break them (see `looksLikeUrlOrDate`). true never encodes, false
   * always encodes.
   */
  skip?: 'auto' | boolean
}

// Non-global copy: a global regex keeps `lastIndex` between `test()` calls.
const STEGA_PATTERN = new RegExp(VERCEL_STEGA_REGEX.source, 'u')

/**
 * The "auto" skip rule. Dates as in @vercel/stega. URLs stricter than @vercel/stega, which
 * skips anything `new URL()` accepts, including prose like "Hinweis: Text" (scheme "hinweis:").
 * A link target never contains whitespace, so text with whitespace is never treated as a URL.
 */
export function looksLikeUrlOrDate(text: string): boolean {
  return looksLikeDate(text) || looksLikeUrl(text)
}

function looksLikeUrl(text: string): boolean {
  if (/\s/.test(text)) return false
  try {
    new URL(text, text.startsWith('/') ? 'https://example.com' : undefined)
    return true
  } catch {
    return false
  }
}

/** Same rule as @vercel/stega: ISO-like dates, not numbers and not words that Date.parse accepts. */
function looksLikeDate(text: string): boolean {
  if (!Number.isNaN(Number(text))) return false
  if (/[a-z]/i.test(text) && !/\d+(?:[-:/]\d+){2}(?:T\d+(?:[-:/]\d+){1,2}(\.\d+)?Z?)?/.test(text)) return false
  return !Number.isNaN(Date.parse(text))
}

/** True when the string carries hidden stega data (ours or anyone's). */
export function hasStega(text: string): boolean {
  return STEGA_PATTERN.test(text)
}

/**
 * Appends the ref to the text as invisible characters.
 * Empty strings and strings that already carry stega data are returned unchanged, so the
 * innermost ref wins (e.g. a populated relationship keeps its own document's ref).
 */
export function stegaEncode(
  text: string,
  ref: SourceRef,
  options: StegaEncodeOptions = {},
): string {
  if (text === '' || hasStega(text)) return text
  const skip = options.skip ?? 'auto'
  return vercelStegaCombine(text, ref, skip === 'auto' ? looksLikeUrlOrDate(text) : skip)
}

/** Returns every ref of our protocol hidden in the text, in order. */
export function stegaDecodeAll(text: string): SourceRef[] {
  if (!hasStega(text)) return []
  let values: unknown[]
  try {
    values = vercelStegaDecodeAll<unknown>(text) ?? []
  } catch {
    return []
  }
  return values.filter(isSourceRef)
}

/** Returns the first ref of our protocol hidden in the text, if any. */
export function stegaDecode(text: string): SourceRef | undefined {
  return stegaDecodeAll(text)[0]
}

export interface StegaSplitResult {
  /** The visible text. */
  cleaned: string
  /** The first hidden run of characters, or "" when there is none. */
  encoded: string
  /** The decoded ref, when the hidden data is ours. */
  ref?: SourceRef
}

/** Separates the visible text from the hidden data. */
export function stegaSplit(text: string): StegaSplitResult {
  const match = text.match(STEGA_PATTERN)
  const cleaned = text.replace(VERCEL_STEGA_REGEX, '')
  if (!match) return { cleaned, encoded: '' }
  const ref = stegaDecode(match[0])
  return { cleaned, encoded: match[0], ...(ref ? { ref } : {}) }
}

/**
 * Splits encoded text into parts (paragraphs, lines) that each keep the source ref.
 * Stega data sits at the end of a string, so a plain `split` leaves it on the last part only,
 * and `trim()` can damage it (U+FEFF counts as whitespace). Splits the visible text, runs `map`
 * on each part (e.g. trim), drops empty parts and appends the hidden data to each.
 */
export function stegaSplitParts(
  text: string,
  separator: string | RegExp,
  map: (part: string) => string = (part) => part,
): string[] {
  const { cleaned, encoded } = stegaSplit(text)
  return cleaned
    .split(separator)
    .map(map)
    .filter(Boolean)
    .map((part) => part + encoded)
}

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  if (typeof value !== 'object' || value === null) return false
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

/**
 * Removes hidden stega data. Strings are cleaned; arrays and plain objects are cleaned
 * deeply into a copy. Other values (Date, Map, class instances, …) are returned as they are.
 */
export function stegaClean<T>(value: T): T {
  if (typeof value === 'string') return value.replace(VERCEL_STEGA_REGEX, '') as T
  if (Array.isArray(value)) return value.map((item) => stegaClean(item)) as T
  if (isPlainObject(value)) {
    const result: Record<string, unknown> = {}
    for (const [key, item] of Object.entries(value)) result[key] = stegaClean(item)
    return result as T
  }
  return value
}
