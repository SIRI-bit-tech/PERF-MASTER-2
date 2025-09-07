"use client"

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { apiClient } from '@/lib/api'

export function useAuthSync() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.accessToken) {
      // Set the token in the API client when session is available
      apiClient.setAuthToken(session.user.accessToken)
    } else if (status === 'unauthenticated') {
      // Clear the token when user is logged out
      apiClient.setAuthToken('')
    }
  }, [session, status])

  return { session, status }
}
