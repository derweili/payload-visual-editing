// @vitest-environment jsdom
import { createFocusMessage, createReadyMessage, encodeRef, isReadyMessage } from '@derweili/payload-visual-editing-core'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

const PREVIEW = 'http://localhost:3000'
const state = vi.hoisted(() => ({
  doc: { collectionSlug: 'projects' as string | undefined, globalSlug: undefined as string | undefined, id: 7 as number | string | undefined },
  locale: 'de',
  search: '',
  initializing: false,
  iframe: null as HTMLIFrameElement | null,
  push: (_url: string) => {},
}))

vi.mock('@payloadcms/ui', () => ({
  useConfig: () => ({
    config: { routes: { admin: '/admin' }, blocksMap: {} },
    getEntityConfig: () => ({
      fields: [
        { type: 'text', name: 'title' },
        { type: 'tabs', tabs: [{ fields: [] }, { fields: [{ type: 'textarea', name: 'description' }] }] },
      ],
    }),
  }),
  useDocumentInfo: () => ({ ...state.doc, setDocFieldPreferences: () => {} }),
  useForm: () => ({ getField: () => undefined, dispatchFields: () => {} }),
  useFormInitializing: () => state.initializing,
  useLivePreviewContext: () => ({ iframeRef: { current: state.iframe }, popupRef: { current: null } }),
  useLocale: () => ({ code: state.locale }),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: (url: string) => state.push(url) }),
  useSearchParams: () => new URLSearchParams(state.search),
}))

const { VisualEditingAdmin } = await import('./VisualEditingAdmin.tsx')

let root: Root
const mount = async () => {
  const container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  await act(async () => root.render(<VisualEditingAdmin />))
}

/** The form as Payload renders it, reduced to what focusing touches. */
const form = () => {
  document.body.insertAdjacentHTML(
    'beforeend',
    `<div class="field-type"><input id="field-title"></div>
     <div class="field-type tabs-field"><div>
       <button class="tabs-field__tab-button tabs-field__tab-button--active"></button>
       <button class="tabs-field__tab-button"></button></div><div class="content"></div></div>`,
  )
  const [, second] = document.querySelectorAll('.tabs-field__tab-button')
  second!.addEventListener('click', () => {
    document.querySelector('.content')!.innerHTML = '<div class="field-type"><textarea id="field-description"></textarea></div>'
  })
}

const fromPreview = (data: unknown, { origin = PREVIEW, source = state.iframe!.contentWindow } = {}) =>
  act(async () => {
    window.dispatchEvent(new MessageEvent('message', { data, origin, source }))
    await new Promise((resolve) => setTimeout(resolve, 20))
  })

beforeEach(() => {
  Element.prototype.scrollIntoView = vi.fn()
  state.doc = { collectionSlug: 'projects', globalSlug: undefined, id: 7 }
  state.locale = 'de'
  state.search = ''
  state.initializing = false
  state.push = vi.fn()
  state.iframe = document.createElement('iframe')
  state.iframe.src = `${PREVIEW}/pages/home`
  document.body.append(state.iframe)
})
afterEach(async () => {
  await act(async () => root.unmount())
  document.body.innerHTML = ''
})

describe('<VisualEditingAdmin />', () => {
  it('deep link: ?field= opens the tab and focuses the field', async () => {
    form()
    state.search = 'field=description&locale=de'
    await mount()
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)))
    expect(document.activeElement?.id).toBe('field-description')
  })

  it('deep link: waits until Payload has loaded the form (fields are disabled before)', async () => {
    form()
    state.search = 'field=title'
    state.initializing = true
    await mount()
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)))
    expect(document.activeElement?.id).not.toBe('field-title')

    state.initializing = false
    await act(async () => root.render(<VisualEditingAdmin />))
    await act(() => new Promise((resolve) => setTimeout(resolve, 20)))
    expect(document.activeElement?.id).toBe('field-title')
  })

  it('answers pve:ready from the preview iframe', async () => {
    await mount()
    const reply = vi.spyOn(state.iframe!.contentWindow!, 'postMessage')
    await fromPreview(createReadyMessage())
    expect(reply).toHaveBeenCalledWith(createReadyMessage(), PREVIEW)
    expect(isReadyMessage(reply.mock.calls[0]![0])).toBe(true)
  })

  it('pve:focus for this document focuses the field without navigating', async () => {
    form()
    await mount()
    await fromPreview(createFocusMessage(encodeRef({ collection: 'projects', id: 7, path: 'title' })))
    expect(document.activeElement?.id).toBe('field-title')
    expect(state.push).not.toHaveBeenCalled()
  })

  it('pve:focus for another document or locale opens its edit view on the field', async () => {
    await mount()
    await fromPreview(createFocusMessage(encodeRef({ collection: 'projects', id: 8, path: 'title' })))
    await fromPreview(createFocusMessage(encodeRef({ global: 'homepage', path: 'hero.claim' })))
    await fromPreview(createFocusMessage(encodeRef({ collection: 'projects', id: 7, path: 'title', locale: 'en' })))
    expect(vi.mocked(state.push).mock.calls.map(([url]) => url)).toEqual([
      '/admin/collections/projects/8?field=title',
      '/admin/globals/homepage?field=hero.claim',
      '/admin/collections/projects/7?field=title&locale=en',
    ])
  })

  it('ignores messages from other windows, other origins and foreign shapes', async () => {
    form()
    await mount()
    const ref = encodeRef({ collection: 'projects', id: 8, path: 'title' })
    await fromPreview(createFocusMessage(ref), { source: window })
    await fromPreview(createFocusMessage(ref), { origin: 'https://evil.example' })
    await fromPreview({ type: 'pve:focus', v: 99, ref })
    await fromPreview({ type: 'payload-live-preview', data: {} })
    expect(state.push).not.toHaveBeenCalled()
  })
})
