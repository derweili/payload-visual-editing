# @derweili/payload-visual-editing-core

Shared building blocks of Payload visual editing: the source ref format, stega encoding, data
paths, admin URLs, the `postMessage` protocol and source tags. No framework or Payload dependency,
so it runs anywhere: browser, Node, Cloudflare Workers.

Sites normally don't need it directly. The plugin and the overlay re-export what a site uses
(`stegaClean`, `stegaSplitParts`, `sourceOf`, `fieldSourceOf`). Overview:
[README](../../README.md).

## API

**Refs:** where a value comes from.

- `SourceLocation`: `{ collection, id, path, locale? }` or `{ global, path, locale? }`.
- `encodeRef(location)` / `decodeRef(value)`: the compact, versioned form that travels in stega
  text and messages. `decodeRef` returns null for anything that isn't a valid ref.

**Stega:** invisible characters, built on `@vercel/stega`.

- `stegaEncode(text, ref, { skip })`: appends the ref. `skip: 'auto'` (the default) leaves URL-
  and date-like strings alone (`looksLikeUrlOrDate`).
- `stegaDecode(text)`, `stegaDecodeAll(text)`, `hasStega(text)`, `stegaSplit(text)`.
- `stegaClean(value)`: removes the encoding from a string, array or object.
- `stegaSplitParts(text, separator, map?)`: splits the visible text and gives every part the ref.

**Paths:** `parsePath('team.1.label')` gives `['team', 1, 'label']`. Also `formatPath`,
`appendPath`, `stripIndices`, `isIndexSegment`.

**Admin URLs:** `buildAdminUrl(ref, { adminRoute, serverURL })` builds
`/admin/collections/<slug>/<id>?field=<path>&locale=<code>`. `FIELD_PARAM` and `LOCALE_PARAM` name
the query parameters.

**Messages:** what the overlay in the Live Preview iframe and the admin exchange.

- `createReadyMessage()` / `isReadyMessage()`: the handshake.
- `createFocusMessage(ref)` / `isFocusMessage()`: focus a field.
- Messages carry `PROTOCOL_VERSION`; foreign or mismatched messages are rejected.

**Source tags:** for values that can't hold stega text.

- `withSource(value, source)` and `setFieldSource(parent, name, source)`: the plugin sets them.
- `sourceOf(value)` and `fieldSourceOf(parent, name)`: the site reads them.

Tags use `Symbol.for` keys, so they survive object spread but not serialization.
