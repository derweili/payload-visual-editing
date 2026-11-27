<template>
  <section class="pve-section">
    <div class="head">
      <p class="pve-eyebrow">For developers: under the hood</p>
      <h2 class="pve-title">Every draft value knows <span class="grad">where it came from</span></h2>
      <p class="pve-lead">
        No IDs to wire up by hand. The source travels with the content, from the Payload read to the rendered page and
        back to the admin.
      </p>
    </div>

    <ol class="flow">
      <li class="card">
        <div class="tag">1 · Encode</div>
        <h3>Payload adds a source map to draft reads</h3>
        <p>
          With <code>encodeSourceMaps</code>, the plugin appends an invisible ref to every text value: collection,
          document, field path and locale. Images, numbers and dates get a source tag you render with
          <code>fieldAttrs()</code>.
        </p>
        <pre><span class="f">payload</span>.findByID({
  …,
  context: draft
    ? { <span class="hl">encodeSourceMaps: true</span> }
    : {},
})</pre>
      </li>
      <li class="card">
        <div class="tag">2 · Detect</div>
        <h3>The overlay finds the refs in the page</h3>
        <p>
          <code>&lt;VisualEditing /&gt;</code> decodes the refs in the rendered DOM and draws the outline and the "Edit"
          button. Only in Draft Mode: published pages carry nothing extra.
        </p>
        <pre>{draft &amp;&amp; <span class="f">&lt;VisualEditing</span> <span class="f">/&gt;</span>}</pre>
      </li>
      <li class="card">
        <div class="tag">3 · Focus</div>
        <h3>The admin focuses the field</h3>
        <p>
          Standalone, the button opens a deep link. Inside the Live Preview it sends a <code>postMessage</code>
          instead. The admin component opens tabs, expands rows and focuses the input.
        </p>
        <pre>/admin/collections/pages/1
  <span class="hl">?field=team.1.name</span></pre>
      </li>
    </ol>

    <a class="more" href="./architecture">Read the architecture →</a>
  </section>
</template>

<style scoped>
.head {
  max-width: 720px;
}
.flow {
  list-style: none;
  margin: 40px 0 0;
  padding: 0;
  display: grid;
  gap: 20px;
  counter-reset: none;
}
@media (min-width: 860px) {
  .flow {
    grid-template-columns: repeat(3, 1fr);
  }
}
.card {
  position: relative;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--vp-c-divider);
  border-radius: 16px;
  padding: 24px 24px 22px;
  background: var(--vp-c-bg-soft);
}
@media (min-width: 860px) {
  .card:not(:last-child)::after {
    content: '→';
    position: absolute;
    right: -17px;
    top: 26px;
    width: 14px;
    text-align: center;
    color: var(--vp-c-text-3);
    font-size: 16px;
  }
}
.tag {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--vp-c-brand-1);
  margin-bottom: 10px;
}
h3 {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--vp-c-text-1);
}
.card p {
  margin: 0 0 18px;
  font-size: 14.5px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
  flex: 1;
}
code {
  font-family: var(--vp-font-family-mono);
  font-size: 0.86em;
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--vp-c-default-soft);
  color: var(--vp-c-text-1);
}
pre {
  margin: 0;
  padding: 12px 14px;
  border-radius: 10px;
  background: #0d0f15;
  color: #c9cfdb;
  font-family: var(--vp-font-family-mono);
  font-size: 12.5px;
  line-height: 1.6;
  overflow-x: auto;
}
pre .f {
  color: #60a5fa;
}
pre .hl {
  color: #fff;
  background: rgba(59, 130, 246, 0.3);
  border-radius: 4px;
  padding: 0 4px;
}
.more {
  display: inline-block;
  margin-top: 20px;
  font-size: 14px;
  font-weight: 500;
  color: var(--vp-c-brand-1);
}
</style>
