'use client'
/**
 * React entry: <VisualEditing />. A client module: server components import `stegaClean` and
 * `fieldAttrs` from `./vanilla` instead (functions from a 'use client' module aren't callable there).
 */
export { VisualEditing, type VisualEditingProps } from './VisualEditing.tsx'
export { fieldAttrs, stegaClean } from '../vanilla/index.ts'
