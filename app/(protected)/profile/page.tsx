'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, Trophy, Link as LinkIcon, Settings } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function ProfilePage() {
  const { clUser } = useAuth()
  const [activeTab, setActiveTab] = React.useState<'posts' | 'experiences' | 'applications'>('posts')

  if (!clUser) {
    return (
      <div className='p-6 text-center py-20'>
        <p className='text-muted-foreground'>Loading profile...</p>
      </div>
    )
  }

  const initials = clUser.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <div className='space-y-6 p-6'>
      {/* Profile Header */}
      <div className='relative'>
        <div className='h-32 bg-gradient-to-r from-primary to-accent rounded-lg' />
        <div className='px-6 pb-6'>
          <div className='flex flex-col sm:flex-row items-end gap-4 -mt-16 relative z-10'>
            {clUser.photo_url ? (
              <img
                src={clUser.photo_url}
                alt={clUser.full_name}
                className='h-24 w-24 rounded-lg object-cover border-4 border-background'
              />
            ) : (
              <div className='h-24 w-24 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold border-4 border-background'>
                {initials}
              </div>
            )}
            <div className='flex-1'>
              <h1 className='text-3xl font-bold text-foreground'>{clUser.full_name}</h1>
              <p className='text-muted-foreground'>
                @{clUser.username}
                {clUser.college && ` • ${clUser.college}`}
              </p>
            </div>
            <Link href='/settings'>
              <Button variant='outline' className='gap-2'>
                <Settings className='h-4 w-4' />
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bio and Stats */}
      <Card>
        <CardContent className='pt-6 space-y-4'>
          {clUser.bio && (
            <p className='text-foreground'>{clUser.bio}</p>
          )}
          {clUser.current_company && (
            <p className='text-sm text-muted-foreground'>
              {clUser.current_role ? `${clUser.current_role} at ` : ''}
              {clUser.current_company}
            </p>
          )}
          <div className='flex flex-wrap gap-2'>
            {clUser.github_url && (
              <Badge variant='outline' size='sm' icon={<LinkIcon className='h-3 w-3' />}>
                GitHub
              </Badge>
            )}
            {clUser.linkedin_url && (
              <Badge variant='outline' size='sm' icon={<LinkIcon className='h-3 w-3' />}>
                LinkedIn
              </Badge>
            )}
            {clUser.open_to_opportunities && (
              <Badge variant='secondary' size='sm'>
                Open to Opportunities
              </Badge>
            )}
          </div>

          <div className='grid grid-cols-4 gap-4 pt-4 border-t border-border'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-primary'>{(clUser.points || 0).toLocaleString()}</div>
              <div className='text-xs text-muted-foreground'>Points</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-accent'>—</div>
              <div className='text-xs text-muted-foreground'>Experiences</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-secondary'>{clUser.followers_count || 0}</div>
              <div className='text-xs text-muted-foreground'>Followers</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-500'>{clUser.following_count || 0}</div>
              <div className='text-xs text-muted-foreground'>Following</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className='flex gap-2 border-b border-border'>
        {(['posts', 'experiences', 'applications'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className='space-y-4'>
        {activeTab === 'posts' && (
          <div className='text-center py-8'>
            <MessageSquare className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
            <p className='text-muted-foreground'>Your posts will appear here</p>
            <Link href='/feed' className='mt-2 inline-block'>
              <Button variant='outline' size='sm'>Go to Feed</Button>
            </Link>
          </div>
        )}

        {activeTab === 'experiences' && (
          <div className='text-center py-8'>
            <Trophy className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
            <p className='text-muted-foreground'>Your shared experiences will appear here</p>
            <Link href='/experiences/share' className='mt-2 inline-block'>
              <Button variant='outline' size='sm'>Share an Experience</Button>
            </Link>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className='text-center py-8'>
            <Trophy className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
            <p className='text-muted-foreground'>Your tracked applications will appear here</p>
            <Link href='/tracker' className='mt-2 inline-block'>
              <Button variant='outline' size='sm'>Go to Tracker</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
