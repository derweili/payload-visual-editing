<template>
  <section class="pve-section pve-center">
    <p class="pve-eyebrow">For editors</p>
    <h2 class="pve-title">See it, click it, <span class="grad">fix it</span></h2>
    <p class="pve-lead">
      No more memorising which tab, block or array row holds a sentence. Start from the page your readers see.
    </p>

    <div class="steps">
      <article class="step">
        <div class="visual site">
          <div class="bar">
            <span class="dots"><i /><i /><i /></span>
            <span class="draft">● Draft Mode</span>
          </div>
          <div class="page">
            <div class="site-line short" />
            <div class="site-heading" />
            <div class="site-line" />
            <div class="site-line mid" />
          </div>
        </div>
        <span class="num">1</span>
        <h3>Open the preview</h3>
        <p>
          From the document in Payload, open the preview in its own tab or use Payload's Live Preview next to the
          form.
        </p>
      </article>

      <article class="step">
        <div class="visual site">
          <div class="page">
            <div class="site-line short" />
            <div class="site-target">
              Jonas Weber
              <span class="edit">✎ Edit</span>
            </div>
            <div class="site-line" />
            <div class="site-line mid" />
          </div>
        </div>
        <span class="num">2</span>
        <h3>Click what you want to change</h3>
        <p>
          Hover any headline, text, image or number. It gets an outline and an "Edit" button. Click it.
        </p>
      </article>

      <article class="step">
        <div class="visual admin">
          <div class="tabs"><span>Hero</span><span>Content</span><span class="on">Team</span></div>
          <div class="row">02 · Jonas Weber <b>⌃</b></div>
          <div class="label">Name</div>
          <div class="input">Jonas Weber<i /></div>
        </div>
        <span class="num">3</span>
        <h3>Edit the field</h3>
        <p>
          Payload opens the right tab, expands the right row and puts the cursor in the field. In the Live Preview,
          without leaving the page.
        </p>
      </article>
    </div>
  </section>
</template>

<style scoped>
.steps {
  display: grid;
  gap: 20px;
  margin-top: 48px;
  text-align: left;
}
@media (min-width: 860px) {
  .steps {
    grid-template-columns: repeat(3, 1fr);
  }
}
.step {
  position: relative;
  border: 1px solid var(--vp-c-divider);
  background: var(--vp-c-bg-soft);
  border-radius: 16px;
  padding: 20px 22px 26px;
}
.visual {
  height: 168px;
  border-radius: 12px;
  border: 1px solid var(--vp-c-divider);
  margin-bottom: 22px;
  overflow: hidden;
  position: relative;
}

.site {
  background: #fbfbfd;
}
.bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0 10px;
  background: #eef0f4;
  border-bottom: 1px solid #e2e5ea;
}
.dots {
  display: flex;
  gap: 5px;
}
.dots i {
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background: #cbd5e1;
}
.draft {
  font-size: 11px;
  font-weight: 600;
  color: #b45309;
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 999px;
  padding: 1px 8px;
}
.page {
  padding: 16px 22px;
}
.site-heading {
  height: 22px;
  width: 75%;
  border-radius: 6px;
  background: #0f172a;
  margin: 14px 0 16px;
}
.site-line {
  height: 9px;
  border-radius: 5px;
  background: #e2e8f0;
  margin: 10px 0;
  width: 85%;
}
.site-line.short {
  width: 40%;
  background: #c7d2fe;
}
.site-line.mid {
  width: 60%;
}
.site-target {
  position: relative;
  display: inline-block;
  margin: 26px 0 10px;
  padding: 4px 8px;
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  border: 2px solid #3b82f6;
  background: rgba(59, 130, 246, 0.07);
  border-radius: 8px;
}
.edit {
  position: absolute;
  right: -2px;
  top: -30px;
  font-size: 12px;
  font-weight: 600;
  color: #fff;
  background: #3b82f6;
  border-radius: 6px;
  padding: 3px 9px;
  box-shadow: 0 6px 16px -4px rgba(59, 130, 246, 0.7);
}

.admin {
  background: #141414;
  border-color: rgba(255, 255, 255, 0.06);
  padding: 12px 18px;
  font-size: 13px;
  color: #8a8a8a;
}
.tabs {
  display: flex;
  gap: 18px;
  margin-bottom: 10px;
  border-bottom: 1px solid #2e2e2e;
}
.tabs span {
  padding-bottom: 6px;
}
.tabs .on {
  color: #e7e7e7;
  border-bottom: 2px solid #3b82f6;
}
.row {
  display: flex;
  justify-content: space-between;
  color: #e7e7e7;
  font-size: 12px;
  background: #1c1c1c;
  border: 1px solid #2e2e2e;
  border-radius: 6px 6px 0 0;
  padding: 5px 10px;
  margin-bottom: 8px;
}
.row b {
  color: #8a8a8a;
  font-weight: 400;
}
.label {
  color: #93c5fd;
  margin-bottom: 6px;
}
.input {
  color: #e7e7e7;
  background: #202020;
  border: 1.5px solid #3b82f6;
  border-radius: 6px;
  padding: 7px 10px;
  box-shadow:
    0 0 0 3px rgba(59, 130, 246, 0.25),
    0 0 26px rgba(59, 130, 246, 0.35);
}
.input i {
  display: inline-block;
  width: 1.5px;
  height: 14px;
  background: #93c5fd;
  margin-left: 2px;
  vertical-align: -2px;
  animation: blink 1s steps(1) infinite;
}
@keyframes blink {
  50% {
    opacity: 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .input i {
    animation: none;
  }
}

.num {
  position: absolute;
  top: 200px;
  right: 22px;
  font-size: 13px;
  font-weight: 700;
  width: 26px;
  height: 26px;
  border-radius: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: var(--pve-gradient);
}
h3 {
  margin: 0 0 8px;
  padding-right: 34px;
  font-size: 18px;
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.step p {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--vp-c-text-2);
}
</style>
