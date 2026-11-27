<script setup lang="ts">
import type { Line } from './code.data'

/** Renders highlighted lines; `animate` slides them in one after another (code tab switch). */
defineProps<{ lines: Line[]; animate?: boolean }>()
</script>

<template>
  <span :class="['block', animate && 'code-swap']"
    ><span v-for="(line, n) in lines" :key="n" class="code-line block" :style="{ '--l': n }"
      ><template v-if="line.length"
        ><span v-for="([text, color], t) in line" :key="t" :style="color ? { color } : undefined">{{ text }}</span></template
      ><template v-else>&nbsp;</template></span
    ></span
  >
</template>
