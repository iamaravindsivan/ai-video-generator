import { cookies } from 'next/headers'
import { verifyJwt } from './jwt'
import type { AuthUser } from '@/types/user.types'

export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('token')
    
    if (!token?.value) {
      return null
    }
    
    const user = await verifyJwt(token.value)
    return user
  } catch (error) {
    console.error('Error getting server user:', error)
    return null
  }
}
