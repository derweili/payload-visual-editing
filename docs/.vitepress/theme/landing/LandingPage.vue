<script setup lang="ts">
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  Check,
  Github,
  Languages,
  Lock,
  Minus,
  MousePointerClick,
  PanelsTopLeft,
  Type,
} from 'lucide-vue-next'
import Btn from './Btn.vue'
import { data as code } from './code.data'
import CodeLines from './CodeLines.vue'
import Editable from './Editable.vue'
import Eyebrow from './Eyebrow.vue'
import InlineCode from './InlineCode.vue'
import LivePreviewMock from './LivePreviewMock.vue'
import Logo from './Logo.vue'
import SetupSection from './SetupSection.vue'
import ThemeToggle from './ThemeToggle.vue'
import { docs, GITHUB } from './parts'
import { vReveal } from './reveal'

const nav = [
  ['Guide', docs('/guide/getting-started')],
  ['AI agents', docs('/ai/setup')],
  ['Reference', docs('/reference/plugin')],
  ['Architecture', docs('/architecture')],
] as const

const features = [
  {
    icon: MousePointerClick,
    title: 'Click to edit',
    body: 'Hover any content in the preview, click "Edit", and the admin opens the document with the field focused. Tabs open and rows expand on the way.',
  },
  {
    icon: PanelsTopLeft,
    title: 'Works in Live Preview',
    body: "Inside Payload's Live Preview the click focuses the field right next to the page, in the same tab, via a versioned postMessage handshake.",
  },
  {
    icon: Type,
    title: 'Text, images, numbers',
    body: 'Text carries an invisible source map. Images, numbers, selects, dates and relationships carry data attributes via fieldAttrs().',
  },
  {
    icon: Lock,
    title: 'Draft Mode only',
    body: 'Encoding is opt-in per request and only for logged-in drafts. Published pages stay byte-for-byte clean.',
  },
  {
    icon: Languages,
    title: 'Multilingual, tested',
    body: "Works with Payload localization. The click carries the page's locale, so the admin opens the field in that language. Covered by the end-to-end tests.",
  },
  {
    icon: Bot,
    title: 'Agent-ready',
    body: 'Ships agent skills, so Claude Code, Cursor or Codex can set it up — and keep following the rules afterwards.',
  },
]

/** Grid borders between feature cells (1, 2 and 3 columns). */
const featureBorders = (i: number) =>
  [
    i > 0 ? 'border-t sm:border-t-0' : '',
    i >= 2 ? 'sm:border-t' : '',
    i % 2 === 1 ? 'sm:border-l' : '',
    'lg:border-t-0 lg:border-l-0',
    i >= 3 ? 'lg:border-t' : '',
    i % 3 !== 0 ? 'lg:border-l' : '',
  ].join(' ')

const editorSteps = [
  {
    title: 'Open the preview',
    body: 'From the document in Payload, open the preview in its own tab or use Live Preview next to the form.',
  },
  {
    title: 'Click what you want to change',
    body: 'Hover any headline, text, image or number. It gets an outline and an "Edit" button. Click it.',
  },
  {
    title: 'Edit the field',
    body: 'Payload opens the right tab, expands the right row and puts the cursor in the field — in Live Preview, without leaving the page.',
  },
]

// Code for these cards lives in snippets.ts (highlighted at build time).
const hoodSteps = [
  { tag: 'Encode', title: 'Payload adds a source map to draft reads' },
  { tag: 'Detect', title: 'The overlay finds the refs on the page' },
  { tag: 'Focus', title: 'The admin focuses the field' },
]

const notYet = [
  'Inline editing on the page',
  'Drag & drop or adding blocks from the preview',
  'Highlighting in the preview when a field is focused in the admin',
  'Tested frontends other than Next.js (the vanilla overlay is framework-agnostic)',
]
</script>

<template>
  <div class="pve-landing min-h-screen bg-background text-foreground">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-border/70 bg-background/80 backdrop-blur-md">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <a :href="docs('/')" class="flex min-w-0 items-center gap-2.5 font-semibold tracking-tight">
          <Logo />
          <span class="truncate">Visual editing for Payload</span>
        </a>
        <nav class="flex items-center gap-1">
          <a
            v-for="[label, href] in nav"
            :key="label"
            :href="href"
            class="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-primary md:block"
          >
            {{ label }}
          </a>
          <a
            :href="GITHUB"
            aria-label="GitHub"
            class="inline-flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
          >
            <Github class="size-4" />
          </a>
          <ThemeToggle />
        </nav>
      </div>
    </header>

    <main>
      <!-- Hero -->
      <section class="relative overflow-hidden border-b border-border">
        <div class="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div class="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:pt-24">
          <div
            class="pve-intro inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground"
          >
            <span class="size-1.5 rounded-full bg-primary" />
            For Payload 3 + Next.js
          </div>
          <h1 class="pve-intro [--i:1] text-balance mt-8 max-w-4xl text-[2.6rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Stop hunting for fields.
            <span class="block text-muted-foreground">Click the <Editable>page</Editable> instead.</span>
          </h1>
          <p class="pve-intro [--i:2] mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Which tab was it? Which block, which row? Your editors stop guessing. They click any text, image or number on
            the page, and Payload opens the exact field.
          </p>
          <div class="pve-intro [--i:3] mt-10 flex flex-wrap gap-3">
            <Btn :href="docs('/guide/getting-started')">Get started <ArrowRight class="size-4" /></Btn>
            <Btn :href="docs('/ai/setup')" variant="ghost"><Bot class="size-4" /> Set up with AI</Btn>
            <Btn :href="GITHUB" variant="ghost"><Github class="size-4" /> GitHub</Btn>
          </div>
          <LivePreviewMock class="pve-intro [--i:4]" />
        </div>
      </section>

      <!-- Features -->
      <section class="border-b border-border">
        <div class="mx-auto grid max-w-6xl sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(f, i) in features"
            :key="f.title"
            v-reveal="(i % 3) * 90"
            :class="['pve-hover-edit border-border p-8', featureBorders(i)]"
          >
            <span aria-hidden="true" class="pve-hover-tag">✎ Edit</span>
            <component :is="f.icon" class="size-5 text-primary" />
            <h3 class="mt-5 font-semibold">{{ f.title }}</h3>
            <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ f.body }}</p>
          </div>
        </div>
      </section>

      <!-- For editors -->
      <section class="border-b border-border">
        <div class="mx-auto max-w-6xl px-5 py-24">
          <div class="grid gap-6 lg:grid-cols-2 lg:items-end">
            <div v-reveal>
              <Eyebrow>For editors</Eyebrow>
              <h2 class="text-balance mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">See it. Click it. Fix it.</h2>
            </div>
            <p v-reveal="100" class="max-w-md text-muted-foreground lg:justify-self-end">
              No more memorising which tab, block or array row holds a sentence. Start from the page your readers see.
            </p>
          </div>
          <ol class="mt-14 grid gap-4 md:grid-cols-3">
            <li
              v-for="(s, i) in editorSteps"
              :key="s.title"
              v-reveal="i * 110"
              class="pve-hover-edit rounded-xl border border-border bg-card p-6"
            >
              <span aria-hidden="true" class="pve-hover-tag">✎ Edit</span>
              <div class="h-28 rounded-lg border border-border bg-muted/40 p-4">
                <div v-if="i === 0" class="space-y-2">
                  <div class="flex justify-end">
                    <span class="rounded-sm bg-accent px-1.5 py-0.5 font-mono text-[10px] text-accent-foreground">
                      ● Draft Mode
                    </span>
                  </div>
                  <div class="h-3 w-2/3 rounded-sm bg-foreground/80" />
                  <div class="h-2 w-full rounded-sm bg-muted-foreground/25" />
                  <div class="h-2 w-4/5 rounded-sm bg-muted-foreground/25" />
                </div>
                <div v-else-if="i === 1" class="flex h-full items-end pb-1">
                  <span class="text-xl font-semibold"><Editable>Jonas Weber</Editable></span>
                </div>
                <div v-else>
                  <div class="text-xs text-muted-foreground">Name</div>
                  <div class="mt-1 rounded-md border-2 border-primary bg-background px-3 py-2 text-sm">
                    Jonas Weber<span class="animate-pulse text-primary">|</span>
                  </div>
                </div>
              </div>
              <div class="mt-6 font-mono text-xs text-primary">0{{ i + 1 }}</div>
              <h3 class="mt-2 font-semibold">{{ s.title }}</h3>
              <p class="mt-2 text-sm leading-relaxed text-muted-foreground">{{ s.body }}</p>
            </li>
          </ol>
        </div>
      </section>

      <!-- Under the hood -->
      <section class="border-b border-border bg-muted/40">
        <div class="mx-auto max-w-6xl px-5 py-24">
          <div v-reveal>
          <Eyebrow>For developers · Under the hood</Eyebrow>
          <h2 class="text-balance mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Every draft value knows where it came from.
          </h2>
          <p class="mt-6 max-w-xl text-muted-foreground">
            No IDs to wire up by hand. The source travels with the content — from the Payload read to the rendered page
            and back to the admin.
          </p>
          </div>
          <div class="mt-14 grid gap-4 md:grid-cols-3">
            <div v-for="(s, i) in hoodSteps" :key="s.tag" v-reveal="i * 110" class="flex min-w-0 flex-col rounded-xl border border-border bg-card p-6">
              <div class="font-mono text-xs text-primary">{{ i + 1 }} · {{ s.tag }}</div>
              <!-- Code first, at the same height in every card, so the titles below line up. -->
              <pre
                class="mt-4 flex h-28 items-center overflow-x-auto rounded-lg bg-code p-4 font-mono text-xs leading-relaxed text-code-foreground"
              ><code class="block whitespace-pre"><CodeLines :lines="code.hood[i] ?? []" /></code></pre>
              <h3 class="mt-6 font-semibold">{{ s.title }}</h3>
              <p class="mt-3 text-sm leading-relaxed text-muted-foreground">
                <template v-if="i === 0">
                  With <InlineCode>encodeSourceMaps</InlineCode>, the plugin appends an invisible ref to every text value:
                  collection, document, field path and locale. Images, numbers and dates get a source tag you render with
                  <InlineCode>fieldAttrs()</InlineCode>.
                </template>
                <template v-else-if="i === 1">
                  <InlineCode>&lt;VisualEditing /&gt;</InlineCode> decodes the refs in the rendered DOM and draws the
                  outline and the "Edit" button. Only in Draft Mode — published pages carry nothing extra.
                </template>
                <template v-else>
                  Standalone, the button opens a deep link. Inside Live Preview it sends a
                  <InlineCode>postMessage</InlineCode> instead. The admin opens tabs, expands rows and focuses the input.
                </template>
              </p>
            </div>
          </div>
          <a
            :href="docs('/architecture')"
            class="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            Read the architecture <ArrowRight class="size-4" />
          </a>
        </div>
      </section>

      <!-- Setup -->
      <SetupSection />

      <!-- Scope -->
      <section class="border-b border-border">
        <div class="mx-auto max-w-6xl px-5 py-24">
          <div v-reveal>
          <Eyebrow>Scope</Eyebrow>
          <h2 class="text-balance mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Built for real content models.</h2>
          <p class="mt-6 max-w-2xl text-muted-foreground">
            Deep paths through tabs, groups, arrays and blocks, in collections and globals, localized or not. Plus an
            honest list of what it doesn't do yet.
          </p>
          </div>
          <div class="mt-14 grid gap-4 md:grid-cols-2">
            <div v-reveal class="rounded-xl border border-border bg-card p-6 sm:p-8">
              <h3 class="font-semibold">Supported</h3>
              <ul class="mt-6 space-y-4">
                <li class="flex gap-3 text-sm">
                  <Check class="mt-0.5 size-4 shrink-0 text-primary" />
                  <span
                    ><InlineCode>text</InlineCode>, <InlineCode>textarea</InlineCode> and Lexical
                    <InlineCode>richText</InlineCode></span
                  >
                </li>
                <li
                  v-for="item in [
                    'Arrays, groups, named and unnamed tabs, collapsibles, rows, blocks',
                    'Multilingual sites: localized fields in collections and globals, tested end to end',
                    'Images, numbers, relationships, selects and dates via source tags',
                    'Preview in its own tab and Payload\'s Live Preview',
                    'Cloudflare Workers (no Node-only APIs)',
                  ]"
                  :key="item"
                  class="flex gap-3 text-sm"
                >
                  <Check class="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{{ item }}</span>
                </li>
              </ul>
            </div>
            <div v-reveal="110" class="rounded-xl border border-dashed border-border p-6 sm:p-8">
              <h3 class="font-semibold text-muted-foreground">Not (yet)</h3>
              <ul class="mt-6 space-y-4">
                <li v-for="item in notYet" :key="item" class="flex gap-3 text-sm text-muted-foreground">
                  <Minus class="mt-0.5 size-4 shrink-0" />
                  <span>{{ item }}</span>
                </li>
              </ul>
              <a
                :href="docs('/guide/known-limitations')"
                class="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Known limitations <ArrowUpRight class="size-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA + footer -->
      <section>
        <div v-reveal class="mx-auto max-w-6xl px-5 py-24 text-center">
          <h2 class="text-balance mx-auto max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">
            Give your editors the <Editable label="Shortcut">shortcut</Editable>.
          </h2>
          <p class="mt-8 font-mono text-sm text-muted-foreground">
            Open source · MIT · Payload 3.94+ · Next.js 15.4+ or 16 · React 19
          </p>
          <div class="mt-10 flex flex-wrap justify-center gap-3">
            <Btn :href="docs('/guide/getting-started')">Get started <ArrowRight class="size-4" /></Btn>
            <Btn :href="docs('/ai/setup')" variant="ghost"><Bot class="size-4" /> Set up with AI</Btn>
            <Btn :href="GITHUB" variant="ghost"><Github class="size-4" /> Star on GitHub</Btn>
          </div>
        </div>
        <footer class="border-t border-border">
          <div
            class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-8 text-sm text-muted-foreground sm:flex-row"
          >
            <span class="flex items-center gap-2"><Logo /> Visual editing for Payload</span>
            <span>Released under the MIT License.</span>
          </div>
        </footer>
      </section>
    </main>
  </div>
</template>
