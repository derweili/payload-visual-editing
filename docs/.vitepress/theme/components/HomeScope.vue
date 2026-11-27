<template>
  <section class="pve-section">
    <div class="head">
      <p class="pve-eyebrow">Scope</p>
      <h2 class="pve-title">Built for <span class="grad">real content models</span></h2>
      <p class="pve-lead">
        Deep paths through tabs, groups, arrays and blocks, in collections and globals, localized or not. And an
        honest list of what it doesn't do yet.
      </p>
    </div>
    <div class="cols">
      <div class="col yes">
        <h3>Supported</h3>
        <ul>
          <li><code>text</code>, <code>textarea</code> and Lexical <code>richText</code></li>
          <li>Arrays, groups, named and unnamed tabs, collapsibles, rows, blocks</li>
          <li>Localized fields, collections and globals</li>
          <li>Images, numbers, relationships, selects and dates via source tags</li>
          <li>Preview in its own tab and Payload's Live Preview</li>
          <li>Cloudflare Workers (no Node-only APIs)</li>
        </ul>
      </div>
      <div class="col no">
        <h3>Not (yet)</h3>
        <ul>
          <li>Inline editing on the page</li>
          <li>Drag &amp; drop or adding blocks from the preview</li>
          <li>Highlighting in the preview when a field is focused in the admin</li>
          <li>Tested frontends other than Next.js (the vanilla overlay is framework-agnostic)</li>
        </ul>
        <a class="more" href="./guide/known-issues">Known issues →</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.head {
  max-width: 720px;
}
.cols {
  display: grid;
  gap: 20px;
  margin-top: 40px;
}
@media (min-width: 860px) {
  .cols {
    grid-template-columns: 3fr 2fr;
  }
}
.col {
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 26px 28px;
  background: var(--vp-c-bg-soft);
}
h3 {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
li {
  position: relative;
  padding-left: 28px;
  margin: 10px 0;
  font-size: 15px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}
li::before {
  position: absolute;
  left: 0;
  top: 1px;
  width: 18px;
  height: 18px;
  border-radius: 9px;
  font-size: 11px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.yes li::before {
  content: '✓';
  color: #052e16;
  background: #34d399;
}
.no li::before {
  content: '–';
  color: var(--vp-c-text-2);
  background: var(--vp-c-default-soft);
}
code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.88em;
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}
.more {
  display: inline-block;
  margin-top: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}
</style>
