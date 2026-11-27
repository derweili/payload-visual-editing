# Caching and production safety

Encoded output must never reach the live site. Invisible characters in production HTML end up in
search results, shares and copied text.

## Rules

1. **Encode only in Draft Mode.** Pass `context: { encodeSourceMaps: true }` only when
   `draftMode().isEnabled`. Never during ISR, static generation or `generateStaticParams`.
2. **Never cache encoded reads.** Skip `unstable_cache` / `"use cache"` in Draft Mode, or put the
   draft state in the cache key. This also applies to platform caches such as OpenNext's
   incremental cache on Cloudflare.
3. **Mount the overlay only in Draft Mode.** `{draft && <VisualEditing />}`.

```ts {9,12}
import { draftMode } from 'next/headers'
import { unstable_cache } from 'next/cache'

export async function getPage(slug: string) {
  const { isEnabled: draft } = await draftMode()

  if (draft) {
    // Encoded: never cached
    return findPage(slug, { draft: true, context: { encodeSourceMaps: true } })
  }

  return unstable_cache(() => findPage(slug, { draft: false }), ['page', slug])()
}
```

## Who may request encoding

- **Local API:** the `encodeSourceMaps` context flag is always trusted (server code).
- **REST:** `?encodeSourceMaps=true` only works on GET requests, and by default only for logged-in
  users. Change it with the plugin's `sourceMaps.canEncode` option.

## Check your published pages

A quick check that production HTML is clean:

```sh
curl -s https://your-site.example/ | grep -cP '[\x{200B}-\x{200F}\x{FEFF}]|data-pve-'
```

The result should be `0`. The project's own e2e tests check exactly this.
