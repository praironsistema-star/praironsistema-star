'use client'
import { useEffect } from 'react'

const BACKEND = process.env.NEXT_PUBLIC_API_URL || 'https://prairon-backend-1.onrender.com'
const INTERVAL = 14 * 60 * 1000 // 14 minutos

export function WakeUpPing() {
  useEffect(() => {
    const ping = () => {
      fetch(`${BACKEND}/health`, { method: 'GET', cache: 'no-store' })
        .catch(() => {}) // silencioso — no importa si falla
    }
    ping() // ping inmediato al cargar
    const id = setInterval(ping, INTERVAL)
    return () => clearInterval(id)
  }, [])
  return null
}
