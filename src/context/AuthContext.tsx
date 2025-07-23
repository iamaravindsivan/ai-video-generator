'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { logout as apiLogout } from '@/services/authApi';
import type { AuthUser } from '@/types/user.types'

type AuthContextType = {
  user: AuthUser | null
  setUser: (user: AuthUser | null) => void
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({
  children,
  user: initialUser,
}: {
  children: React.ReactNode
  user: AuthUser | null
}) {
  const [user, setUser] = useState<AuthUser | null>(initialUser)
  const [isLoading, setIsLoading] = useState(false)

  const logout = useCallback(async () => {
    setIsLoading(true)
    try {
      await apiLogout()
    } catch (err) {
      console.error('Logout failed', err)
    } finally {
      setUser(null)
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}
