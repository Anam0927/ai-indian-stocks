import type { ReactNode } from 'react'

import { useQuery } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { createContext, use } from 'react'

import { getCurrentUserStatusFn } from '@/server/auth'

interface AuthContextType {
  isAuthenticated?: boolean | null
  isLoading: boolean
  refetch: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const getCurrentUserFn = useServerFn(getCurrentUserStatusFn)

  const {
    data: isAuthenticated,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      return await getCurrentUserFn()
    },
    select: (data) => {
      return data.isAuthenticated
    },
  })

  return (
    <AuthContext value={{ isAuthenticated, isLoading, refetch }}>
      {children}
    </AuthContext>
  )
}

export function useAuth() {
  const context = use(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
