import { createFileRoute } from '@tanstack/react-router'

import { setSession } from '@/server/auth'

export const Route = createFileRoute('/auth/callback')({
  loader: async ({ location }) => {
    const urlParams = new URLSearchParams(location.search)
    const requestToken = urlParams.get('request_token')
    const status = urlParams.get('status')
    const redirectTo = urlParams.get('redirect_to') ?? undefined

    if (status !== 'success' || !requestToken) {
      throw new Error('Authentication failed')
    }

    await setSession({
      data: { requestToken, redirectTo },
    })
  },
  pendingComponent: () => <div>Logging in...</div>,
  component: () => <div>Redirecting...</div>,
})
