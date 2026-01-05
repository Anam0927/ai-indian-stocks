import { serverEnv } from '@stocks/env/server'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { HTTPError } from 'ky'
import crypto from 'node:crypto'
import { z } from 'zod'

import { kite } from '@/lib/kite'
import { useAppSession } from '@/lib/session'

async function getAccessToken(requestToken: string) {
  try {
    const res = await kite
      .post<{ data: { access_token: string } }>('session/token', {
        body: new URLSearchParams({
          request_token: requestToken,
          api_key: serverEnv.KITE_API_KEY,
          checksum: crypto
            .createHash('sha256')
            .update(
              serverEnv.KITE_API_KEY + requestToken + serverEnv.KITE_API_SECRET,
            )
            .digest('hex'),
        }),
      })
      .json()

    return res.data.access_token
  } catch (error) {
    if (error instanceof HTTPError) {
      const errorBody = await error.response.json()
      throw new Error(
        `Failed to get access token: ${errorBody.message || error.message}`,
      )
    }

    throw error
  }
}

// Login server function
export const setSession = createServerFn({ method: 'POST' })
  .inputValidator(
    z.object({
      requestToken: z.string().nonempty(),
      redirectTo: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const accessToken = await getAccessToken(data.requestToken)

    // Create session
    const session = await useAppSession()
    await session.update({
      token: accessToken,
    })

    // Redirect to protected area
    throw redirect({ to: data.redirectTo ?? '/test' })
  })

// Logout server function
export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession()
  await session.clear()
  throw redirect({ to: '/' })
})

// Get current user
export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    const token = session.data.token

    if (!token) {
      return null
    }

    return { token }
  },
)

export const getCurrentUserStatusFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    const token = session.data.token

    return {
      isAuthenticated: !!token,
    }
  },
)
