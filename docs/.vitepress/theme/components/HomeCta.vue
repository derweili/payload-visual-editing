<script setup lang="ts">
import { withBase } from 'vitepress'
</script>

<template>
  <section class="pve-section">
    <div class="cta">
      <div class="bg" aria-hidden="true" />
      <img :src="withBase('/logo.svg')" alt="" width="56" height="56" />
      <h2>Give your editors the shortcut.</h2>
      <p>Open source, MIT licensed. Payload 3.94+, Next.js 15.4+ or 16, React 19.</p>
      <div class="actions">
        <a class="btn primary" :href="withBase('/guide/getting-started')">Get started</a>
        <a class="btn" :href="withBase('/ai/setup')">Set up with AI</a>
        <a class="btn" href="https://github.com/derweili/payload-visual-editing" target="_blank" rel="noreferrer">
          Star on GitHub
        </a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.cta {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  padding: 64px 28px;
  text-align: center;
  background: #07080c;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #f4f5f8;
}
.bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(40% 70% at 15% 20%, rgba(59, 130, 246, 0.45), transparent 70%),
    radial-gradient(40% 70% at 90% 90%, rgba(139, 92, 246, 0.4), transparent 70%),
    radial-gradient(30% 50% at 85% 10%, rgba(34, 211, 238, 0.25), transparent 70%);
  pointer-events: none;
}
.cta > *:not(.bg) {
  position: relative;
}
img {
  margin: 0 auto 20px;
  filter: drop-shadow(0 14px 34px rgba(59, 130, 246, 0.6));
}
h2 {
  margin: 0;
  font-size: clamp(28px, 4.4vw, 44px);
  line-height: 1.15;
  font-weight: 800;
  letter-spacing: -0.02em;
}
p {
  margin: 14px auto 0;
  max-width: 560px;
  color: #b4bac7;
  font-size: 16px;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
}
.btn {
  display: inline-block;
  padding: 10px 22px;
  border-radius: 999px;
  font-size: 15px;
  font-weight: 600;
  color: #f4f5f8;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  text-decoration: none;
  transition:
    background 0.2s,
    transform 0.2s;
}
.btn:hover {
  background: rgba(255, 255, 255, 0.14);
  transform: translateY(-1px);
}
.btn.primary {
  border: 0;
  background: var(--pve-gradient);
  box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.8);
}
</style>
