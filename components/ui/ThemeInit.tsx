'use client'
import { useEffect } from 'react'

export default function ThemeInit() {
  useEffect(() => {
    const saved = localStorage.getItem('prairon_theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])
  return null
}
