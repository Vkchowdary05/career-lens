'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, MessageSquare, Trophy, Link as LinkIcon } from 'lucide-react'

export default function ProfilePage() {
  const [activeTab, setActiveTab] = React.useState<'posts' | 'experiences' | 'applications' | 'saved'>('posts')

  return (
    <div className='space-y-6 p-6'>
      {/* Profile Header */}
      <div className='relative'>
        <div className='h-32 bg-gradient-to-r from-primary to-accent rounded-lg' />
        <div className='px-6 pb-6'>
          <div className='flex flex-col sm:flex-row items-end gap-4 -mt-16 relative z-10'>
            <div className='h-24 w-24 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold border-4 border-background'>
              AJ
            </div>
            <div className='flex-1'>
              <h1 className='text-3xl font-bold text-foreground'>Alex Johnson</h1>
              <p className='text-muted-foreground'>@alexjohnson • MIT '22</p>
            </div>
            <Button variant='outline'>Edit Profile</Button>
          </div>
        </div>
      </div>

      {/* Bio and Stats */}
      <Card>
        <CardContent className='pt-6 space-y-4'>
          <p className='text-foreground'>
            Software Engineer at Google • Former Meta Intern • Passionate about system design and distributed systems.
          </p>
          <div className='flex flex-wrap gap-2'>
            <Badge variant='outline' size='sm' icon={<LinkIcon className='h-3 w-3' />}>
              github.com/alexjohnson
            </Badge>
            <Badge variant='outline' size='sm'>
              San Francisco, CA
            </Badge>
            <Badge variant='secondary' size='sm'>
              Open to Mentoring
            </Badge>
          </div>

          <div className='grid grid-cols-4 gap-4 pt-4 border-t border-border'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-primary'>1,250</div>
              <div className='text-xs text-muted-foreground'>Points</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-accent'>28</div>
              <div className='text-xs text-muted-foreground'>Experiences</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-secondary'>342</div>
              <div className='text-xs text-muted-foreground'>Followers</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-500'>156</div>
              <div className='text-xs text-muted-foreground'>Following</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className='flex gap-2 border-b border-border'>
        {(['posts', 'experiences', 'applications', 'saved'] as const).map((tab) => (
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
          <>
            {[1, 2].map((i) => (
              <Card key={i} hover>
                <CardContent className='pt-6'>
                  <p className='text-foreground mb-3'>
                    Just completed my system design interview at Google! The interviewer was really knowledgeable and the discussion was very insightful.
                  </p>
                  <div className='flex gap-4 text-muted-foreground text-sm'>
                    <span className='flex items-center gap-1'>
                      ❤️ {24 + i * 10}
                    </span>
                    <span className='flex items-center gap-1'>
                      <MessageSquare className='h-4 w-4' /> {8 + i * 3}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {activeTab === 'experiences' && (
          <>
            {[1, 2, 3].map((i) => (
              <Card key={i} hover>
                <CardContent className='pt-6'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <p className='font-bold text-foreground'>Google - SWE Interview</p>
                      <p className='text-sm text-muted-foreground'>5 rounds • Hard difficulty</p>
                    </div>
                    <Badge variant='secondary' size='sm'>4.8⭐</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {activeTab === 'applications' && (
          <div className='text-center py-8'>
            <Trophy className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
            <p className='text-muted-foreground'>Application tracking data coming soon</p>
          </div>
        )}

        {activeTab === 'saved' && (
          <div className='text-center py-8'>
            <Trophy className='h-12 w-12 mx-auto text-muted-foreground mb-3' />
            <p className='text-muted-foreground'>Saved items coming soon</p>
          </div>
        )}
      </div>
    </div>
  )
}
