# Troubleshooting

| Symptom | Check |
| --- | --- |
| No outline or "Edit" button | Draft Mode on? `<VisualEditing />` mounted in Draft Mode? Read made with `context: { encodeSourceMaps: true }`? Collection/global listed in the plugin's `collections`/`globals`? |
| Deep link opens the document but doesn't focus the field | `payload generate:importmap` not run after adding the plugin; plugin's `focusFields: false` |
| Image / number not clickable | Missing `fieldAttrs(...)`; tag lost (client component prop, `JSON.stringify`, cache, fields copied one by one) |
| Logic works on the live site but not in the preview | Encoded string compared/parsed: `stegaClean` it, or exclude the field |
| Odd characters in `<title>`, shares, search results | Metadata not cleaned with `stegaClean`; or an encoded read reached a cache |
| Zero-width characters / `data-pve-` in production HTML | Encoding outside Draft Mode, or an encoded read was cached. Check with `curl -s <url> \| grep -cP '[\x{200B}-\x{200F}\x{FEFF}]\|data-pve-'` |
| Only the last paragraph is clickable after `split` | Use `stegaSplitParts` instead of `split` |
| Live Preview opens a new tab instead of focusing | Admin didn't answer the `pve:ready` handshake within `handshakeTimeout` (500 ms); collection not in the plugin's scope |
| REST `?encodeSourceMaps=true` ignored | Only GET, and by default only for logged-in users (`sourceMaps.canEncode`) |

## Known limits (not bugs in the site)

- Fields far down long forms are reached by scrolling, with a short jump (Payload renders fields
  lazily).
- Tabs inside array/block rows can't be opened; the field is focused only if its tab is open.
- Collapsibles with `admin.initCollapsed` aren't opened.
- Uploads have no input; the field's edit button gets focus.
- Focusing fails silently (never throws) if Payload's admin markup changes.
