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
import CodeTabs from './CodeTabs.vue'
import CopyButton from './CopyButton.vue'
import Editable from './Editable.vue'
import Eyebrow from './Eyebrow.vue'
import InlineCode from './InlineCode.vue'
import LivePreviewMock from './LivePreviewMock.vue'
import Logo from './Logo.vue'
import ThemeToggle from './ThemeToggle.vue'
import { docs, GITHUB } from './parts'

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

const hoodSteps = [
  {
    tag: 'Encode',
    title: 'Payload adds a source map to draft reads',
    code: `payload.findByID({
  collection: 'pages', id, draft,
  context: { encodeSourceMaps: draft },
})`,
  },
  {
    tag: 'Detect',
    title: 'The overlay finds the refs on the page',
    code: `{draft && <VisualEditing />}`,
  },
  {
    tag: 'Focus',
    title: 'The admin focuses the field',
    code: `/admin/collections/pages/1
  ?field=team.1.name`,
  },
]

const agentCmd = 'npx skills add derweili/payload-visual-editing'

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
            class="hidden rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground md:block"
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
            class="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground"
          >
            <span class="size-1.5 rounded-full bg-primary" />
            For Payload 3 + Next.js
          </div>
          <h1 class="text-balance mt-8 max-w-4xl text-[2.6rem] leading-[1.05] font-semibold tracking-tight sm:text-6xl lg:text-7xl">
            Stop hunting for fields.
            <span class="block text-muted-foreground">Click the <Editable>page</Editable> instead.</span>
          </h1>
          <p class="mt-8 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Which tab was it? Which block, which row? Your editors stop guessing. They click any text, image or number on
            the page, and Payload opens the exact field.
          </p>
          <div class="mt-10 flex flex-wrap gap-3">
            <Btn :href="docs('/guide/getting-started')">Get started <ArrowRight class="size-4" /></Btn>
            <Btn :href="docs('/ai/setup')" variant="ghost"><Bot class="size-4" /> Set up with AI</Btn>
            <Btn :href="GITHUB" variant="ghost"><Github class="size-4" /> GitHub</Btn>
          </div>
          <LivePreviewMock />
        </div>
      </section>

      <!-- Features -->
      <section class="border-b border-border">
        <div class="mx-auto grid max-w-6xl sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="(f, i) in features" :key="f.title" :class="['border-border p-8', featureBorders(i)]">
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
            <div>
              <Eyebrow>For editors</Eyebrow>
              <h2 class="text-balance mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">See it. Click it. Fix it.</h2>
            </div>
            <p class="max-w-md text-muted-foreground lg:justify-self-end">
              No more memorising which tab, block or array row holds a sentence. Start from the page your readers see.
            </p>
          </div>
          <ol class="mt-14 grid gap-4 md:grid-cols-3">
            <li v-for="(s, i) in editorSteps" :key="s.title" class="rounded-xl border border-border bg-card p-6">
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
          <Eyebrow>For developers · Under the hood</Eyebrow>
          <h2 class="text-balance mt-4 max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            Every draft value knows where it came from.
          </h2>
          <p class="mt-6 max-w-xl text-muted-foreground">
            No IDs to wire up by hand. The source travels with the content — from the Payload read to the rendered page
            and back to the admin.
          </p>
          <div class="mt-14 grid gap-4 md:grid-cols-3">
            <div v-for="(s, i) in hoodSteps" :key="s.tag" class="flex min-w-0 flex-col rounded-xl border border-border bg-card p-6">
              <div class="font-mono text-xs text-primary">{{ i + 1 }} · {{ s.tag }}</div>
              <!-- Code first, at the same height in every card, so the titles below line up. -->
              <pre
                class="mt-4 flex h-28 items-center overflow-x-auto rounded-lg bg-code p-4 font-mono text-xs leading-relaxed text-code-foreground"
              ><code class="block whitespace-pre">{{ s.code }}</code></pre>
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
      <section id="setup" class="border-b border-border">
        <div class="mx-auto grid max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div class="min-w-0">
            <Eyebrow>For developers · Get started</Eyebrow>
            <h2 class="text-balance mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Set up in minutes.</h2>
            <p class="mt-6 text-muted-foreground">
              Install two packages, add the plugin, mount the overlay in Draft Mode. The
              <a :href="docs('/guide/getting-started')" class="text-primary hover:underline">getting started guide</a>
              walks through every step, including the preview route and <InlineCode>stegaClean</InlineCode>.
            </p>
            <p class="mt-4 rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Builds on Payload's own preview: for clicks inside the Live Preview, set up
              <a
                href="https://payloadcms.com/docs/live-preview/overview"
                target="_blank"
                rel="noreferrer"
                class="text-primary hover:underline"
                >Payload's Live Preview</a
              >
              first.
              <a :href="docs('/guide/live-preview')" class="text-primary hover:underline">More</a>
            </p>
            <h3 class="mt-10 font-semibold">Or let your agent do it</h3>
            <div class="mt-3 flex items-center justify-between gap-2 rounded-lg bg-code py-1.5 pr-1.5 pl-4">
              <code class="min-w-0 overflow-x-auto font-mono text-[13px] whitespace-nowrap text-code-foreground">
                <span class="text-primary">$</span> {{ agentCmd }}
              </code>
              <CopyButton :text="agentCmd" />
            </div>
            <p class="mt-3 text-sm text-muted-foreground">
              Then ask: <em>"Set up Payload visual editing in this project."</em> More in
              <a :href="docs('/ai/setup')" class="text-primary hover:underline">AI-assisted setup</a>.
            </p>
          </div>
          <div class="min-w-0">
            <CodeTabs />
          </div>
        </div>
      </section>

      <!-- Scope -->
      <section class="border-b border-border">
        <div class="mx-auto max-w-6xl px-5 py-24">
          <Eyebrow>Scope</Eyebrow>
          <h2 class="text-balance mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Built for real content models.</h2>
          <p class="mt-6 max-w-2xl text-muted-foreground">
            Deep paths through tabs, groups, arrays and blocks, in collections and globals, localized or not. Plus an
            honest list of what it doesn't do yet.
          </p>
          <div class="mt-14 grid gap-4 md:grid-cols-2">
            <div class="rounded-xl border border-border bg-card p-6 sm:p-8">
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
            <div class="rounded-xl border border-dashed border-border p-6 sm:p-8">
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
        <div class="mx-auto max-w-6xl px-5 py-24 text-center">
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
