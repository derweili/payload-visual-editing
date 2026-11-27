'use client'

import { Banner, Button } from '@payloadcms/ui'
import { useState } from 'react'

type State = 'idle' | 'confirm' | 'seeding' | 'done' | 'error'

/** Admin dashboard: fill an empty deployment with the demo content (or reset it). */
export function SeedButton() {
  const [state, setState] = useState<State>('idle')

  async function run() {
    if (state !== 'confirm') return setState('confirm')
    setState('seeding')
    const res = await fetch('/next/seed', { method: 'POST', credentials: 'include' })
    setState(res.ok ? 'done' : 'error')
  }

  return (
    <Banner type="info">
      <p style={{ marginBottom: '0.75rem' }}>
        <strong>Visual editing demo.</strong> Open a page or project and toggle the Live Preview (eye icon), then click any
        text, image or number in the preview to jump to its field.
      </p>
      {state === 'done' ? (
        <p>
          Demo content created. <a href="/">Open the site</a>
        </p>
      ) : (
        <Button buttonStyle={state === 'confirm' ? 'primary' : 'secondary'} size="small" disabled={state === 'seeding'} onClick={run}>
          {state === 'seeding'
            ? 'Seeding…'
            : state === 'confirm'
              ? 'Click again: this replaces all pages, projects and media'
              : 'Seed demo content'}
        </Button>
      )}
      {state === 'error' && <p>Seeding failed. Check the server logs.</p>}
    </Banner>
  )
}
