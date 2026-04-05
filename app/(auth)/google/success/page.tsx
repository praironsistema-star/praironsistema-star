'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function GoogleSuccessInner() {
  const router       = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const user  = searchParams.get('user')

    if (!token) {
      router.replace('/login?error=google_failed')
      return
    }

    try {
      localStorage.setItem('token', token)
      if (user) {
        localStorage.setItem('user', decodeURIComponent(user))
      }
      router.replace('/dashboard')
    } catch {
      router.replace('/login?error=google_failed')
    }
  }, [router, searchParams])

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f9f9f7', flexDirection:'column', gap:'16px' }}>
      <div style={{ width:'40px', height:'40px', border:'3px solid #e5e5e3', borderTopColor:'#036446', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
      <div style={{ fontSize:'14px', color:'#6b6b67' }}>Entrando a PRAIRON...</div>
      <style>{'@keyframes spin { to { transform: rotate(360deg) } }'}</style>
    </div>
  )
}

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#f9f9f7' }} />}>
      <GoogleSuccessInner />
    </Suspense>
  )
}
