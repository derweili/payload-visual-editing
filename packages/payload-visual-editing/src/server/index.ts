/**
 * Server entry: Payload config plugin.
 * Must stay free of Node-only APIs (fs, path, child_process): runs on Cloudflare Workers.
 */
export { ADMIN_COMPONENT, visualEditingPlugin } from './plugin.ts'
export {
  DEFAULT_EXCLUDE,
  ENCODE_CONTEXT_KEY,
  ENCODE_QUERY_PARAM,
  type SourceMapOptions,
  type VisualEditingPluginOptions,
} from './options.ts'
export { encodeDocument, type EncodeDocumentArgs, type EncodeTarget } from './encode-document.ts'
export { createPathMatcher } from './path-matcher.ts'
export { stegaClean } from '@derweili/payload-visual-editing-core'
