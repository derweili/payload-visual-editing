<script setup lang="ts">
withDefaults(defineProps<{ href: string; variant?: 'primary' | 'ghost' }>(), { variant: 'primary' })
</script>

<template>
  <a
    :href="href"
    :class="[
      'inline-flex h-11 items-center justify-center gap-2 rounded-md px-5 text-sm font-medium transition-all',
      variant === 'primary'
        ? 'bg-primary text-primary-foreground hover:brightness-110'
        : 'border border-border bg-card text-foreground hover:bg-muted',
    ]"
  >
    <slot />
  </a>
</template>
