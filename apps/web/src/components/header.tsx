import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { useServerFn } from '@tanstack/react-start'
import { CandlestickChartIcon, LogOutIcon } from 'lucide-react'
import { toast } from 'sonner'

import { useAuth } from '@/contexts/auth'
import { logoutFn } from '@/server/auth'

import { ThemeSwitcher } from './theme-switcher'
import { Button } from './ui/button'

export default function Header() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()
  const logout = useServerFn(logoutFn)

  const { mutate: handleLogout, isPending: isLoggingOut } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['currentUser'],
      })
    },
    onError: (error) => {
      toast.error('Failed to log out', {
        description: error.message,
      })
    },
  })

  return (
    <header className="sticky top-0 z-10 bg-background">
      <div
        className={`
          container mx-auto flex flex-row items-center justify-between px-6 py-4
        `}
      >
        <Link to="/">
          <CandlestickChartIcon className="size-8 text-primary" />
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          {isAuthenticated && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleLogout({})}
              disabled={isLoggingOut}
            >
              <LogOutIcon /> Log out
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
