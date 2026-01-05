import { createEnv } from '@t3-oss/env-core'
import z from 'zod'

export const clientEnv = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_KITE_API_KEY: z.string().nonempty(),
  },
  runtimeEnv: (import.meta as any).env,
  emptyStringAsUndefined: true,
})
