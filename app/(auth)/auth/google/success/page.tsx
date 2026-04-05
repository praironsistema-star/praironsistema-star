'use client'
import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

function GoogleSuccessContent() {
  const router = useRouter()
  const params = useSearchParams()

  useEffect(() => {
    const token = params?.get('token')
    const userStr = params?.get('user')

    if (!token || !userStr) {
      router.replace('/login')
      return
    }

    try {
      const user = JSON.parse(decodeURIComponent(userStr))
      localStorage.setItem('prairon_token', token)
      localStorage.setItem('prairon_user', JSON.stringify(user))
      if (user.isNewUser) {
        router.replace('/onboarding')
      } else {
        router.replace('/dashboard')
      }
    } catch {
      router.replace('/login')
    }
  }, [])

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '48px', height: '48px', border: '3px solid #036446', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <div style={{ fontSize: '14px', color: '#9b9b97' }}>Iniciando sesión con Google...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function GoogleSuccessPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f9f9f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Figtree, sans-serif' }}>
      <Suspense fallback={<div style={{ fontSize: '14px', color: '#9b9b97' }}>Cargando...</div>}>
        <GoogleSuccessContent />
      </Suspense>
    </div>
  )
}
