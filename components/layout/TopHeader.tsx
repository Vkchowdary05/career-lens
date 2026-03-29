'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuth } from '@/contexts/AuthContext'
import { notificationsApi } from '@/lib/api'
import Link from 'next/link'

export function TopHeader() {
  const { clUser } = useAuth()
  const router = useRouter()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  const loadUnreadCount = async () => {
    try {
      const data = await notificationsApi.getUnreadCount()
      setUnreadCount(data.unread_count || 0)
    } catch {}
  }

  const displayName = clUser?.full_name || 'User'
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className='sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur'>
      <div className='flex h-14 items-center justify-between px-6 gap-4'>
        {/* Search */}
        <div className='flex-1 max-w-md'>
          <Input
            type='search'
            placeholder='Search companies, experiences...'
            startIcon={<Search className='h-4 w-4' />}
            className='bg-muted border-transparent focus:border-ring h-8 text-sm'
          />
        </div>

        {/* Right Actions */}
        <div className='flex items-center gap-3'>
          {/* Notifications */}
          <Link href='/notifications'>
            <Button variant='ghost' size='icon' className='relative h-8 w-8'>
              <Bell className='h-4 w-4' />
              {unreadCount > 0 && (
                <span className='absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-bold'>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>
          </Link>

          {/* User Avatar */}
          <Link href='/profile'>
            <div className='flex items-center gap-2 px-2 py-1 rounded-md border border-border hover:bg-muted cursor-pointer transition-colors'>
              {clUser?.photo_url ? (
                <img src={clUser.photo_url} alt={displayName} className='h-6 w-6 rounded-full object-cover' />
              ) : (
                <div className='h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold'>
                  {initials}
                </div>
              )}
              <span className='text-sm font-medium hidden sm:block max-w-[100px] truncate'>
                {displayName}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  )
}
