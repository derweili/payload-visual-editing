/** Project categories: stored as values, shown with these labels (and used as filters). */
export const projectCategories = [
  { value: 'strategy', label: 'Strategy' },
  { value: 'design', label: 'Design' },
  { value: 'engineering', label: 'Engineering' },
  { value: 'data', label: 'Data & AI' },
] as const

export type ProjectCategory = (typeof projectCategories)[number]['value']

export const categoryLabel = (value?: string | null) =>
  projectCategories.find((category) => category.value === value)?.label ?? value ?? ''

export const isProjectCategory = (value: unknown): value is ProjectCategory =>
  projectCategories.some((category) => category.value === value)
