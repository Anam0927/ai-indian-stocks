import { serverEnv } from '@stocks/env/server'
import { useSession } from '@tanstack/react-start/server'

interface SessionData {
  token?: string
}

export function useAppSession() {
  return useSession<SessionData>({
    // Session configuration
    name: 'anaam_stocks_session',
    password: serverEnv.SESSION_SECRET, // At least 32 characters
    // Optional: customize cookie settings
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
  })
}
