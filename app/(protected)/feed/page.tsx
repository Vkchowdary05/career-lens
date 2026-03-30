'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Heart, MessageCircle, Share2, Search, Plus, Briefcase, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { feedApi } from '@/lib/api'
import { formatRelativeTime } from '@/lib/formatters'

interface Post {
  id: string
  author_id: string
  content: string
  post_type: string
  tags: string[]
  likes_count: number
  comments_count: number
  is_liked: boolean
  created_at: string
  image_url?: string
  company_name?: string
  role_title?: string
  location?: string
  package_range?: string
  apply_url?: string
  author?: {
    username: string
    full_name: string
    photo_url?: string
  }
}

function PostCard({ post, onLike }: { post: Post; onLike: (id: string) => void }) {
  const [liked, setLiked] = useState(post.is_liked)
  const [likeCount, setLikeCount] = useState(post.likes_count)
  const [showComments, setShowComments] = useState(false)
  const [comment, setComment] = useState('')

  const handleLike = async () => {
    try {
      setLiked(!liked)
      setLikeCount(liked ? likeCount - 1 : likeCount + 1)
      await feedApi.toggleLike(post.id)
    } catch {
      setLiked(liked)
      setLikeCount(liked ? likeCount + 1 : likeCount - 1)
    }
  }

  const initials = post.author?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  return (
    <Card className='hover:shadow-md transition-shadow'>
      <CardHeader className='pb-3'>
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-3'>
            {post.author?.photo_url ? (
              <img
                src={post.author.photo_url}
                alt={post.author.full_name}
                className='h-10 w-10 rounded-full object-cover'
              />
            ) : (
              <div className='h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-sm text-primary'>
                {initials}
              </div>
            )}
            <div>
              <Link href={`/profile/${post.author?.username}`}>
                <p className='font-semibold text-sm hover:underline'>{post.author?.full_name || 'Unknown'}</p>
              </Link>
              <p className='text-xs text-muted-foreground'>
                @{post.author?.username} · {formatRelativeTime(new Date(post.created_at))}
              </p>
            </div>
          </div>
          {post.post_type !== 'general' && (
            <Badge variant={post.post_type === 'job_post' ? 'default' : 'secondary'} size='sm'>
              {post.post_type === 'job_post' ? '💼 Job' : '🎓 Internship'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-3'>
        {post.post_type !== 'general' && post.company_name && (
          <div className='rounded-lg border border-border p-3 space-y-2 bg-muted/30'>
            <div className='flex items-center gap-2'>
              <Briefcase className='h-4 w-4 text-primary' />
              <span className='font-medium text-sm'>{post.company_name}</span>
              {post.role_title && (
                <span className='text-muted-foreground text-sm'>— {post.role_title}</span>
              )}
            </div>
            {post.location && (
              <p className='text-xs text-muted-foreground'>📍 {post.location}</p>
            )}
            {post.package_range && (
              <p className='text-xs text-muted-foreground'>💰 {post.package_range}</p>
            )}
            {post.apply_url && (
              <a
                href={post.apply_url}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1 text-xs text-primary hover:underline'
              >
                Apply Now <ExternalLink className='h-3 w-3' />
              </a>
            )}
          </div>
        )}

        <p className='text-sm text-foreground leading-relaxed'>{post.content}</p>

        {post.image_url && (
          <img
            src={post.image_url}
            alt='Post image'
            className='rounded-lg max-h-64 w-full object-cover'
          />
        )}

        {post.tags && post.tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {post.tags.map((tag) => (
              <Badge key={tag} variant='outline' size='sm'>
                #{tag}
              </Badge>
            ))}
          </div>
        )}

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
          <button
            onClick={() => setShowComments(!showComments)}
            className='flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors'
          >
            <MessageCircle className='h-4 w-4' />
            <span>{post.comments_count}</span>
          </button>
          <button className='flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors ml-auto'>
            <Share2 className='h-4 w-4' />
            <span>Share</span>
          </button>
        </div>

        {showComments && (
          <div className='pt-2 space-y-3 border-t border-border'>
            <div className='flex gap-2'>
              <Input
                placeholder='Write a comment...'
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className='flex-1 h-8 text-xs'
              />
              <Button
                size='sm'
                onClick={async () => {
                  if (!comment.trim()) return
                  try {
                    await feedApi.addComment(post.id, comment)
                    setComment('')
                  } catch (e) {
                    console.error(e)
                  }
                }}
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CreatePostCard({ onPost }: { onPost: (post: Post) => void }) {
  const [content, setContent] = useState('')
  const [postType, setPostType] = useState('general')
  const [isPosting, setIsPosting] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [location, setLocation] = useState('')
  const [packageRange, setPackageRange] = useState('')
  const [applyUrl, setApplyUrl] = useState('')

  const isJobType = postType === 'job_post' || postType === 'internship_post'

  const handleSubmit = async () => {
    if (!content.trim()) return
    setIsPosting(true)
    try {
      const payload: Record<string, any> = { content, post_type: postType, tags: [] }
      if (isJobType) {
        if (companyName) payload.company_name = companyName
        if (roleTitle) payload.role_title = roleTitle
        if (location) payload.location = location
        if (packageRange) payload.package_range = packageRange
        if (applyUrl) payload.apply_url = applyUrl
      }
      const newPost = await feedApi.createPost(payload)
      setContent('')
      setCompanyName('')
      setRoleTitle('')
      setLocation('')
      setPackageRange('')
      setApplyUrl('')
      setPostType('general')
      onPost(newPost)
    } catch (e) {
      console.error(e)
    } finally {
      setIsPosting(false)
    }
  }

  return (
    <Card>
      <CardContent className='pt-4 space-y-3'>
        <textarea
          placeholder="What's on your mind? Share tips, experiences, or opportunities..."
          className='w-full p-3 rounded-md border border-input bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none'
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        {isJobType && (
          <div className='grid grid-cols-2 gap-2 p-3 rounded-md border border-border bg-muted/30'>
            <Input placeholder='Company Name' value={companyName} onChange={(e) => setCompanyName(e.target.value)} className='h-8 text-xs' />
            <Input placeholder='Role Title' value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} className='h-8 text-xs' />
            <Input placeholder='Location' value={location} onChange={(e) => setLocation(e.target.value)} className='h-8 text-xs' />
            <Input placeholder='Package Range (e.g., 10-15 LPA)' value={packageRange} onChange={(e) => setPackageRange(e.target.value)} className='h-8 text-xs' />
            <Input placeholder='Apply URL (optional)' value={applyUrl} onChange={(e) => setApplyUrl(e.target.value)} className='h-8 text-xs col-span-2' />
          </div>
        )}

        <div className='flex items-center justify-between'>
          <div className='flex gap-2'>
            {['general', 'job_post', 'internship_post'].map((type) => (
              <button
                key={type}
                onClick={() => setPostType(type)}
                className={cn(
                  'text-xs px-2 py-1 rounded-md border transition-colors',
                  postType === type
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                {type === 'general' ? '💬 Post' : type === 'job_post' ? '💼 Job' : '🎓 Internship'}
              </button>
            ))}
          </div>
          <Button size='sm' onClick={handleSubmit} disabled={isPosting || !content.trim()}>
            {isPosting ? 'Posting...' : 'Post'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FeedPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [feedType, setFeedType] = useState<'latest' | 'following' | 'for_you'>('for_you')
  const [searchQuery, setSearchQuery] = useState('')
  const [trendingCompanies, setTrendingCompanies] = useState<any[]>([])
  const [topContributors, setTopContributors] = useState<any[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [selectedInterests, setSelectedInterests] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cl_interests')
      return saved ? JSON.parse(saved) : ['Engineering']
    }
    return ['Engineering']
  })

  const INTERESTS = [
    { label: '💻 SWE', value: 'Engineering' },
    { label: '📊 Data', value: 'Data' },
    { label: '📦 Product', value: 'Product' },
    { label: '🎨 Design', value: 'Design' },
    { label: '⚙️ DevOps', value: 'DevOps' },
    { label: '🔒 Security', value: 'Security' },
    { label: '📱 Mobile', value: 'Mobile' },
    { label: '☁️ Cloud', value: 'Cloud' },
  ]

  const toggleInterest = (value: string) => {
    const next = selectedInterests.includes(value)
      ? selectedInterests.filter((i) => i !== value)
      : [...selectedInterests, value]
    setSelectedInterests(next)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cl_interests', JSON.stringify(next))
    }
  }

  useEffect(() => {
    loadPosts()
    loadSidebarData()
  }, [feedType])

  const loadPosts = async (pageNum = 1) => {
    setLoading(true)
    try {
      // "for_you" is client-side filtering — fetch as "latest" from API
      const apiFeedType = feedType === 'for_you' ? 'latest' : feedType
      const data = await feedApi.getPosts(pageNum, apiFeedType)
      if (pageNum === 1) {
        setPosts(data.posts || [])
      } else {
        setPosts((prev) => [...prev, ...(data.posts || [])])
      }
      setHasMore(data.has_more || false)
      setPage(pageNum)
    } catch (e) {
      console.error('Failed to load posts', e)
    } finally {
      setLoading(false)
    }
  }

  const loadSidebarData = async () => {
    try {
      const [companies, contributors] = await Promise.all([
        feedApi.getTrendingCompanies(),
        feedApi.getTopContributors(),
      ])
      setTrendingCompanies(companies || [])
      setTopContributors(contributors || [])
    } catch (e) {
      console.error('Failed to load sidebar data', e)
    }
  }

  const handleNewPost = (post: Post) => {
    setPosts((prev) => [post, ...prev])
  }

  const filteredPosts = posts.filter((p) => {
    // Text search filter
    const matchesSearch =
      !searchQuery ||
      p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.author?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.company_name || '').toLowerCase().includes(searchQuery.toLowerCase())

    // Personalization filter for "For You" tab
    if (feedType === 'for_you' && selectedInterests.length > 0) {
      const postText = `${p.content} ${p.tags?.join(' ')} ${p.role_title || ''} ${p.company_name || ''}`.toLowerCase()
      const interestKeywords: Record<string, string[]> = {
        Engineering: ['engineer', 'software', 'developer', 'sde', 'backend', 'frontend', 'fullstack', 'java', 'python', 'react', 'node', 'code', 'algo'],
        Data: ['data', 'ml', 'ai', 'machine learning', 'analytics', 'sql', 'spark', 'etl', 'scientist', 'analyst'],
        Product: ['product', 'pm', 'roadmap', 'strategy', 'stakeholder', 'ux', 'user research'],
        Design: ['design', 'ui', 'ux', 'figma', 'visual', 'creative', 'brand', 'sketch'],
        DevOps: ['devops', 'docker', 'kubernetes', 'k8s', 'ci/cd', 'aws', 'gcp', 'azure', 'terraform', 'infrastructure'],
        Security: ['security', 'cyber', 'pentest', 'soc', 'devsecops', 'vulnerability', 'siem'],
        Mobile: ['mobile', 'android', 'ios', 'flutter', 'react native', 'swift', 'kotlin'],
        Cloud: ['cloud', 'aws', 'azure', 'gcp', 'serverless', 'microservices', 'sre'],
      }
      const matchesInterest = selectedInterests.some((interest) =>
        (interestKeywords[interest] || []).some((kw) => postText.includes(kw))
      )
      return matchesSearch && (matchesInterest || p.tags?.some((t) => selectedInterests.includes(t)))
    }

    return matchesSearch
  })

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-6xl mx-auto'>
        <div className='mb-6 flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold mb-1'>Community Feed</h1>
            <p className='text-muted-foreground text-sm'>
              Discover real interview experiences and insights
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
            {/* Create Post */}
            <CreatePostCard onPost={handleNewPost} />

            {/* Feed Tabs */}
            <div className='flex gap-2 flex-wrap'>
              {(['for_you', 'latest', 'following'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFeedType(type)}
                  className={cn(
                    'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                    feedType === type
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {type === 'for_you' ? '✨ For You' : type === 'latest' ? '🕐 Latest' : '👥 Following'}
                </button>
              ))}
            </div>

            {/* Interest Filters (only for For You tab) */}
            {feedType === 'for_you' && (
              <div className='flex flex-wrap gap-2'>
                <span className='text-xs text-muted-foreground self-center'>Interests:</span>
                {INTERESTS.map((interest) => (
                  <button
                    key={interest.value}
                    onClick={() => toggleInterest(interest.value)}
                    className={cn(
                      'text-xs px-3 py-1 rounded-full border transition-all',
                      selectedInterests.includes(interest.value)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'border-border text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {interest.label}
                  </button>
                ))}
              </div>
            )}

            {/* Search */}
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <input
                placeholder='Search posts...'
                className='w-full pl-9 pr-3 py-2 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Posts */}
            {loading && page === 1 ? (
              <div className='space-y-4'>
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className='pt-6'>
                      <div className='animate-pulse space-y-3'>
                        <div className='flex gap-3'>
                          <div className='h-10 w-10 rounded-full bg-muted' />
                          <div className='space-y-2 flex-1'>
                            <div className='h-4 bg-muted rounded w-1/3' />
                            <div className='h-3 bg-muted rounded w-1/4' />
                          </div>
                        </div>
                        <div className='h-16 bg-muted rounded' />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <Card>
                <CardContent className='pt-12 pb-12 text-center'>
                  <p className='text-muted-foreground'>
                    {feedType === 'following'
                      ? 'No posts from people you follow yet. Follow some users!'
                      : 'No posts yet. Be the first to share!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} onLike={() => {}} />
                ))}
                {hasMore && (
                  <Button
                    variant='outline'
                    className='w-full'
                    onClick={() => loadPosts(page + 1)}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load More'}
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className='space-y-4'>
            {/* Trending Companies */}
            <Card>
              <CardHeader className='pb-3'>
                <h3 className='font-bold text-sm'>🔥 Trending Companies</h3>
              </CardHeader>
              <CardContent className='space-y-2'>
                {trendingCompanies.length > 0 ? (
                  trendingCompanies.map((company: any, i: number) => (
                    <Link
                      key={company.slug || i}
                      href={`/companies/${company.slug}`}
                      className='flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors group'
                    >
                      <span className='font-medium text-sm group-hover:text-primary'>
                        {company.name}
                      </span>
                      <Badge variant='outline' size='sm'>
                        {company.count} exp
                      </Badge>
                    </Link>
                  ))
                ) : (
                  ['Google', 'Microsoft', 'Amazon', 'Meta', 'Flipkart'].map((name) => (
                    <div
                      key={name}
                      className='flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors'
                    >
                      <span className='font-medium text-sm'>{name}</span>
                      <Badge variant='outline' size='sm'>—</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader className='pb-3'>
                <h3 className='font-bold text-sm'>🏆 Top Contributors</h3>
              </CardHeader>
              <CardContent className='space-y-3'>
                {topContributors.length > 0 ? (
                  topContributors.map((user: any, i: number) => (
                    <Link
                      key={user.username || i}
                      href={`/profile/${user.username}`}
                      className='flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors'
                    >
                      <div className='flex items-center gap-2'>
                        {user.photo_url ? (
                          <img
                            src={user.photo_url}
                            alt={user.full_name}
                            className='h-8 w-8 rounded-full object-cover'
                          />
                        ) : (
                          <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary'>
                            {user.full_name?.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className='text-sm font-medium'>{user.full_name}</p>
                          <p className='text-xs text-muted-foreground'>@{user.username}</p>
                        </div>
                      </div>
                      <Badge variant='warning' size='sm'>
                        {user.points?.toLocaleString()} pts
                      </Badge>
                    </Link>
                  ))
                ) : null}
              </CardContent>
            </Card>

            {/* Leaderboard CTA */}
            <Card>
              <CardContent className='pt-4'>
                <Link href='/leaderboard'>
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
