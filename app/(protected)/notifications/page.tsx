'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Users, Zap, CheckCircle2 } from 'lucide-react'

const notifications = [
  {
    id: 1,
    type: 'like',
    user: 'Sarah Chen',
    action: 'liked your post',
    content: 'Google interview tips',
    time: '2 hours ago',
    unread: true,
    icon: <Heart className='h-4 w-4 text-destructive' />,
  },
  {
    id: 2,
    type: 'comment',
    user: 'Alex Johnson',
    action: 'commented on your experience',
    content: 'Meta PM interview',
    time: '5 hours ago',
    unread: true,
    icon: <MessageCircle className='h-4 w-4 text-blue-500' />,
  },
  {
    id: 3,
    type: 'follow',
    user: 'Emma Davis',
    action: 'started following you',
    content: '',
    time: '1 day ago',
    unread: false,
    icon: <Users className='h-4 w-4 text-primary' />,
  },
  {
    id: 4,
    type: 'achievement',
    user: 'System',
    action: 'You earned a badge',
    content: 'Interview Expert - 10 experiences',
    time: '2 days ago',
    unread: false,
    icon: <Zap className='h-4 w-4 text-yellow-500' />,
  },
]

export default function NotificationsPage() {
  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Notifications</h1>
          <p className='text-muted-foreground'>Stay updated with your activity</p>
        </div>
        <Button variant='outline' size='sm'>
          Mark all as read
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className='flex gap-2 overflow-x-auto pb-2'>
        {['All', 'Likes', 'Comments', 'Follows', 'System'].map((filter) => (
          <Button
            key={filter}
            variant={filter === 'All' ? 'default' : 'outline'}
            size='sm'
          >
            {filter}
          </Button>
        ))}
      </div>

      {/* Notifications List */}
      <div className='space-y-2'>
        {notifications.map((notif) => (
          <Card
            key={notif.id}
            className={`cursor-pointer transition-colors ${
              notif.unread ? 'bg-primary/5 border-primary/20' : ''
            }`}
            hover
          >
            <CardContent className='flex items-start justify-between pt-6'>
              <div className='flex items-start gap-4 flex-1'>
                <div className='mt-1 p-2 rounded-lg bg-muted'>
                  {notif.icon}
                </div>
                <div className='flex-1'>
                  <p className='font-semibold text-foreground'>
                    {notif.user}{' '}
                    <span className='font-normal text-muted-foreground'>
                      {notif.action}
                    </span>
                  </p>
                  {notif.content && (
                    <p className='text-sm text-muted-foreground mt-1'>
                      "{notif.content}"
                    </p>
                  )}
                  <p className='text-xs text-muted-foreground mt-2'>
                    {notif.time}
                  </p>
                </div>
              </div>
              {notif.unread && (
                <div className='h-2 w-2 rounded-full bg-primary mt-2 ml-2' />
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
