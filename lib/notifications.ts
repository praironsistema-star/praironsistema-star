'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { getUser } from './auth'

export interface Notification {
  id: string
  type: 'alert' | 'task' | 'ods' | 'system'
  title: string
  message: string
  severity: 'info' | 'warning' | 'error' | 'success'
  createdAt: string
  read: boolean
}

let socket: Socket | null = null

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [connected, setConnected] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const user = getUser()
    if (!user) return

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

    socket = io(API_URL + '/notifications', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
    })

    socket.on('connect', () => {
      setConnected(true)
      socket?.emit('join', {
        companyId: user.companyId,
        userId: user.id,
      })
    })

    socket.on('disconnect', () => setConnected(false))

    socket.on('notification', (data: Omit<Notification, 'id' | 'read'>) => {
      const notification: Notification = {
        ...data,
        id: Date.now().toString(),
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
      setUnreadCount(prev => prev + 1)
    })

    socket.on('new_alert', (data: any) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'alert',
        title: data.title || 'Nueva alerta',
        message: data.message,
        severity: data.severity || 'warning',
        createdAt: data.createdAt || new Date().toISOString(),
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
      setUnreadCount(prev => prev + 1)
    })

    socket.on('task_update', (data: any) => {
      const notification: Notification = {
        id: Date.now().toString(),
        type: 'task',
        title: data.title || 'Tarea actualizada',
        message: data.message,
        severity: 'info',
        createdAt: data.createdAt || new Date().toISOString(),
        read: false,
      }
      setNotifications(prev => [notification, ...prev].slice(0, 50))
      setUnreadCount(prev => prev + 1)
    })

    return () => {
      socket?.disconnect()
      socket = null
      setConnected(false)
    }
  }, [])

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
    setUnreadCount(0)
  }, [])

  return { notifications, connected, unreadCount, markAllRead, markRead, clearAll }
}
