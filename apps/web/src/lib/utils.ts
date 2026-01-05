import type { ClassValue } from 'clsx'

import { clientEnv } from '@stocks/env/web'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getKiteLoginUrl(redirectParams?: string) {
  const apiKey = clientEnv.VITE_KITE_API_KEY

  return `https://kite.zerodha.com/connect/login?v=3&api_key=${apiKey}${
    redirectParams ? `&redirect_params=${redirectParams}` : ''
  }`
}
