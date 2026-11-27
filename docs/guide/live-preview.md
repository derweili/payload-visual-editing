# Live Preview

Inside Payload's [Live Preview](https://payloadcms.com/docs/live-preview/overview), a click on
"Edit" focuses the field next to the page, in the same tab. The overlay needs nothing extra: inside
the iframe it talks to the admin through `postMessage`.

::: warning Prerequisite: Payload's Live Preview
This plugin builds on Payload's own Live Preview and doesn't set it up for you. Configure it first,
following Payload's [Live Preview docs](https://payloadcms.com/docs/live-preview/overview): the
preview URL below, plus a frontend that re-renders when the draft changes
([server-side](https://payloadcms.com/docs/live-preview/server) with `RefreshRouteOnSave`, or
client-side with `useLivePreview`). Once the page shows and refreshes in the Live Preview pane,
visual editing works there without extra setup.
:::

## Configure the preview URL

Point the collection's `admin.livePreview.url` at your Draft Mode route:

```ts {4,10}
const previewURL = ({ data, locale, req }) => {
  const origin = req.url ? new URL(req.url).origin : ''
  const path = `/${data.slug ?? ''}?locale=${locale.code}`
  return `${origin}/next/preview?path=${encodeURIComponent(path)}`
}

const Pages: CollectionConfig = {
  slug: 'pages',
  versions: { drafts: true },
  admin: { livePreview: { url: previewURL } },
  fields: [/* … */],
}
```

The page must render `<VisualEditing />` in Draft Mode, as in
[Getting started](./getting-started#_5-mount-the-overlay).

## How it works

1. The overlay inside the preview iframe asks the admin `pve:ready`.
2. If the admin answers, a click sends `pve:focus` and the admin focuses the field in the same tab.
   A field of another document or locale navigates there.
3. Without an answer within 500 ms (`handshakeTimeout`), the overlay opens the deep link in a new
   tab instead.

Messages are accepted only from the view's own preview iframe or popup, and carry a protocol
version. Foreign or mismatched messages are rejected.

## Deep links

Outside the Live Preview the overlay opens a deep link:

```
/admin/collections/pages/1?field=team.1.links.0.label&locale=en
/admin/globals/header?field=nav.0.label
```

`locale` is Payload's own locale switch. You can build these links yourself, for example from a
content report, with `buildAdminUrl` from the [core package](/reference/core).

## What focusing does

- Waits until Payload has loaded the form.
- Opens tabs by clicking the tab button, and expands collapsed array/block rows through Payload's
  form state, the same way an editor would.
- Keeps the field centred while lazy content above it still loads, and stops at the first scroll,
  click or key press.

Limits are listed in [Known limitations](./known-limitations).
