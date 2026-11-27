<script setup lang="ts">
/** The signature motif: an element with a dashed outline and an "Edit" tag. */
withDefaults(defineProps<{ label?: string }>(), { label: 'Edit' })
</script>

<template>
  <span class="relative inline-block rounded-sm outline-2 outline-offset-4 outline-dashed outline-primary">
    <slot />
    <span
      class="absolute -top-3.5 -right-3 rounded-sm bg-primary px-1.5 py-0.5 font-mono text-[10px] leading-none font-medium tracking-normal text-primary-foreground"
    >
      ✎ {{ label }}
    </span>
  </span>
</template>
