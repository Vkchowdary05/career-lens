'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Heart, MessageCircle, Share2, Search } from 'lucide-react'

export default function FeedPage() {
  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='space-y-2'>
        <h1 className='text-3xl font-bold text-foreground'>Social Feed</h1>
        <p className='text-muted-foreground'>Discover insights from the community</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
        {/* Main Feed - 3 columns */}
        <div className='lg:col-span-2 space-y-4'>
          {/* Post Composer */}
          <Card>
            <CardContent className='pt-6'>
              <div className='space-y-4'>
                <div className='flex items-center gap-4'>
                  <div className='h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold'>
                    AJ
                  </div>
                  <Input
                    placeholder='Share your interview experience...'
                    className='flex-1'
                  />
                </div>
                <div className='flex justify-end'>
                  <Button size='sm'>Post</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post Cards */}
          {[1, 2, 3].map((i) => (
            <Card key={i} hover>
              <CardHeader>
                <div className='flex items-start justify-between'>
                  <div className='flex items-center gap-3 flex-1'>
                    <div className='h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold text-sm'>
                      {String.fromCharCode(64 + i)}
                    </div>
                    <div>
                      <p className='font-semibold text-foreground'>User {i}</p>
                      <p className='text-xs text-muted-foreground'>2 hours ago</p>
                    </div>
                  </div>
                  <Badge variant='outline' size='sm'>Following</Badge>
                </div>
              </CardHeader>
              <CardContent className='space-y-3'>
                <p className='text-foreground'>
                  Just finished my Google interview round! The behavioral round was focused on leadership and handling conflicts. Great discussion overall.
                </p>
                <div className='flex gap-2'>
                  <Badge variant='outline' size='sm'>Google</Badge>
                  <Badge variant='outline' size='sm'>Interview Tips</Badge>
                </div>
              </CardContent>
              <div className='px-6 py-3 border-t border-border flex items-center justify-around text-muted-foreground'>
                <button className='flex items-center gap-2 hover:text-primary transition-colors'>
                  <Heart className='h-4 w-4' />
                  <span className='text-xs'>24</span>
                </button>
                <button className='flex items-center gap-2 hover:text-primary transition-colors'>
                  <MessageCircle className='h-4 w-4' />
                  <span className='text-xs'>8</span>
                </button>
                <button className='flex items-center gap-2 hover:text-primary transition-colors'>
                  <Share2 className='h-4 w-4' />
                  <span className='text-xs'>3</span>
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Right Sidebar - 1 column */}
        <div className='lg:col-span-2 space-y-4'>
          {/* Trending Companies */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Trending Companies</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {['Google', 'Microsoft', 'Meta', 'Apple', 'Amazon'].map((company) => (
                <div
                  key={company}
                  className='flex items-center justify-between p-2 rounded hover:bg-muted transition-colors cursor-pointer'
                >
                  <div>
                    <p className='font-medium text-foreground'>{company}</p>
                    <p className='text-xs text-muted-foreground'>1.2K discussions</p>
                  </div>
                  <Badge variant='secondary' size='sm'>+</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Contributors */}
          <Card>
            <CardHeader>
              <CardTitle className='text-lg'>Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='flex items-center justify-between p-2 rounded hover:bg-muted transition-colors'
                >
                  <div className='flex items-center gap-2'>
                    <div className='h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold'>
                      {i}
                    </div>
                    <div>
                      <p className='text-sm font-medium text-foreground'>User {i}</p>
                      <p className='text-xs text-muted-foreground'>{i * 250} pts</p>
                    </div>
                  </div>
                  <Button variant='ghost' size='sm'>Follow</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
