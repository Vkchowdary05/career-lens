'use client'

import React from 'react'
import { Search, Bell, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Modal'

export function TopHeader() {
  const [hasNotifications, setHasNotifications] = React.useState(true)

  return (
    <header className='sticky top-0 z-30 ml-64 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-16 items-center justify-between px-6 gap-4'>
        {/* Search */}
        <div className='flex-1 max-w-md'>
          <Input
            type='search'
            placeholder='Search companies, roles, topics...'
            startIcon={<Search className='h-4 w-4' />}
            className='bg-muted border-muted'
          />
        </div>

        {/* Right Actions */}
        <div className='flex items-center gap-3 ml-auto'>
          {/* Notifications */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='relative'
                onClick={() => setHasNotifications(false)}
              >
                <Bell className='h-5 w-5' />
                {hasNotifications && (
                  <span className='absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full animate-pulse' />
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Notifications</DialogTitle>
                <DialogDescription>
                  You have 3 new notifications
                </DialogDescription>
              </DialogHeader>
              <div className='space-y-3'>
                <div className='p-3 rounded-md bg-muted hover:bg-muted/80 cursor-pointer transition-colors'>
                  <p className='text-sm font-medium'>New interview experience</p>
                  <p className='text-xs text-muted-foreground mt-1'>
                    Sarah posted about Google interview
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Avatar Dropdown */}
          <div className='flex items-center gap-2 px-3 py-2 rounded-md border border-border hover:bg-muted cursor-pointer group transition-colors'>
            <div className='flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold'>
              AJ
            </div>
            <ChevronDown className='h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors' />
          </div>
        </div>
      </div>
    </header>
  )
}
