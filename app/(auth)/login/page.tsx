import { Suspense } from 'react'
import LoginClient from './LoginClient'
export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#f9f9f7' }} />}>
      <LoginClient />
    </Suspense>
  )
}
