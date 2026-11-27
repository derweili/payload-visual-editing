// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ancestorPaths, findFieldElement, revealElement, tabsInScope } from './dom-adapter.ts'
import { expandRow, runFocusPlan, type FocusApi } from './focus.ts'

/**
 * A small stand-in for Payload's edit form: tabs render only the active tab's fields, and a click
 * on a tab button switches tabs on the next tick (like React re-rendering).
 */
function tabsField(id: string, tabs: string[][], active = 0): HTMLElement {
  const root = document.createElement('div')
  root.className = 'field-type tabs-field'
  root.dataset.test = id
  const bar = document.createElement('div')
  const content = document.createElement('div')
  const render = (index: number) => {
    bar.querySelectorAll('button').forEach((button, i) => {
      button.className = `tabs-field__tab-button${i === index ? ' tabs-field__tab-button--active' : ''}`
    })
    content.innerHTML = tabs[index]!.join('')
  }
  tabs.forEach((_tab, index) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.addEventListener('click', () => setTimeout(() => render(index), 10))
    bar.append(button)
  })
  root.append(bar, content)
  render(active)
  return root
}
const input = (path: string) =>
  `<div class="field-type"><input id="field-${path.replace(/\./g, '__')}"></div>`

const api = (rows: Record<string, { id: string; collapsed?: boolean }[]> = {}) => {
  const state = structuredClone(rows)
  const mock = {
    getField: vi.fn((path: string) => (state[path] ? { rows: state[path] } : undefined)),
    dispatchFields: vi.fn(({ path, updatedRows }: { path: string; updatedRows: never[] }) => {
      state[path] = updatedRows
    }),
    setDocFieldPreferences: vi.fn(),
  }
  return mock as typeof mock & FocusApi
}

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
})
afterEach(() => {
  document.body.innerHTML = ''
})

describe('dom adapter', () => {
  it('finds fields by id and Lexical fields by data-field-path', () => {
    document.body.innerHTML = `${input('team.1.name')}<div class="field-type rich-text-lexical" data-field-path="body"><div contenteditable="true"></div></div>`
    expect(findFieldElement('team.1.name')?.tagName).toBe('INPUT')
    expect(findFieldElement('body')?.getAttribute('data-field-path')).toBe('body')
    expect(findFieldElement('nope')).toBeNull()
  })

  it('focuses the input first, else a control; also next to the id element (uploads)', async () => {
    document.body.innerHTML = `
      <div class="field-type relationship"><div id="field-phases"><button>chip</button><input></div></div>
      <div class="field-type upload"><div id="field-cover__image"></div><a href="/file.jpg">file.jpg</a><button class="edit">edit</button></div>`
    await runFocusPlan({ path: 'phases', steps: [] }, api())
    expect(document.activeElement?.tagName).toBe('INPUT')
    await runFocusPlan({ path: 'cover.image', steps: [] }, api())
    expect(document.activeElement?.className).toBe('edit')
  })

  it('focuses controls that render later, but never steals focus the editor moved meanwhile', async () => {
    // Focus starts on an iframe, like after a click in the Live Preview
    document.body.insertAdjacentHTML('afterbegin', '<iframe></iframe>')
    document.body.insertAdjacentHTML('beforeend', `<div id="field-a" class="field-type upload"></div><div id="field-b" class="field-type upload"></div><input id="other">`)
    document.querySelector('iframe')!.focus()
    await runFocusPlan({ path: 'a', steps: [] }, api())
    document.getElementById('field-a')!.insertAdjacentHTML('beforeend', '<button class="edit-a">edit</button>')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(document.activeElement?.className).toBe('edit-a')

    ;(document.activeElement as HTMLElement).blur()
    await runFocusPlan({ path: 'b', steps: [] }, api())
    ;(document.getElementById('other') as HTMLInputElement).focus() // the editor clicks elsewhere
    document.getElementById('field-b')!.insertAdjacentHTML('beforeend', '<button class="edit-b">edit</button>')
    await new Promise((resolve) => setTimeout(resolve, 0))
    expect(document.activeElement?.id).toBe('other')
  })

  it('ancestorPaths: deepest first', () => {
    expect(ancestorPaths('hero.sub.text')).toEqual(['hero.sub', 'hero'])
    expect(ancestorPaths('title')).toEqual([])
  })

  describe('revealElement: fields Payload renders only near the viewport', () => {
    const find = () => document.getElementById('field-hero__sub__text')
    // jsdom has no scrollingElement
    const scrollingElement = (value: object) =>
      Object.defineProperty(document, 'scrollingElement', { configurable: true, get: () => value })
    afterEach(() => {
      delete (document as { scrollingElement?: unknown }).scrollingElement
      vi.restoreAllMocks()
    })
    const lazyChild = (parent: Element) =>
      parent.insertAdjacentHTML('beforeend', '<div class="field-type"><input id="field-hero__sub__text"></div>')

    it('scrolls the nearest rendered ancestor into view, then finds the field', async () => {
      document.body.innerHTML = '<div id="field-hero" class="field-type"></div>'
      const hero = document.getElementById('field-hero')!
      hero.scrollIntoView = vi.fn(() => lazyChild(hero))
      expect(await revealElement(find, { ancestors: ancestorPaths('hero.sub.text') })).toBe(find())
      expect(hero.scrollIntoView).toHaveBeenCalledWith({ block: 'start' })
    })

    it('without an ancestor: scrolls down a screen at a time until it renders', async () => {
      document.body.innerHTML = '<div id="list"></div>'
      let top = 0
      scrollingElement({ get scrollTop() { return top } })
      const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {
        top += 800
        if (top >= 2400) lazyChild(document.getElementById('list')!)
      })
      expect(await revealElement(find)).toBe(find())
      expect(scrollBy).toHaveBeenCalledTimes(3)
    })

    it('stops at the end of the page and gives up', async () => {
      document.body.innerHTML = ''
      scrollingElement({ scrollTop: 0 })
      const scrollBy = vi.spyOn(window, 'scrollBy').mockImplementation(() => {})
      expect(await revealElement(find, { timeout: 1000 })).toBeNull()
      expect(scrollBy).toHaveBeenCalledTimes(1)
    })
  })

  it('tabsInScope skips tabs nested in other tabs and in array rows', () => {
    const outer = tabsField('outer', [['<div class="tabs-field" data-test="inner"></div>']])
    const array = document.createElement('div')
    array.className = 'array-field'
    array.append(tabsField('in-row', [['']]))
    const second = tabsField('second', [['']])
    document.body.append(outer, array, second)
    expect(tabsInScope(document.body).map((t) => (t as HTMLElement).dataset.test)).toEqual(['outer', 'second'])
    expect(tabsInScope(outer).map((t) => (t as HTMLElement).dataset.test)).toEqual(['inner'])
  })
})

describe('runFocusPlan', () => {
  it('opens the tab, waits for it to render, then focuses and highlights the field', async () => {
    document.body.append(tabsField('main', [[input('title')], [input('seo.metaTitle')]]))
    const animate = vi.fn()
    Element.prototype.animate = animate as never

    const done = await runFocusPlan({ path: 'seo.metaTitle', steps: [{ type: 'tab', ordinal: 0, index: 1 }] }, api())
    expect(done).toBe(true)
    expect(document.activeElement?.id).toBe('field-seo__metaTitle')
    expect(animate).toHaveBeenCalledTimes(1)
    expect(document.querySelectorAll('.tabs-field__tab-button')[1]!.className).toContain('--active')
  })

  it('does not click a tab that is already open', async () => {
    document.body.append(tabsField('main', [[input('title')], ['']]))
    const click = vi.spyOn(HTMLElement.prototype, 'click')
    await runFocusPlan({ path: 'title', steps: [{ type: 'tab', ordinal: 0, index: 0 }] }, api())
    expect(click).not.toHaveBeenCalled()
    expect(document.activeElement?.id).toBe('field-title')
  })

  it('nested tabs: the second step looks inside the first tabs field', async () => {
    const inner = tabsField('inner', [[''], [input('c')]])
    const outer = tabsField('outer', [[''], ['<span></span>']])
    document.body.append(outer)
    // When the outer tab opens, it renders the inner tabs field
    outer.querySelectorAll('button')[1]!.addEventListener('click', () =>
      setTimeout(() => outer.lastElementChild!.replaceChildren(inner), 20),
    )
    const done = await runFocusPlan(
      { path: 'c', steps: [{ type: 'tab', ordinal: 0, index: 1 }, { type: 'tab', ordinal: 0, index: 1 }] },
      api(),
    )
    expect(done).toBe(true)
    expect(document.activeElement?.id).toBe('field-c')
  })

  it('expands collapsed rows through form state and saves the preference', async () => {
    document.body.innerHTML = input('team.1.name')
    const form = api({ team: [{ id: 'a', collapsed: true }, { id: 'b', collapsed: true }] })
    await runFocusPlan({ path: 'team.1.name', steps: [{ type: 'row', path: 'team', index: 1 }] }, form)
    expect(form.dispatchFields).toHaveBeenCalledWith({
      type: 'SET_ROW_COLLAPSED',
      path: 'team',
      updatedRows: [{ id: 'a', collapsed: true }, { id: 'b', collapsed: false }],
    })
    expect(form.setDocFieldPreferences).toHaveBeenCalledWith('team', { collapsed: ['a'] })
  })

  it('leaves open rows alone', () => {
    const form = api({ team: [{ id: 'a', collapsed: false }] })
    expandRow(form, 'team', 0)
    expandRow(form, 'nope', 0)
    expect(form.dispatchFields).not.toHaveBeenCalled()
  })

  it('gives up quietly when a tab or the field never shows up', async () => {
    vi.useFakeTimers()
    try {
      const missingTabs = runFocusPlan({ path: 'x', steps: [{ type: 'tab', ordinal: 3, index: 0 }] }, api())
      const missingField = runFocusPlan({ path: 'x', steps: [] }, api())
      await vi.advanceTimersByTimeAsync(3000)
      await expect(missingTabs).resolves.toBe(false)
      await expect(missingField).resolves.toBe(false)
    } finally {
      vi.useRealTimers()
    }
  })

  it('skips tab steps it cannot locate (tabs in array rows) and still tries the field', async () => {
    document.body.innerHTML = input('items.0.x')
    expect(await runFocusPlan({ path: 'items.0.x', steps: [{ type: 'tab', ordinal: null, index: 1 }] }, api())).toBe(true)
  })
})
