import { fieldAttrs, fieldSourceOf } from '@derweili/payload-visual-editing-overlay/vanilla'

type StatItem = { prefix?: string | null; value: number; suffix?: string | null; label: string }

/**
 * A figure: the number is a number field, so it can't carry a hidden source map. Its source is
 * tagged on the row instead (`fieldSourceOf`) and rendered as data attributes.
 */
export function Stat({ item }: { item: StatItem }) {
  return (
    <div className="flex flex-col gap-2">
      <dd className="order-first text-4xl font-semibold tracking-tight sm:text-5xl">
        {item.prefix}
        <span {...fieldAttrs(fieldSourceOf(item, 'value'))}>{item.value.toLocaleString('en-US')}</span>
        {item.suffix}
      </dd>
      <dt className="text-muted-foreground">{item.label}</dt>
    </div>
  )
}
