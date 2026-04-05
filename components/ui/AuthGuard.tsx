'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function AuthGuard() {
  const router = useRouter()
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.removeItem('prairon_token')
        localStorage.removeItem('prairon_user')
        router.push('/login')
      }
      if (session) {
        localStorage.setItem('prairon_token', session.access_token)
      }
    })
    return () => subscription.unsubscribe()
  }, [router])
  return null
}
