import type { Field, GroupField } from 'payload'

export const linkAppearances = ['default', 'outline'] as const
export type LinkAppearance = (typeof linkAppearances)[number]

/**
 * A link to a page or project (reference: survives slug changes) or to any URL.
 * The `url` field is excluded from source maps by the plugin's defaults, so hrefs stay clean.
 */
export function linkField({
  name = 'link',
  appearance = false,
  required = true,
}: { name?: string; appearance?: boolean; required?: boolean } = {}): GroupField {
  const fields: Field[] = [
    {
      type: 'row',
      fields: [
        {
          name: 'type',
          type: 'radio',
          defaultValue: 'reference',
          options: [
            { label: 'Internal', value: 'reference' },
            { label: 'Custom URL', value: 'custom' },
          ],
          admin: { layout: 'horizontal', width: '50%' },
        },
        { name: 'newTab', type: 'checkbox', label: 'Open in new tab', admin: { width: '50%', style: { alignSelf: 'flex-end' } } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'label', type: 'text', required, admin: { width: '50%' } },
        {
          name: 'reference',
          type: 'relationship',
          relationTo: ['pages', 'projects'],
          required,
          admin: { width: '50%', condition: (_, sibling) => sibling?.type === 'reference' },
        },
        {
          name: 'url',
          type: 'text',
          label: 'URL',
          required,
          admin: { width: '50%', condition: (_, sibling) => sibling?.type === 'custom' },
        },
      ],
    },
  ]

  if (appearance) {
    fields.push({
      name: 'appearance',
      type: 'select',
      defaultValue: 'default',
      options: linkAppearances.map((value) => ({ label: value === 'default' ? 'Primary' : 'Outline', value })),
    })
  }

  return { name, type: 'group', interfaceName: appearance ? 'ButtonLink' : 'Link', fields, admin: { hideGutter: true } }
}

/** An array of button links, e.g. the calls to action of a hero. */
export function linksField({ name = 'links', maxRows = 2 }: { name?: string; maxRows?: number } = {}): Field {
  return {
    name,
    type: 'array',
    maxRows,
    fields: [linkField({ appearance: true })],
    admin: { initCollapsed: false },
  }
}
