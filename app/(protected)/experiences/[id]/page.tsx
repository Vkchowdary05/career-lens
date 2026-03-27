'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ThumbsUp, MessageCircle, Share2, Bookmark } from 'lucide-react'

export default function ExperienceDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className='space-y-6 p-6'>
      <div className='grid lg:grid-cols-3 gap-6'>
        {/* Main Content */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Header */}
          <Card>
            <CardHeader>
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold'>
                      GO
                    </div>
                    <div>
                      <p className='font-bold text-lg text-foreground'>Google</p>
                      <p className='text-sm text-muted-foreground'>Senior Software Engineer</p>
                    </div>
                  </div>
                </div>
                <Badge variant='secondary'>Hard</Badge>
              </div>
              <CardTitle className='text-2xl'>My Google SWE Interview Experience</CardTitle>
              <CardDescription>
                Shared by Sarah Chen • 2 weeks ago
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Rounds Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                📋 Interview Rounds (5)
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {[
                { name: 'Phone Screen', duration: '30 min', difficulty: 'Easy' },
                { name: 'Technical Round 1', duration: '60 min', difficulty: 'Medium' },
                { name: 'Technical Round 2', duration: '60 min', difficulty: 'Hard' },
                { name: 'System Design', duration: '60 min', difficulty: 'Hard' },
                { name: 'Behavioral', duration: '45 min', difficulty: 'Medium' },
              ].map((round, i) => (
                <div
                  key={i}
                  className='p-3 rounded-lg border border-border hover:bg-muted transition-colors'
                >
                  <div className='flex items-center justify-between'>
                    <div>
                      <p className='font-medium text-foreground'>{round.name}</p>
                      <p className='text-xs text-muted-foreground'>{round.duration}</p>
                    </div>
                    <Badge
                      variant={
                        round.difficulty === 'Hard'
                          ? 'destructive'
                          : round.difficulty === 'Medium'
                          ? 'warning'
                          : 'success'
                      }
                      size='sm'
                    >
                      {round.difficulty}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Key Questions */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                ❓ Key Questions Asked
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              {[
                'Design a URL shortener',
                'Implement LRU cache with TTL',
                'Given an array of transactions, find fraud patterns',
                'Tell me about a time you handled a production issue',
              ].map((question, i) => (
                <div key={i} className='p-3 rounded-lg bg-muted'>
                  <p className='text-sm text-foreground'>{question}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Resources */}
          <Card>
            <CardHeader>
              <CardTitle>📚 Useful Resources</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              {[
                'System Design Primer',
                'LeetCode - Top 100 Liked Questions',
                'Educative - Grokking System Design',
              ].map((resource, i) => (
                <div
                  key={i}
                  className='flex items-center justify-between p-2 rounded hover:bg-muted'
                >
                  <p className='text-sm text-foreground'>{resource}</p>
                  <Badge variant='outline' size='sm'>→</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <CardTitle>Comments & Discussion</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <textarea
                placeholder='Share your thoughts or questions...'
                className='w-full p-3 rounded-md border border-input bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary'
                rows={3}
              />
              <Button>Post Comment</Button>

              <div className='space-y-3 mt-4'>
                {[1, 2].map((i) => (
                  <div key={i} className='p-3 rounded-lg bg-muted'>
                    <div className='flex items-center gap-2 mb-2'>
                      <div className='h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold'>
                        U{i}
                      </div>
                      <div>
                        <p className='font-medium text-sm text-foreground'>User {i}</p>
                        <p className='text-xs text-muted-foreground'>1 day ago</p>
                      </div>
                    </div>
                    <p className='text-sm text-foreground'>
                      Great writeup! How long did the entire process take?
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className='space-y-4'>
          {/* Author Card */}
          <Card>
            <CardHeader>
              <CardTitle className='text-base'>About Author</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center gap-3'>
                <div className='h-12 w-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold'>
                  SC
                </div>
                <div>
                  <p className='font-medium text-foreground'>Sarah Chen</p>
                  <p className='text-xs text-muted-foreground'>@sarahchen</p>
                </div>
              </div>
              <p className='text-sm text-foreground'>
                SWE at Google. Passionate about system design and distributed systems.
              </p>
              <Button className='w-full' variant='outline' size='sm'>
                Follow
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className='pt-6 space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Rating</span>
                <Badge variant='secondary'>4.8 ⭐</Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Likes</span>
                <span className='font-bold text-foreground'>328</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Comments</span>
                <span className='font-bold text-foreground'>45</span>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='flex gap-2'>
            <Button className='flex-1' size='sm' variant='outline' className='gap-2'>
              <ThumbsUp className='h-4 w-4' />
              Like
            </Button>
            <Button className='flex-1' size='sm' variant='outline' className='gap-2'>
              <Bookmark className='h-4 w-4' />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
