<script setup lang="ts">
import { computed, ref } from 'vue'
import CopyButton from './CopyButton.vue'

const tabs = [
  {
    label: 'Install',
    code: `pnpm add @derweili/payload-visual-editing \\
  @derweili/payload-visual-editing-overlay`,
  },
  {
    label: 'payload.config.ts',
    code: `import { buildConfig } from 'payload'
import { visualEditingPlugin } from '@derweili/payload-visual-editing/server'

export default buildConfig({
  // …
  plugins: [
    visualEditingPlugin({
      collections: ['pages', 'posts'],
      globals: ['header'],
    }),
  ],
})`,
  },
  {
    label: 'Read drafts',
    code: `const { isEnabled: draft } = await draftMode()

const page = await payload.findByID({
  collection: 'pages',
  id,
  draft,
  context: draft ? { encodeSourceMaps: true } : {},
})`,
  },
  {
    label: 'layout.tsx',
    code: `import { draftMode } from 'next/headers'
import { VisualEditing } from '@derweili/payload-visual-editing-overlay/react'

export default async function Layout({ children }) {
  const { isEnabled: draft } = await draftMode()
  return (
    <html lang="en">
      <body>
        {children}
        {draft && <VisualEditing label="Edit" />}
      </body>
    </html>
  )
}`,
  },
]

const active = ref(0)
const tab = computed(() => tabs[active.value] ?? tabs[0]!)
</script>

<template>
  <div
    class="overflow-hidden rounded-xl border border-border bg-code text-code-foreground shadow-2xl shadow-foreground/10"
  >
    <div role="tablist" class="flex overflow-x-auto border-b border-code-foreground/10">
      <button
        v-for="(t, i) in tabs"
        :key="t.label"
        role="tab"
        type="button"
        :aria-selected="i === active"
        :class="[
          'shrink-0 cursor-pointer border-b-2 px-4 py-3 font-mono text-xs transition-colors',
          i === active
            ? 'border-primary text-code-foreground'
            : 'border-transparent text-code-foreground/50 hover:text-code-foreground/80',
        ]"
        @click="active = i"
      >
        <span class="mr-1.5 text-primary">{{ i + 1 }}</span>{{ t.label }}
      </button>
    </div>
    <div class="flex items-start justify-between gap-2 p-4 sm:p-5">
      <pre class="min-h-[15rem] min-w-0 overflow-x-auto font-mono text-[13px] leading-relaxed"><code>{{ tab.code }}</code></pre>
      <CopyButton :text="tab.code" />
    </div>
  </div>
</template>
