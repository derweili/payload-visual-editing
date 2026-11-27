import {
  createReadyMessage,
  decodeRef,
  encodeRef,
  isFocusMessage,
  isReadyMessage,
  stegaEncode,
} from '@derweili/payload-visual-editing-core'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createOverlay, OVERLAY_ATTR, type Overlay } from './overlay.ts'

const ADMIN = 'http://localhost:3000'
const titleRef = encodeRef({ collection: 'projects', id: 1, path: 'title' })
const title = stegaEncode('Wohnhaus', titleRef, { skip: false })
const claim = stegaEncode('Planung', encodeRef({ global: 'homepage', path: 'hero.claim' }), { skip: false })

let overlay: Overlay | undefined
afterEach(() => {
  overlay?.destroy()
  overlay = undefined
  vi.useRealTimers()
  vi.restoreAllMocks()
})

const hover = (element: Element) => element.dispatchEvent(new Event('pointerover', { bubbles: true }))
const ui = (doc: Document = document) => {
  const layer = doc.querySelector(`[${OVERLAY_ATTR}]`)!
  const [outline, button] = layer.children as unknown as [HTMLElement, HTMLButtonElement]
  return { layer, outline, button }
}

describe('standalone (not in an iframe)', () => {
  beforeEach(() => {
    document.body.innerHTML = `<main><h1>${title}</h1><p>plain</p></main>`
  })

  it('outlines editable content on hover and hides it a moment after the pointer leaves', async () => {
    vi.useFakeTimers()
    overlay = createOverlay({ serverURL: ADMIN, label: 'Bearbeiten' })
    const { outline, button } = ui()
    expect(button.textContent).toBe('Bearbeiten')
    expect(outline.style.display).toBe('none')

    hover(document.querySelector('h1')!)
    expect(outline.style.display).toBe('block')
    expect(button.style.display).toBe('block')

    hover(document.querySelector('p')!)
    await vi.advanceTimersByTimeAsync(399)
    expect(outline.style.display).toBe('block')
    await vi.advanceTimersByTimeAsync(1)
    expect(outline.style.display).toBe('none')
    expect(button.style.display).toBe('none')
  })

  it('the pointer can cross a gap on its way to the button', async () => {
    vi.useFakeTimers()
    overlay = createOverlay({ serverURL: ADMIN })
    const { outline, button } = ui()
    hover(document.querySelector('h1')!)
    hover(document.querySelector('p')!) // between the content and the button
    await vi.advanceTimersByTimeAsync(200)
    hover(button)
    await vi.advanceTimersByTimeAsync(1000)
    expect(outline.style.display).toBe('block')
    expect(button.style.display).toBe('block')
  })

  describe('button placement', () => {
    const BUTTON = { width: 80, height: 22 }
    const layout = (rect: { top: number; left: number; width: number; height: number }, viewportWidth = 1000) => {
      const h1 = document.querySelector('h1')!
      vi.spyOn(h1, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ x: rect.left, y: rect.top, width: rect.width, height: rect.height }),
      )
      vi.spyOn(document.documentElement, 'clientWidth', 'get').mockReturnValue(viewportWidth)
      // jsdom has no layout: a hidden button measures 0 × 0, a visible one the given size
      for (const [prop, size] of [['offsetWidth', BUTTON.width], ['offsetHeight', BUTTON.height]] as const) {
        vi.spyOn(HTMLElement.prototype, prop, 'get').mockImplementation(function (this: HTMLElement) {
          return this.style.display === 'none' ? 0 : size
        })
      }
      overlay = createOverlay({ serverURL: ADMIN })
      hover(h1)
      const { button, outline } = ui()
      return {
        top: parseFloat(button.style.top),
        left: parseFloat(button.style.left),
        buttonRadius: button.style.borderRadius,
        cornerRadius: outline.style.borderTopRightRadius,
      }
    }

    it('sits flush on the outline, right-aligned', () => {
      // Outline: 96..804 × 196..264
      expect(layout({ top: 200, left: 100, width: 700, height: 60 })).toEqual({
        top: 196 - 22,
        left: 804 - 80,
        // Square where button and outline meet
        buttonRadius: '3px 3px 0 0',
        cornerRadius: '0',
      })
    })

    it('stays inside the viewport when the content is wider than it', () => {
      const placed = layout({ top: 200, left: 30, width: 760, height: 40 }, 742)
      expect(placed.left).toBe(742 - 80 - 4)
      expect(placed.cornerRadius).toBe('3px') // not on the corner: the corner stays round
    })

    it('goes inside the outline when there is no room above', () => {
      const placed = layout({ top: 6, left: 100, width: 300, height: 40 })
      expect(placed.top).toBe(2)
      expect(placed.buttonRadius).toBe('0 0 0 3px')
      expect(placed.cornerRadius).toBe('0')
    })
  })

  it('opens the deep link in a new tab by default', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    overlay = createOverlay({ serverURL: ADMIN })
    hover(document.querySelector('h1')!)
    ui().button.click()
    expect(open).toHaveBeenCalledWith(`${ADMIN}/admin/collections/projects/1?field=title`, '_blank', 'noopener')
  })

  it('alt-click on content opens it too, and the click goes no further', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const onClick = vi.fn()
    document.body.addEventListener('click', onClick)
    overlay = createOverlay({ serverURL: ADMIN, adminRoute: '/cms' })

    document.querySelector('h1')!.dispatchEvent(new MouseEvent('click', { bubbles: true, altKey: true }))
    expect(open).toHaveBeenCalledWith(`${ADMIN}/cms/collections/projects/1?field=title`, '_blank', 'noopener')
    expect(onClick).not.toHaveBeenCalled()

    document.querySelector('h1')!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(open).toHaveBeenCalledTimes(1)
    expect(onClick).toHaveBeenCalledTimes(1)
    document.body.removeEventListener('click', onClick)
  })

  it("openIn: 'same-tab' navigates this tab", async () => {
    const assign = vi.fn()
    vi.spyOn(window, 'location', 'get').mockReturnValue({ ...window.location, origin: ADMIN, assign })
    overlay = createOverlay({ openIn: 'same-tab' })
    await overlay.edit(titleRef)
    expect(assign).toHaveBeenCalledWith(`${ADMIN}/admin/collections/projects/1?field=title`)
  })

  it('finds content added later (Live Preview refresh)', async () => {
    vi.useFakeTimers()
    overlay = createOverlay({ serverURL: ADMIN })
    const span = document.createElement('span')
    span.textContent = claim
    document.querySelector('main')!.append(span)
    await vi.advanceTimersByTimeAsync(0) // MutationObserver callback
    hover(span)
    expect(ui().outline.style.display).toBe('none') // not rescanned yet: throttled
    await vi.advanceTimersByTimeAsync(100)
    hover(span)
    expect(ui().outline.style.display).toBe('block')
  })

  it('hides the outline when its element disappears', async () => {
    vi.useFakeTimers()
    overlay = createOverlay({ serverURL: ADMIN })
    hover(document.querySelector('h1')!)
    document.querySelector('h1')!.remove()
    await vi.advanceTimersByTimeAsync(100)
    expect(ui().outline.style.display).toBe('none')
  })

  it('destroy removes the UI and stops listening', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    createOverlay({ serverURL: ADMIN }).destroy()
    expect(document.querySelector(`[${OVERLAY_ATTR}]`)).toBeNull()
    document.querySelector('h1')!.dispatchEvent(new MouseEvent('click', { bubbles: true, altKey: true }))
    expect(open).not.toHaveBeenCalled()
  })
})

describe('inside the Live Preview iframe', () => {
  let frame: HTMLIFrameElement
  let child: Window & typeof globalThis
  let toParent: ReturnType<typeof vi.fn>

  beforeEach(() => {
    frame = document.createElement('iframe')
    document.body.append(frame)
    child = frame.contentWindow as Window & typeof globalThis
    child.document.body.innerHTML = `<h1>${title}</h1>`
    toParent = vi.fn()
    // jsdom's `parent` is the outer window's proxy, not the test's `window` object
    vi.spyOn(child.parent, 'postMessage').mockImplementation(toParent as never)
  })
  afterEach(() => frame.remove())

  /** A message from the admin (the parent window) to the iframe. */
  const fromAdmin = (data: unknown, origin = ADMIN, source: Window = child.parent) =>
    child.dispatchEvent(new child.MessageEvent('message', { data, origin, source }))

  const sent = () => toParent.mock.calls.map(([data, origin]) => ({ data, origin }))

  it('says hello to the admin on start', () => {
    overlay = createOverlay({ root: child.document.body, serverURL: ADMIN })
    expect(sent()).toEqual([{ data: createReadyMessage(), origin: ADMIN }])
  })

  it('after the handshake, a click sends pve:focus to the admin and opens nothing', async () => {
    const open = vi.spyOn(child, 'open').mockReturnValue(null)
    overlay = createOverlay({ root: child.document.body, serverURL: ADMIN })
    fromAdmin(createReadyMessage())
    await overlay.edit(titleRef)
    const focus = sent().find(({ data }) => isFocusMessage(data))!
    expect(focus.origin).toBe(ADMIN)
    expect(decodeRef((focus.data as { ref: never }).ref)).toEqual({ collection: 'projects', id: 1, path: 'title' })
    expect(open).not.toHaveBeenCalled()
  })

  it('without an answer it falls back to the deep link after the timeout', async () => {
    vi.useFakeTimers()
    const open = vi.spyOn(child, 'open').mockReturnValue(null)
    overlay = createOverlay({ root: child.document.body, serverURL: ADMIN })
    const editing = overlay.edit(titleRef)
    expect(sent().filter(({ data }) => isReadyMessage(data))).toHaveLength(2) // start + retry on click
    await vi.advanceTimersByTimeAsync(499)
    expect(open).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(1)
    await editing
    expect(open).toHaveBeenCalledWith(`${ADMIN}/admin/collections/projects/1?field=title`, '_blank', 'noopener')
    expect(sent().some(({ data }) => isFocusMessage(data))).toBe(false)
  })

  it('a late answer within the timeout still focuses', async () => {
    vi.useFakeTimers()
    const open = vi.spyOn(child, 'open').mockReturnValue(null)
    overlay = createOverlay({ root: child.document.body, serverURL: ADMIN })
    const editing = overlay.edit(titleRef)
    await vi.advanceTimersByTimeAsync(200)
    fromAdmin(createReadyMessage())
    await editing
    expect(sent().some(({ data }) => isFocusMessage(data))).toBe(true)
    expect(open).not.toHaveBeenCalled()
  })

  it('ignores answers from another origin, another window or with another shape', async () => {
    vi.useFakeTimers()
    const open = vi.spyOn(child, 'open').mockReturnValue(null)
    overlay = createOverlay({ root: child.document.body, serverURL: ADMIN })
    fromAdmin(createReadyMessage(), 'https://evil.example')
    fromAdmin(createReadyMessage(), ADMIN, child)
    fromAdmin({ type: 'pve:ready', v: 99 })
    fromAdmin({ type: 'payload-live-preview', data: {} })
    const editing = overlay.edit(titleRef)
    await vi.advanceTimersByTimeAsync(500)
    await editing
    expect(open).toHaveBeenCalledTimes(1)
    expect(sent().some(({ data }) => isFocusMessage(data))).toBe(false)
  })

  it('the fallback opens a new tab even with openIn: same-tab', async () => {
    vi.useFakeTimers()
    const open = vi.spyOn(child, 'open').mockReturnValue(null)
    overlay = createOverlay({ root: child.document.body, serverURL: ADMIN, openIn: 'same-tab', handshakeTimeout: 50 })
    const editing = overlay.edit(titleRef)
    await vi.advanceTimersByTimeAsync(50)
    await editing
    expect(open).toHaveBeenCalledTimes(1)
  })
})
