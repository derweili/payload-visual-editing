<script setup lang="ts">
/**
 * Interactive demo: a Payload-style form next to a live preview. On autoplay a cursor clicks
 * fields in the preview and the form opens them; visitors can click and type themselves.
 * Hovering or focusing the demo pauses the autoplay; reduced motion turns it off.
 */
import { ChevronDown, ChevronRight, MousePointer2, Pause, Pencil, Play } from 'lucide-vue-next'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

type Field = 'title' | 'team.0.name' | 'team.1.name' | 'team.2.name'
const sequence: Field[] = ['team.1.name', 'title', 'team.2.name']
const initialNames = ['Mara Klein', 'Jonas Weber', 'Lea Hoffmann']

// The shadcn ghost button from the Lovable design, with each variant's overrides already merged.
const BTN =
  'inline-flex items-center gap-2 cursor-pointer transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'
const EDITABLE = `${BTN} demo-editable group relative h-auto min-w-0 justify-center whitespace-normal rounded-sm p-0 text-left font-semibold hover:bg-transparent hover:text-accent-foreground`
const ICON_BTN = `${BTN} h-9 w-9 justify-center whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground`
const TAB_BTN = `${BTN} -mb-px h-9 justify-center whitespace-nowrap rounded-none border-b-2 px-0 py-2 text-sm font-medium hover:bg-transparent hover:text-accent-foreground`
const ROW_BTN = `${BTN} h-10 w-full justify-start whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground`

const selected = ref<Field>('title')
const target = ref<Field>('team.1.name')
const phase = ref(0)
const playing = ref(true)
const hovering = ref(false)
const reducedMotion = ref(false)
const names = ref([...initialNames])
const headline = ref('Design that moves your business forward.')
const cursor = ref({ left: 0, top: 0 })
const preview = ref<HTMLDivElement | null>(null)
let input: HTMLInputElement | null = null
const setInput = (el: unknown) => {
  input = (el as HTMLInputElement | null) ?? null
}
let manualFocus = false

const running = computed(() => playing.value && !hovering.value && !reducedMotion.value)
const teamIndex = computed(() => (selected.value === 'title' ? -1 : Number(selected.value.split('.')[1])))
const showPause = computed(() => playing.value && !reducedMotion.value)

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')

const nameLabel = (field: Field) =>
  field === 'title' ? 'Edit preview headline' : `Edit ${names.value[Number(field.split('.')[1])]} name`

const choose = (field: Field) => {
  manualFocus = true
  playing.value = false
  selected.value = field
  // A repeated click on the already selected field still focuses its input.
  input?.focus({ preventScroll: true })
}

const togglePlay = () => {
  const wasReduced = reducedMotion.value
  reducedMotion.value = false
  playing.value = !playing.value || wasReduced
}

const updateCursor = () => {
  const panel = preview.value
  if (!panel) return
  const element = panel.querySelector<HTMLElement>(`[data-field="${target.value}"]`)
  if (!element) return
  const rect = element.getBoundingClientRect()
  const parent = panel.getBoundingClientRect()
  cursor.value = {
    left: rect.left - parent.left + rect.width * 0.65,
    top: rect.top - parent.top + rect.height * 0.65,
  }
}

const stops: Array<() => void> = []

// Browser-only: timers, media queries and measuring must not run during pre-rendering.
onMounted(() => {
  const media = window.matchMedia('(prefers-reduced-motion: reduce)')
  const onMedia = () => (reducedMotion.value = media.matches)
  onMedia()
  media.addEventListener('change', onMedia)
  stops.push(() => media.removeEventListener('change', onMedia))

  // Autoplay: hover the target, click it, open the field, pause, next.
  stops.push(
    watch(
      running,
      (isRunning, _, onCleanup) => {
        if (!isRunning) return
        let next = 0
        let timers: ReturnType<typeof setTimeout>[] = []
        const cycle = () => {
          const field = sequence[next % sequence.length]
          if (!field) return
          target.value = field
          phase.value = 0
          timers = [
            setTimeout(() => (phase.value = 1), 850),
            setTimeout(() => (phase.value = 2), 1450),
            setTimeout(() => {
              selected.value = field
              phase.value = 3
            }, 1750),
            setTimeout(() => {
              next += 1
              cycle()
            }, 4300),
          ]
        }
        cycle()
        onCleanup(() => timers.forEach(clearTimeout))
      },
      { immediate: true },
    ),
  )

  const observer = new ResizeObserver(updateCursor)
  if (preview.value) observer.observe(preview.value)
  stops.push(() => observer.disconnect())
  stops.push(watch([target, headline, names], () => nextTick(updateCursor), { deep: true }))
  updateCursor()

  stops.push(
    watch(
      [selected, playing],
      () => {
        if (!manualFocus) return
        input?.focus({ preventScroll: true })
        manualFocus = false
      },
      { flush: 'post' },
    ),
  )
})

onUnmounted(() => stops.forEach((stop) => stop()))
</script>

<template>
  <div
    class="mt-16 overflow-hidden rounded-lg border border-border bg-card shadow-2xl shadow-foreground/10"
    aria-label="Interactive visual editing demo"
  >
    <div class="flex min-h-12 items-center gap-2 border-b border-border px-3 sm:px-4">
      <div class="hidden gap-1.5 sm:flex" aria-hidden="true">
        <span v-for="dot in 3" :key="dot" class="size-2 rounded-full bg-border" />
      </div>
      <span
        class="min-w-0 flex-1 truncate font-mono text-[10px] text-muted-foreground sm:ml-3 sm:text-xs"
        data-testid="demo-path"
        >/admin/collections/pages/1?field={{ selected }}</span
      >
      <span class="hidden font-mono text-[10px] text-muted-foreground sm:block">Demo</span>
      <button
        type="button"
        :class="ICON_BTN"
        :aria-label="showPause ? 'Pause demo' : 'Play demo'"
        :title="showPause ? 'Pause demo' : 'Play demo'"
        @click="togglePlay"
      >
        <Pause v-if="showPause" />
        <Play v-else />
      </button>
    </div>
    <div
      class="grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
      @focusin="playing = false"
    >
      <!-- the Payload form -->
      <div class="min-w-0 border-b border-border bg-muted/50 p-5 md:border-r md:border-b-0">
        <div class="flex gap-4 border-b border-border" role="tablist" aria-label="CMS sections">
          <button
            v-for="tab in ['Hero', 'Team'] as const"
            :key="tab"
            type="button"
            role="tab"
            :aria-selected="tab === 'Hero' ? selected === 'title' : selected !== 'title'"
            :class="[
              TAB_BTN,
              (tab === 'Hero' ? selected === 'title' : selected !== 'title')
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground',
            ]"
            @click="choose(tab === 'Hero' ? 'title' : 'team.1.name')"
          >
            {{ tab }}
          </button>
        </div>
        <div class="mt-5 min-h-56" :aria-live="running ? 'off' : 'polite'">
          <p class="mb-3 font-mono text-[10px] text-muted-foreground uppercase">
            {{ selected === 'title' ? 'Hero' : 'Team · 3 rows' }}
          </p>
          <div v-if="selected === 'title'" key="hero" class="demo-field-enter rounded-md border border-primary/60 bg-card p-3">
            <label for="demo-input" class="block text-xs text-muted-foreground">Headline</label>
            <input
              id="demo-input"
              :ref="setInput"
              v-model="headline"
              aria-label="CMS headline"
              class="mt-2 w-full min-w-0 rounded-sm border-2 border-primary bg-background px-3 py-2 text-sm text-foreground outline-none"
            />
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(name, index) in names"
              :key="index"
              :class="['rounded-md border bg-card', teamIndex === index ? 'demo-field-enter border-primary/60' : 'border-border']"
            >
              <button
                type="button"
                :class="ROW_BTN"
                :aria-expanded="teamIndex === index"
                @click="choose(`team.${index}.name` as Field)"
              >
                <ChevronDown v-if="teamIndex === index" class="text-primary" />
                <ChevronRight v-else class="text-muted-foreground" />
                <span class="font-mono text-[10px] text-muted-foreground">0{{ index + 1 }}</span>
                <span class="truncate">{{ name || 'Untitled' }}</span>
              </button>
              <div v-if="teamIndex === index" class="px-3 pb-3">
                <label for="demo-input" class="block text-xs text-muted-foreground">Name</label>
                <input
                  id="demo-input"
                  :ref="setInput"
                  v-model="names[index]"
                  aria-label="CMS team member name"
                  class="mt-1 w-full min-w-0 rounded-sm border-2 border-primary bg-background px-3 py-2 text-sm text-foreground outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- the live preview -->
      <div ref="preview" class="relative min-w-0 p-6 sm:p-10">
        <p class="font-mono text-[10px] text-muted-foreground uppercase sm:text-xs">Live Preview · same tab</p>
        <div class="mt-4 min-h-24">
          <button
            type="button"
            data-field="title"
            :aria-label="nameLabel('title')"
            :class="[EDITABLE, 'text-2xl leading-tight sm:text-3xl', running && target === 'title' && phase >= 1 && 'demo-target']"
            @click="choose('title')"
          >
            {{ headline || 'Untitled' }}
            <span
              aria-hidden="true"
              class="demo-edit-tag absolute -top-5 -right-1 flex items-center gap-1 rounded-sm bg-primary px-1.5 py-1 font-mono text-[10px] leading-none font-medium text-primary-foreground"
              ><Pencil class="size-2.5!" /> Edit</span
            >
          </button>
        </div>
        <div class="mt-5 grid grid-cols-3 gap-3 sm:gap-6">
          <div v-for="(name, index) in names" :key="index" class="min-w-0">
            <div
              class="flex aspect-square items-center justify-center rounded-md bg-muted font-mono text-2xl text-muted-foreground/40"
              aria-hidden="true"
            >
              {{ initials(initialNames[index] ?? '') }}
            </div>
            <div class="mt-6 mb-2 min-h-10">
              <button
                type="button"
                :data-field="`team.${index}.name`"
                :aria-label="nameLabel(`team.${index}.name` as Field)"
                :class="[
                  EDITABLE,
                  'text-sm leading-snug',
                  running && target === `team.${index}.name` && phase >= 1 && 'demo-target',
                ]"
                @click="choose(`team.${index}.name` as Field)"
              >
                {{ name || 'Untitled' }}
                <span
                  aria-hidden="true"
                  class="demo-edit-tag absolute -top-5 -right-1 flex items-center gap-1 rounded-sm bg-primary px-1.5 py-1 font-mono text-[10px] leading-none font-medium text-primary-foreground"
                  ><Pencil class="size-2.5!" /> Edit</span
                >
              </button>
            </div>
            <div class="text-xs text-muted-foreground">Team</div>
          </div>
        </div>
        <div
          aria-hidden="true"
          :class="['demo-cursor pointer-events-none absolute z-10 text-foreground', !running && 'opacity-0']"
          :style="{ left: `${cursor.left}px`, top: `${cursor.top}px` }"
        >
          <span v-if="phase === 2" class="demo-click absolute -top-3 -left-3 size-7 rounded-full border-2 border-primary" />
          <MousePointer2 :class="['size-6 fill-foreground stroke-background', phase === 2 && 'scale-90']" />
        </div>
      </div>
    </div>
  </div>
</template>
