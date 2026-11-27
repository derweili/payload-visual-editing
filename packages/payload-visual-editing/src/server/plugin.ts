import type { CollectionConfig, Config, GlobalConfig, Plugin } from 'payload'

import { createHooks } from './hooks.ts'
import { resolveSourceMapOptions, type VisualEditingPluginOptions } from './options.ts'

/** Import map path of the admin component that focuses fields (src/client/VisualEditingAdmin.tsx). */
export const ADMIN_COMPONENT = '@derweili/payload-visual-editing/client#VisualEditingAdmin'

type Hooks = ReturnType<typeof createHooks>
type EntityHooks = NonNullable<CollectionConfig['hooks']> | NonNullable<GlobalConfig['hooks']>

/** Adds the plugin's hooks: before the entity's own beforeValidate, after its own afterRead. */
function withHooks<T extends EntityHooks>(own: T | undefined, hooks: Hooks['collection'] | Hooks['global']): T {
  const current = (own ?? {}) as Record<string, unknown[] | undefined>
  return {
    ...current,
    beforeOperation: [...(current.beforeOperation ?? []), hooks.beforeOperation],
    beforeValidate: [hooks.beforeValidate, ...(current.beforeValidate ?? [])],
    // Last, so the encoding sees the document other hooks produced
    afterRead: [...(current.afterRead ?? []), hooks.afterRead],
  } as T
}

/**
 * Payload plugin for visual editing (ADR 0001):
 * - stega source maps on text, textarea and Lexical fields of the configured collections and
 *   globals, switched on per request (M1)
 * - an admin component in their edit views that focuses the field from `?field=` or from a click
 *   in the Live Preview (M3)
 */
export const visualEditingPlugin =
  (options: VisualEditingPluginOptions = {}): Plugin =>
  (config: Config): Config => {
    if (options.enabled === false) return config
    const sourceMaps = resolveSourceMapOptions(options.sourceMaps)
    const focusFields = options.focusFields !== false
    if (!sourceMaps.enabled && !focusFields) return config

    const collections = new Set(options.collections ?? [])
    const globals = new Set(options.globals ?? [])
    assertKnownSlugs('collections', collections, (config.collections ?? []).map((c) => c.slug))
    assertKnownSlugs('globals', globals, (config.globals ?? []).map((g) => g.slug))

    const hooks = sourceMaps.enabled ? createHooks(sourceMaps) : null

    return {
      ...config,
      collections: (config.collections ?? []).map((collection) => {
        if (!collections.has(collection.slug)) return collection
        const admin = collection.admin ?? {}
        return {
          ...collection,
          ...(hooks ? { hooks: withHooks(collection.hooks, hooks.collection) } : {}),
          ...(focusFields
            ? {
                admin: {
                  ...admin,
                  components: {
                    ...admin.components,
                    edit: {
                      ...admin.components?.edit,
                      beforeDocumentControls: [...(admin.components?.edit?.beforeDocumentControls ?? []), ADMIN_COMPONENT],
                    },
                  },
                },
              }
            : {}),
        }
      }),
      globals: (config.globals ?? []).map((global) => {
        if (!globals.has(global.slug)) return global
        const admin = global.admin ?? {}
        return {
          ...global,
          ...(hooks ? { hooks: withHooks(global.hooks, hooks.global) } : {}),
          ...(focusFields
            ? {
                admin: {
                  ...admin,
                  components: {
                    ...admin.components,
                    elements: {
                      ...admin.components?.elements,
                      beforeDocumentControls: [
                        ...(admin.components?.elements?.beforeDocumentControls ?? []),
                        ADMIN_COMPONENT,
                      ],
                    },
                  },
                },
              }
            : {}),
        }
      }),
    }
  }

function assertKnownSlugs(kind: string, wanted: Set<string>, known: string[]) {
  const unknown = [...wanted].filter((slug) => !known.includes(slug))
  if (unknown.length > 0) {
    throw new Error(`visualEditingPlugin: unknown ${kind}: ${unknown.join(', ')}`)
  }
}
