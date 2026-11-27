# Known issues

- **Long forms: fields far down are reached by scrolling (workaround).** Payload renders each list
  of fields only once it comes within 1000 px of the viewport, and has no API to force it. When the
  target field doesn't exist yet, the admin first scrolls the nearest rendered parent field into
  view. If that isn't enough, it scrolls down one screen at a time until the field appears (each
  step waits for the DOM to change; it gives up after 3 s or at the end of the page). On very long
  forms this shows as a short jump before the smooth scroll to the field. See
  [ADR 0001](/adr/0001-payload-visual-editing), section 12.
- **Tabs inside array/block rows** can't be located (rows have React-generated ids). The field is
  focused only if its tab is already open.
- **Collapsibles that start collapsed** (`admin.initCollapsed`) aren't opened. Payload reads their
  state once, on mount.
- **Uploads** have no input; the field's edit button gets the focus.

## When Payload's admin markup changes

All access to Payload's admin markup sits in one module (`src/client/dom-adapter.ts`). A guard test
fails when an installed Payload version no longer renders what it relies on. When markup does
change, focusing stops working silently; it never throws.

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| No outline or "Edit" button | Not in Draft Mode; `<VisualEditing />` not mounted; read without `context: { encodeSourceMaps: true }`; collection not listed in the plugin's `collections` |
| Link opens the document but doesn't focus the field | `payload generate:importmap` not run after adding the plugin |
| Images / numbers not clickable | Missing `fieldAttrs(...)`; tag lost by serialization (client component prop, `JSON.stringify`, cache) |
| Comparisons, `switch` or URLs broken in the preview only | Missing `stegaClean`, or the field should be in `exclude` |
| Strange characters in `<title>` or shares | Metadata not cleaned with `stegaClean` |
| Live Preview opens a new tab instead of focusing | Admin didn't answer the handshake within `handshakeTimeout`; plugin's `focusFields` disabled; collection not in the plugin's scope |
