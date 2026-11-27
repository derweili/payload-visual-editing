import { describe, expect, it } from 'vitest'

import * as core from './index.ts'

describe('public API', () => {
  it('exports the documented surface', () => {
    expect(Object.keys(core).sort()).toEqual(
      [
        'FIELD_PARAM',
        'FOCUS_MESSAGE_TYPE',
        'LOCALE_PARAM',
        'PROTOCOL_ORIGIN',
        'PROTOCOL_VERSION',
        'READY_MESSAGE_TYPE',
        'appendPath',
        'buildAdminUrl',
        'createFocusMessage',
        'createReadyMessage',
        'decodeRef',
        'encodeRef',
        'formatPath',
        'hasStega',
        'isFocusMessage',
        'isIndexSegment',
        'isReadyMessage',
        'isSourceRef',
        'parsePath',
        'stegaClean',
        'stegaDecode',
        'stegaDecodeAll',
        'stegaEncode',
        'stegaSplit',
        'stegaSplitParts',
        'SOURCE_TAG',
        'FIELD_SOURCES_TAG',
        'sourceOf',
        'fieldSourceOf',
        'withSource',
        'setFieldSource',
        'looksLikeUrlOrDate',
        'stripIndices',
      ].sort(),
    )
    expect(core.PROTOCOL_VERSION).toBe(1)
  })
})
