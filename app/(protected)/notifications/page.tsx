'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Users, Zap, Bell } from 'lucide-react'
import { notificationsApi } from '@/lib/api'
import { formatRelativeTime } from '@/lib/formatters'

interface Notification {
  id: string
  type: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

const ICON_MAP: Record<string, React.ReactNode> = {
  like: <Heart className='h-4 w-4 text-destructive' />,
  comment: <MessageCircle className='h-4 w-4 text-blue-500' />,
  follow: <Users className='h-4 w-4 text-primary' />,
  points: <Zap className='h-4 w-4 text-yellow-500' />,
  system: <Bell className='h-4 w-4 text-muted-foreground' />,
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadNotifications(1)
  }, [activeFilter])

  const loadNotifications = async (pageNum: number) => {
    setLoading(pageNum === 1)
    try {
      const type = activeFilter !== 'all' ? activeFilter : undefined
      const data = await notificationsApi.list(pageNum, type)
      const list = data.notifications || data || []
      if (pageNum === 1) {
        setNotifications(list)
      } else {
        setNotifications((prev) => [...prev, ...list])
      }
      setHasMore(data.has_more || false)
      setPage(pageNum)
    } catch (e) {
      console.error('Failed to load notifications', e)
    } finally {
      setLoading(false)
    }
  }

  const filters = ['all', 'like', 'comment', 'follow', 'points', 'system']

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Notifications</h1>
          <p className='text-muted-foreground'>Stay updated with your activity</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className='flex gap-2 overflow-x-auto pb-2'>
        {filters.map((filter) => (
          <Button
            key={filter}
            variant={activeFilter === filter ? 'default' : 'outline'}
            size='sm'
            onClick={() => setActiveFilter(filter)}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className='space-y-2'>
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className='pt-6'>
                <div className='animate-pulse flex items-start gap-4'>
                  <div className='h-10 w-10 bg-muted rounded-lg' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-4 bg-muted rounded w-3/4' />
                    <div className='h-3 bg-muted rounded w-1/4' />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className='pt-12 pb-12 text-center'>
              <Bell className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <p className='text-muted-foreground'>No notifications yet. Start engaging with the community!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {notifications.map((notif) => (
              <Card
                key={notif.id}
                className={`cursor-pointer transition-colors ${
                  !notif.is_read ? 'bg-primary/5 border-primary/20' : ''
                }`}
              >
                <CardContent className='flex items-start justify-between pt-6'>
                  <div className='flex items-start gap-4 flex-1'>
                    <div className='mt-1 p-2 rounded-lg bg-muted'>
                      {ICON_MAP[notif.type] || ICON_MAP.system}
                    </div>
                    <div className='flex-1'>
                      <p className='text-sm text-foreground'>{notif.message}</p>
                      <p className='text-xs text-muted-foreground mt-2'>
                        {notif.created_at ? formatRelativeTime(new Date(notif.created_at)) : ''}
                      </p>
                    </div>
                  </div>
                  {!notif.is_read && (
                    <div className='h-2 w-2 rounded-full bg-primary mt-2 ml-2' />
                  )}
                </CardContent>
              </Card>
            ))}
            {hasMore && (
              <Button
                variant='outline'
                className='w-full'
                onClick={() => loadNotifications(page + 1)}
              >
                Load More
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
