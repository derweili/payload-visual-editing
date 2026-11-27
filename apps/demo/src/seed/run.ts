/** `pnpm seed`: fills the database with the demo content (see seed.ts). Run with `payload run`. */
import config from '@payload-config'
import { getPayload } from 'payload'

import { seed } from './seed'

const payload = await getPayload({ config })
await seed(payload)
payload.logger.info('[seed] done')
process.exit(0)
