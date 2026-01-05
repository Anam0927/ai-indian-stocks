import 'dotenv/config'
import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const serverEnv = createEnv({
  server: {
    KITE_API_SECRET: z.string().nonempty(),
    KITE_API_CLIENT_ID: z.string().regex(/^[A-Z]{2}\d{4}$/),
    KITE_API_KEY: z.string().nonempty(),
    SESSION_SECRET: z.string().min(32),
  },
  clientPrefix: 'VITE_',
  client: {},
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})
