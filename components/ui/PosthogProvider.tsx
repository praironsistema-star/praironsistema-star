'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// PosthogProvider — Analytics de producto para PRAIRON
// Trackea: pageviews, eventos de módulos, conversión del onboarding
// ─────────────────────────────────────────────────────────────────────────────

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init('phc_ThmfXW3mCZ6u2Zdq8ymVmOn0AZhvmY7Goa5HRZGlVO6', {
      api_host: 'https://app.posthog.com',
      capture_pageview: true,        // Trackea pageviews automáticamente
      capture_pageleave: true,       // Trackea cuando el usuario sale
      autocapture: true,             // Captura clicks y eventos automáticamente
      persistence: 'localStorage',
      loaded: (ph) => {
        if (process.env.NODE_ENV === 'development') ph.opt_out_capturing()
      },
    })
  }, [])

  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
