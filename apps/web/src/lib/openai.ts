import { serverEnv } from '@stocks/env/server'
import OpenAI from 'openai'

export const openai = new OpenAI({
  apiKey: serverEnv.OPENAI_API_KEY,
})
