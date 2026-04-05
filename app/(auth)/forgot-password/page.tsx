import { Suspense } from 'react'
import ForgotPasswordClient from './ForgotPasswordClient'
export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#f9f9f7' }} />}>
      <ForgotPasswordClient />
    </Suspense>
  )
}
