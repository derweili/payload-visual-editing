<script setup lang="ts">
import { Check, Copy } from 'lucide-vue-next'
import { ref } from 'vue'

const props = defineProps<{ text: string }>()
const done = ref(false)

const copy = () => {
  // Shell line continuations are joined, so the copied command runs as one line.
  void navigator.clipboard.writeText(props.text.replace(/\\\n\s*/g, ''))
  done.value = true
  setTimeout(() => (done.value = false), 1500)
}
</script>

<template>
  <button
    type="button"
    aria-label="Copy code"
    class="inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-code-foreground/60 transition-colors hover:bg-code-foreground/10 hover:text-code-foreground"
    @click="copy"
  >
    <Check v-if="done" class="size-4" />
    <Copy v-else class="size-4" />
  </button>
</template>
