/**
 * Framework-agnostic overlay: DOM scan, outlines, edit button, links back to the admin.
 * Safe to import in server code (no 'use client'): `stegaClean` and `fieldAttrs` come from here.
 */
export {
  fieldSourceOf,
  sourceOf,
  stegaClean,
  stegaSplitParts,
  type SourceLocation,
} from '@derweili/payload-visual-editing-core'
export { DOC_ATTR, LOCALE_ATTR, PATH_ATTR, fieldAttrs, readFieldAttrs, type FieldAttrs } from './attributes.ts'
export { OVERLAY_ATTR, createOverlay, type Overlay, type OverlayOptions } from './overlay.ts'
export { findTarget, scanTargets, type Targets } from './scan.ts'
