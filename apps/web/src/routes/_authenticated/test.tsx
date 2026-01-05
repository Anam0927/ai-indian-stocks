import { serverEnv } from '@stocks/env/server'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { HTTPError } from 'ky'

import { kite } from '@/lib/kite'
import { getCurrentUserFn, logoutFn } from '@/server/auth'

const getLtpData = createServerFn({ method: 'GET' }).handler(async () => {
  try {
    const user = await getCurrentUserFn()

    const res = await kite
      .get<{ data: Record<string, { last_price: number }> }>('quote/ltp', {
        searchParams: {
          i: 'NSE:INFY',
        },
        headers: {
          Authorization: `token ${serverEnv.KITE_API_KEY}:${user!.token}`,
        },
      })
      .json()

    return res.data
  } catch (error) {
    if (error instanceof HTTPError) {
      const errorStatus = error.response.status
      if (errorStatus === 401) {
        await logoutFn()
        return
      }

      const errorBody = await error.response.json()
      throw new Error(
        `Failed to fetch LTP data: ${errorBody.message || error.message}`,
      )
    }

    throw error
  }
})

export const Route = createFileRoute('/_authenticated/test')({
  loader: async () => {
    const ltpData = await getLtpData()
    return { ltpData }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const data = Route.useLoaderData()
  return <div>{JSON.stringify(data)}</div>
}
