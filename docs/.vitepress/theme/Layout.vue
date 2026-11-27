<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { provide } from 'vue'
import { useAppearanceToggle } from './appearance'

// Replaces the default theme's appearance switch behaviour with the circle transition.
provide('toggle-appearance', useAppearanceToggle())
</script>

<template>
  <DefaultTheme.Layout />
</template>
