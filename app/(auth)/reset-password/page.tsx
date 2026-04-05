import { Suspense } from 'react'
import ResetPasswordClient from './ResetPasswordClient'
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:'100vh', background:'#f9f9f7' }} />}>
      <ResetPasswordClient />
    </Suspense>
  )
}
