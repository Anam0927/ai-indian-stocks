import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

import { getKiteLoginUrl } from '@/lib/utils'
import { getCurrentUserFn } from '@/server/auth'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ location }) => {
    const user = await getCurrentUserFn()

    if (!user) {
      throw redirect({
        href: getKiteLoginUrl(
          `redirect_to=${encodeURIComponent(location.pathname + location.searchStr)}`,
        ),
      })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  return <Outlet />
}
