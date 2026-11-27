import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import { h } from 'vue'
import HomeCta from './components/HomeCta.vue'
import HomeScope from './components/HomeScope.vue'
import HomeSteps from './components/HomeSteps.vue'
import HomeUnderTheHood from './components/HomeUnderTheHood.vue'
import HomeVideo from './components/HomeVideo.vue'
import './custom.css'

export default {
  extends: DefaultTheme,
  Layout: () =>
    h(DefaultTheme.Layout, null, {
      'home-hero-after': () => h(HomeVideo),
    }),
  enhanceApp({ app }) {
    app.component('HomeSteps', HomeSteps)
    app.component('HomeUnderTheHood', HomeUnderTheHood)
    app.component('HomeScope', HomeScope)
    app.component('HomeCta', HomeCta)
  },
} satisfies Theme
