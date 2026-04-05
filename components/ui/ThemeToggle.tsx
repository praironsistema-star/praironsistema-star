'use client'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem('prairon_theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])

  function toggle() {
    const next = !dark
    setDark(next)
    document.documentElement.setAttribute('data-theme', next ? 'dark' : 'light')
    localStorage.setItem('prairon_theme', next ? 'dark' : 'light')
  }

  if (!mounted) return <div style={{ width: '36px', height: '20px' }} />

  return (
    <button onClick={toggle}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      style={{
        width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer', padding: 0,
        background: dark ? '#0dac5e' : '#e5e5e3', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
      <div style={{
        width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
        position: 'absolute', top: '3px', transition: 'left 0.2s',
        left: dark ? '19px' : '3px',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '8px',
      }}>
        {dark ? '🌙' : '☀'}
      </div>
    </button>
  )
}
