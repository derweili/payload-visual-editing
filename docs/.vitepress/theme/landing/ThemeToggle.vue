<script setup lang="ts">
import { Moon, Sun } from 'lucide-vue-next'
import { useAppearanceToggle } from '../appearance'

// Same toggle as the docs nav: VitePress owns the `.dark` class and remembers the choice.
const toggle = useAppearanceToggle()
</script>

<template>
  <button
    type="button"
    aria-label="Toggle dark mode"
    class="inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    @click="toggle"
  >
    <Sun class="hidden size-4 dark:block" />
    <Moon class="size-4 dark:hidden" />
  </button>
</template>
