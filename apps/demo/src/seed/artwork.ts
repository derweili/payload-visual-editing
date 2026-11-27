/**
 * Abstract artwork for the demo images, drawn as SVG and rendered with sharp: no stock photos,
 * no downloads, no licences. Deterministic, so every seed looks the same.
 */
import sharp from 'sharp'

export const palettes = {
  indigo: ['#1e1b4b', '#4f46e5', '#a5b4fc', '#eef2ff'],
  teal: ['#042f2e', '#0d9488', '#5eead4', '#f0fdfa'],
  amber: ['#451a03', '#d97706', '#fcd34d', '#fffbeb'],
  slate: ['#0f172a', '#334155', '#94a3b8', '#f8fafc'],
  rose: ['#4c0519', '#e11d48', '#fda4af', '#fff1f2'],
  emerald: ['#022c22', '#059669', '#6ee7b7', '#ecfdf5'],
} as const

export type Palette = keyof typeof palettes
export type Composition = 'orbs' | 'arcs' | 'bands' | 'blocks' | 'portrait'

/** mulberry32: a tiny seeded PRNG, so every seed run draws the same images */
function random(seed: number) {
  let a = seed * 2654435761
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function svg(kind: Composition, palette: Palette, w: number, h: number, seed: number): string {
  const [dark, mid, light, paper] = palettes[palette]
  const r = random(seed)
  const defs = `<defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${dark}"/><stop offset="1" stop-color="${mid}"/></linearGradient>
    <filter id="blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${Math.round(w / 14)}"/></filter>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="${paper}" stroke-opacity=".08"/></pattern>
  </defs>`
  let body = ''
  switch (kind) {
    case 'orbs':
      body = `<rect width="100%" height="100%" fill="url(#bg)"/>
        <g filter="url(#blur)">
          <circle cx="${w * (0.2 + r() * 0.3)}" cy="${h * 0.35}" r="${w * 0.28}" fill="${light}" opacity=".75"/>
          <circle cx="${w * (0.65 + r() * 0.2)}" cy="${h * 0.7}" r="${w * 0.25}" fill="${mid}" opacity=".9"/>
          <circle cx="${w * 0.85}" cy="${h * 0.15}" r="${w * 0.16}" fill="${paper}" opacity=".35"/>
        </g>
        <rect width="100%" height="100%" fill="url(#grid)"/>`
      break
    case 'arcs': {
      const cx = w * (0.15 + r() * 0.2)
      body = `<rect width="100%" height="100%" fill="${dark}"/>
        ${Array.from({ length: 9 }, (_, i) => `<circle cx="${cx}" cy="${h * 1.05}" r="${(i + 1) * w * 0.09}" fill="none" stroke="${i % 3 === 0 ? light : mid}" stroke-width="${2 + (i % 4) * 3}" opacity="${0.9 - i * 0.07}"/>`).join('')}
        <circle cx="${w * 0.78}" cy="${h * 0.3}" r="${w * 0.08}" fill="${light}"/>`
      break
    }
    case 'bands':
      body = `<rect width="100%" height="100%" fill="${paper}"/>
        <g transform="rotate(-24 ${w / 2} ${h / 2})">
          ${Array.from({ length: 7 }, (_, i) => `<rect x="${-w * 0.5}" y="${h * (-0.2 + i * 0.22)}" width="${w * 2}" height="${h * (0.06 + r() * 0.1)}" fill="${[dark, mid, light][i % 3]}" opacity="${0.6 + r() * 0.4}"/>`).join('')}
        </g>`
      break
    case 'blocks': {
      const cells = []
      for (let x = 0; x < 6; x++)
        for (let y = 0; y < 4; y++) {
          const v = r()
          if (v > 0.45) cells.push(`<rect x="${(x * w) / 6 + 8}" y="${(y * h) / 4 + 8}" width="${w / 6 - 16}" height="${h / 4 - 16}" rx="18" fill="${v > 0.85 ? light : v > 0.65 ? mid : paper}" opacity="${v > 0.65 ? 1 : 0.12}"/>`)
        }
      body = `<rect width="100%" height="100%" fill="${dark}"/>${cells.join('')}`
      break
    }
    case 'portrait':
      body = `<rect width="100%" height="100%" fill="url(#bg)"/>
        <g filter="url(#blur)"><circle cx="${w * 0.5}" cy="${h * 0.2}" r="${w * 0.4}" fill="${light}" opacity=".5"/></g>
        <circle cx="${w / 2}" cy="${h * 0.4}" r="${w * 0.17}" fill="${paper}" opacity=".9"/>
        <ellipse cx="${w / 2}" cy="${h * 0.95}" rx="${w * 0.36}" ry="${h * 0.3}" fill="${paper}" opacity=".9"/>`
      break
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${defs}${body}</svg>`
}

export async function renderArtwork(kind: Composition, palette: Palette, seed: number, w = 1600, h = 1200): Promise<Buffer> {
  return sharp(Buffer.from(svg(kind, palette, w, h, seed))).webp({ quality: 82 }).toBuffer()
}
