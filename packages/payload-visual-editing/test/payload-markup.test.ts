/**
 * Contract with Payload's admin markup: the DOM adapter (src/client/dom-adapter.ts) relies on
 * these class names, ids and attributes. This test reads the INSTALLED @payloadcms/ui and
 * @payloadcms/richtext-lexical, so a Payload update that renames one fails here, not silently in
 * the admin.
 */
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import {
  FIELD_CLASS,
  FIELD_PATH_ATTR,
  ROW_CONTAINER_CLASSES,
  TAB_BUTTON_ACTIVE_CLASS,
  TAB_BUTTON_CLASS,
  TABS_CLASS,
} from '../src/client/dom-adapter.ts'

const require = createRequire(import.meta.url)
/** Package root of an installed dependency (their exports maps hide package.json). */
const packageDir = (name: string) => {
  const entry = require.resolve(name)
  return entry.slice(0, entry.lastIndexOf(`/node_modules/${name}/`) + `/node_modules/${name}/`.length)
}
const ui = (file: string) => readFileSync(join(packageDir('@payloadcms/ui'), 'dist', file), 'utf8')
const lexical = (file: string) =>
  readFileSync(join(packageDir('@payloadcms/richtext-lexical'), 'dist', file), 'utf8')

describe('Payload admin markup the DOM adapter relies on', () => {
  it('tabs: container class, button class and its active modifier', () => {
    const tabs = ui('fields/Tabs/index.js')
    const tab = ui('fields/Tabs/Tab/index.js')
    expect(tabs).toContain(`baseClass = '${TABS_CLASS}'`)
    expect(tab).toContain(`'${TAB_BUTTON_CLASS}'`)
    expect(tab).toContain('--active')
    expect(TAB_BUTTON_ACTIVE_CLASS).toBe(`${TAB_BUTTON_CLASS}--active`)
    expect(tab).toMatch(/onClick: setIsActive/)
  })

  it('array and blocks containers', () => {
    for (const [file, name] of [['fields/Array/index.js', ROW_CONTAINER_CLASSES[0]], ['fields/Blocks/index.js', ROW_CONTAINER_CLASSES[1]]]) {
      expect(ui(file!)).toContain(`baseClass = '${name}'`)
    }
  })

  it('field ids: field-<path with . as __>', () => {
    for (const file of ['fields/Text/Input.js', 'fields/Textarea/Input.js', 'fields/Upload/Input.js', 'fields/Number/index.js']) {
      expect(ui(file)).toMatch(/id: `field-\$\{path\??\.replace\(\/\\\.\/g, ['"]__['"]\)\}`/)
    }
  })

  it('field wrapper class', () => {
    expect(ui('fields/shared/index.js')).toContain(`fieldBaseClass = '${FIELD_CLASS}'`)
  })

  it('Lexical marks its field with data-field-path', () => {
    expect(lexical('field/Field.js')).toContain(`"${FIELD_PATH_ATTR}"`)
  })

  it('row collapsing: the SET_ROW_COLLAPSED action and setDocFieldPreferences still exist', () => {
    expect(ui('forms/Form/types.d.ts')).toContain("type: 'SET_ROW_COLLAPSED'")
    expect(ui('fields/Array/index.js')).toContain('setDocFieldPreferences')
  })
})

