<script setup lang="ts">
import { computed, ref } from 'vue'
import { data } from './code.data'
import CodeLines from './CodeLines.vue'
import CopyButton from './CopyButton.vue'
import { setupTabs } from './snippets'

const tabs = setupTabs
const active = ref(0)
const tab = computed(() => tabs[active.value] ?? tabs[0]!)
const lines = computed(() => data.setup[active.value] ?? data.setup[0]!)
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
          'relative shrink-0 cursor-pointer px-4 py-3 font-mono text-xs transition-colors',
          i === active ? 'text-code-foreground' : 'text-code-foreground/50 hover:text-code-foreground/80',
        ]"
        @click="active = i"
      >
        <span class="mr-1.5 text-primary">{{ i + 1 }}</span>{{ t.label }}
        <span
          aria-hidden="true"
          :class="['absolute bottom-0 left-0 h-0.5 w-full bg-primary transition-transform', i === active ? 'scale-x-100' : 'scale-x-0']"
        />
      </button>
    </div>
    <div class="flex items-start justify-between gap-2 p-4 sm:p-5">
      <pre class="min-h-[19rem] min-w-0 overflow-x-auto font-mono text-[13px] leading-relaxed"><code><CodeLines :key="active" :lines="lines" animate /></code></pre>
      <CopyButton :text="tab.code" />
    </div>
  </div>
</template>
