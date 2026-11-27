/**
 * The test app's database: an in-memory D1 from Miniflare, the same as in the plugin's integration
 * tests. Every server start begins empty and is seeded (see seed.ts), so the e2e tests always run
 * against the same data.
 *
 * One instance per process: Next can evaluate the Payload config more than once (server components,
 * route handlers), and each evaluation must see the same database.
 */
import { convertV4MiniflareOptions, Miniflare } from 'miniflare'

type D1 = Awaited<ReturnType<Miniflare['getD1Database']>>

const globalForD1 = globalThis as typeof globalThis & { __visualEditingDevD1?: Promise<D1> }

export function getD1(): Promise<D1> {
  globalForD1.__visualEditingDevD1 ??= new Miniflare(
    convertV4MiniflareOptions({
      modules: true,
      script: 'export default { fetch: () => new Response(null) }',
      d1Databases: ['D1'],
    }),
  ).getD1Database('D1')
  return globalForD1.__visualEditingDevD1
}
