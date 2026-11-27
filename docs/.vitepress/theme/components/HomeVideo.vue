<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { computed } from 'vue'

/**
 * Demo video below the hero. Configure in docs/index.md frontmatter:
 *
 *   video:
 *     src: https://…/payload-visual-editing.mp4   # a video file, or
 *     embed: https://www.youtube-nocookie.com/embed/…  # an iframe URL
 *     poster: https://…/poster.jpg
 *
 * Without `src` or `embed` a placeholder frame is shown.
 */
const { frontmatter } = useData()
const video = computed(
  () => (frontmatter.value.video ?? {}) as { src?: string; embed?: string; poster?: string; title?: string },
)
const title = computed(() => video.value.title ?? 'Visual editing for Payload: demo')
</script>

<template>
  <section class="pve-video" aria-label="Demo video">
    <div class="frame">
      <div class="glow" aria-hidden="true" />
      <div class="screen">
        <iframe
          v-if="video.embed"
          :src="video.embed"
          :title="title"
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowfullscreen
        />
        <video
          v-else-if="video.src"
          :src="video.src"
          :poster="video.poster"
          :aria-label="title"
          autoplay
          muted
          loop
          playsinline
          controls
          preload="metadata"
        />
        <div v-else class="placeholder">
          <img :src="withBase('/logo.svg')" alt="" width="72" height="72" />
          <p class="ph-title">No more hunting <span>for fields.</span></p>
          <p class="ph-sub">Demo video coming soon</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.pve-video {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}
@media (min-width: 640px) {
  .pve-video {
    padding: 0 48px;
  }
}
@media (min-width: 960px) {
  .pve-video {
    padding: 0 0;
    margin-block: 100px;
  }
}
.frame {
  position: relative;
}
.glow {
  position: absolute;
  inset: 8% 6% -4%;
  background: linear-gradient(100deg, var(--pve-cyan), var(--pve-blue), var(--pve-violet));
  filter: blur(70px);
  opacity: 0.35;
  border-radius: 40px;
  z-index: 0;
}
.screen {
  position: relative;
  z-index: 1;
  aspect-ratio: 16 / 9;
  border-radius: 18px;
  overflow: hidden;
  background: #07080c;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 40px 100px -40px rgba(0, 0, 0, 0.6),
    0 0 0 1px rgba(0, 0, 0, 0.04);
}
.screen video,
.screen iframe {
  display: block;
  width: 100%;
  height: 100%;
  border: 0;
  object-fit: cover;
}
.placeholder {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  padding: 24px;
  background:
    radial-gradient(40% 60% at 25% 30%, rgba(59, 130, 246, 0.35), transparent 70%),
    radial-gradient(40% 60% at 80% 75%, rgba(139, 92, 246, 0.3), transparent 70%),
    radial-gradient(30% 40% at 80% 15%, rgba(34, 211, 238, 0.22), transparent 70%),
    #07080c;
}
.placeholder img {
  filter: drop-shadow(0 16px 40px rgba(59, 130, 246, 0.6));
  margin-bottom: 12px;
}
.ph-title {
  margin: 0;
  font-size: clamp(22px, 3.6vw, 40px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f4f5f8;
}
.ph-title span {
  background: var(--pve-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.ph-sub {
  margin: 0;
  color: #9ba1b0;
  font-size: 15px;
}
</style>
