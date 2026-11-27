<script setup lang="ts">
import CodeTabs from './CodeTabs.vue'
import CopyButton from './CopyButton.vue'
import Eyebrow from './Eyebrow.vue'
import InlineCode from './InlineCode.vue'
import { docs } from './parts'
import { vReveal } from './reveal'

const agentCmd = 'npx skills add derweili/payload-visual-editing'
</script>

<template>
  <section id="setup" class="border-b border-border">
    <div class="mx-auto grid w-full max-w-6xl gap-12 px-5 py-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <div v-reveal class="min-w-0">
        <Eyebrow>For developers · Get started</Eyebrow>
        <h2 class="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Set up in minutes.</h2>
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
      <div v-reveal="120" class="min-w-0">
        <CodeTabs />
      </div>
    </div>
  </section>
</template>
