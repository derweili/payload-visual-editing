import {
  ancestorPaths,
  findFieldElement,
  focusFieldElement,
  isRendered,
  revealElement,
  selectTab,
  tabsInScope,
} from './dom-adapter.ts'
import type { FocusPlan } from './resolve-focus.ts'

/** The parts of Payload's form and document APIs that focusing needs (all public). */
export interface FocusApi {
  /** `useForm().getField` */
  getField: (path: string) => { rows?: { id: string; collapsed?: boolean; blockType?: string }[]; value?: unknown } | undefined
  /** `useForm().dispatchFields` */
  dispatchFields: (action: { type: 'SET_ROW_COLLAPSED'; path: string; updatedRows: never[] }) => void
  /** `useDocumentInfo().setDocFieldPreferences` */
  setDocFieldPreferences: (path: string, preferences: { collapsed: string[] }) => void
}

/**
 * Expands a collapsed array/blocks row the way Payload's array field does: form state through
 * `SET_ROW_COLLAPSED`, and the user's collapsed rows saved in the document preferences.
 */
export function expandRow(api: FocusApi, path: string, index: number): void {
  const rows = api.getField(path)?.rows
  if (!rows?.[index]?.collapsed) return
  const updatedRows = rows.map((row, i) => (i === index ? { ...row, collapsed: false } : row))
  api.dispatchFields({ type: 'SET_ROW_COLLAPSED', path, updatedRows: updatedRows as never[] })
  api.setDocFieldPreferences(path, { collapsed: updatedRows.filter((row) => row.collapsed).map((row) => row.id) })
}

/** blockType of the block row at `rowPath` (e.g. `layout.2`), from form state. */
export function blockTypeOf(api: FocusApi, rowPath: string): string | undefined {
  const dot = rowPath.lastIndexOf('.')
  const row = api.getField(rowPath.slice(0, dot))?.rows?.[Number(rowPath.slice(dot + 1))]
  if (row?.blockType) return row.blockType
  const value = api.getField(`${rowPath}.blockType`)?.value
  return typeof value === 'string' ? value : undefined
}

/**
 * Runs a focus plan: opens tabs, expands rows, then focuses the field once Payload rendered it.
 * True when the field was focused. Never throws.
 */
export async function runFocusPlan(plan: FocusPlan, api: FocusApi, root: Element = document.body): Promise<boolean> {
  try {
    let scope: Element = root
    for (const step of plan.steps) {
      if (step.type === 'row') {
        expandRow(api, step.path, step.index)
        continue
      }
      // Tabs inside array rows can't be located: focus works only if that tab is already open
      if (step.ordinal === null) continue
      const ordinal = step.ordinal
      const currentScope = scope
      const tabs = await revealElement(() => tabsInScope(currentScope)[ordinal] ?? null, { root })
      if (!tabs) return false
      scope = selectTab(currentScope, ordinal, step.index) ?? tabs
    }
    // Only a rendered field counts: in a row collapsed this session it exists but is hidden until
    // the row opens
    const element = await revealElement(() => {
      const field = findFieldElement(plan.path, root)
      return field && isRendered(field) ? field : null
    }, {
      root,
      ancestors: ancestorPaths(plan.path),
    })
    if (!element) return false
    focusFieldElement(element)
    return true
  } catch {
    return false
  }
}
