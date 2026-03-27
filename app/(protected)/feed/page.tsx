'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Heart, MessageCircle, Share2, Search, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Post {
  id: number
  author: string
  initials: string
  company: string
  role: string
  difficulty: string
  rating: number
  timestamp: string
  description: string
  likes: number
  comments: number
  liked: boolean
}

const mockPosts: Post[] = [
  {
    id: 1,
    author: 'Sarah Chen',
    initials: 'SC',
    company: 'Google',
    role: 'Senior Software Engineer',
    difficulty: 'Hard',
    rating: 4.8,
    timestamp: '2 hours ago',
    description: 'Just shared my Google interview experience! 5 rounds of technical interviews covering system design, algorithms, and behavioral questions. The team was incredibly nice and process was smooth.',
    likes: 342,
    comments: 28,
    liked: false,
  },
  {
    id: 2,
    author: 'Alex Johnson',
    initials: 'AJ',
    company: 'Microsoft',
    role: 'Product Manager',
    difficulty: 'Medium',
    rating: 4.6,
    timestamp: '4 hours ago',
    description: 'Completed my Microsoft PM interview loop! Got an offer. Key takeaway: they really care about thinking deeply about user problems and cross-functional collaboration.',
    likes: 521,
    comments: 45,
    liked: false,
  },
  {
    id: 3,
    author: 'Emma Davis',
    initials: 'ED',
    company: 'Meta',
    role: 'Full Stack Engineer',
    difficulty: 'Hard',
    rating: 4.7,
    timestamp: '1 day ago',
    description: 'Meta interview journey done! The bar was high on system design. I learned so much from the process even though I didn\'t get an offer. Felt like a really good learning experience.',
    likes: 287,
    comments: 31,
    liked: false,
  },
]

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(post.liked)
  const [likeCount, setLikeCount] = useState(post.likes)

  const handleLike = () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
  }

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            <div className='h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm text-primary'>
              {post.initials}
            </div>
            <div>
              <p className='font-semibold text-sm'>{post.author}</p>
              <p className='text-xs text-muted-foreground'>{post.timestamp}</p>
            </div>
          </div>
          <Badge variant='outline' className='text-xs'>
            {post.rating}⭐
          </Badge>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Badge className='bg-primary/10 text-primary hover:bg-primary/20'>
            {post.company}
          </Badge>
          <Badge variant='secondary' className='text-xs'>
            {post.role}
          </Badge>
          <Badge
            variant='outline'
            className={cn(
              'text-xs',
              post.difficulty === 'Hard' && 'border-destructive text-destructive',
              post.difficulty === 'Medium' && 'border-yellow-500 text-yellow-600',
              post.difficulty === 'Easy' && 'border-green-500 text-green-600'
            )}
          >
            {post.difficulty}
          </Badge>
        </div>

        <p className='text-sm text-foreground leading-relaxed'>
          {post.description}
        </p>

        <div className='flex gap-4 pt-3 border-t border-border'>
          <button
            onClick={handleLike}
            className='flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors'
          >
            <Heart
              className={cn('h-4 w-4', liked && 'fill-current text-primary')}
            />
            <span>{likeCount}</span>
          </button>
          <button className='flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors'>
            <MessageCircle className='h-4 w-4' />
            <span>{post.comments}</span>
          </button>
          <button className='flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto'>
            <Share2 className='h-4 w-4' />
            <span>Share</span>
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FeedPage() {
  const [posts, setPosts] = useState(mockPosts)

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Community Feed</h1>
            <p className='text-muted-foreground'>
              Discover real interview experiences and insights from professionals
            </p>
          </div>
          <Link href='/experiences/share'>
            <Button className='gap-2'>
              <Plus className='h-4 w-4' />
              Share Experience
            </Button>
          </Link>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Feed */}
          <div className='lg:col-span-2 space-y-4'>
            {/* Search */}
            <Card>
              <CardContent className='pt-6'>
                <div className='flex items-center gap-2'>
                  <Search className='h-4 w-4 text-muted-foreground' />
                  <Input
                    placeholder='Search experiences...'
                    className='border-0 bg-transparent'
                  />
                </div>
              </CardContent>
            </Card>

            {/* Posts */}
            {posts.length > 0 ? (
              posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <Card>
                <CardContent className='pt-12 pb-12 text-center'>
                  <p className='text-muted-foreground'>No posts yet. Be the first to share!</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-4'>
            {/* Trending Companies */}
            <Card>
              <CardHeader className='pb-4'>
                <h3 className='font-bold text-sm'>Trending Companies</h3>
              </CardHeader>
              <CardContent className='space-y-3'>
                {[
                  { name: 'Google', posts: 245 },
                  { name: 'Microsoft', posts: 189 },
                  { name: 'Meta', posts: 156 },
                  { name: 'Amazon', posts: 142 },
                  { name: 'Apple', posts: 128 },
                ].map((company) => (
                  <button
                    key={company.name}
                    className='w-full text-left p-2 rounded-lg hover:bg-muted transition-colors group'
                  >
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-sm group-hover:text-primary'>
                        {company.name}
                      </span>
                      <Badge variant='outline' className='text-xs'>
                        {company.posts}
                      </Badge>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader className='pb-4'>
                <h3 className='font-bold text-sm'>Top Contributors</h3>
              </CardHeader>
              <CardContent className='space-y-3'>
                {[
                  { name: 'Alice Chen', contributions: 42, points: 4850 },
                  { name: 'Bob Smith', contributions: 38, points: 4120 },
                  { name: 'Carol Davis', contributions: 35, points: 3890 },
                ].map((user) => (
                  <div key={user.name} className='flex items-center justify-between p-2 rounded-lg hover:bg-muted'>
                    <div>
                      <p className='text-sm font-medium'>{user.name}</p>
                      <p className='text-xs text-muted-foreground'>{user.contributions} posts</p>
                    </div>
                    <Badge variant='secondary' className='text-xs'>
                      {user.points}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Leaderboard CTA */}
            <Card>
              <CardContent className='pt-6'>
                <Link href='/leaderboard' className='block'>
                  <Button className='w-full' variant='outline'>
                    View Full Leaderboard
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
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
