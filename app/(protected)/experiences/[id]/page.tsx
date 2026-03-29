'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Heart, MessageCircle, Share2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { experiencesApi, usersApi } from '@/lib/api'
import { formatRelativeTime } from '@/lib/formatters'
import { useAuth } from '@/contexts/AuthContext'

interface Experience {
  id: string
  company_name: string
  company_slug: string
  role: string
  employment_type: string
  experience_level: string
  location: string
  country: string
  application_source: string
  rounds: Array<{
    round_number: number
    round_type: string
    duration_minutes?: number
    difficulty?: string
    narrative: string
    cleared: boolean
    questions_asked: string[]
  }>
  outcome: string
  package_range?: string
  bond_details?: string
  joining_timeline?: string
  prep_resources: Array<{ resource_type: string; name_or_url: string }>
  tips_and_advice?: string
  likes_count: number
  comments_count: number
  is_liked: boolean
  created_at: string
  author?: {
    username: string
    full_name: string
    photo_url?: string
    bio?: string
  }
  user_id: string
}

interface Comment {
  id: string
  content: string
  created_at: string
  author?: {
    username: string
    full_name: string
    photo_url?: string
  }
}

export default function ExperienceDetailPage() {
  const params = useParams()
  const id = params.id as string
  const { clUser } = useAuth()

  const [experience, setExperience] = useState<Experience | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    loadExperience()
  }, [id])

  const loadExperience = async () => {
    setLoading(true)
    try {
      const data = await experiencesApi.get(id)
      setExperience(data)
      setLiked(data.is_liked || false)
      setLikeCount(data.likes_count || 0)
      // Load comments
      try {
        const commentsData = await experiencesApi.getComments(id)
        setComments(commentsData || [])
      } catch {}
    } catch (e) {
      console.error('Failed to load experience', e)
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async () => {
    setLiked(!liked)
    setLikeCount(liked ? likeCount - 1 : likeCount + 1)
    try {
      await experiencesApi.toggleLike(id)
    } catch {
      setLiked(liked)
      setLikeCount(liked ? likeCount + 1 : likeCount - 1)
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim()) return
    setCommentLoading(true)
    try {
      const comment = await experiencesApi.addComment(id, newComment)
      setComments((prev) => [...prev, comment])
      setNewComment('')
    } catch (e) {
      console.error('Failed to add comment', e)
    } finally {
      setCommentLoading(false)
    }
  }

  const getDifficultyVariant = (diff?: string) => {
    if (diff === 'Hard') return 'destructive' as const
    if (diff === 'Medium') return 'warning' as const
    return 'success' as const
  }

  if (loading) {
    return (
      <div className='p-6 space-y-6'>
        <div className='animate-pulse'>
          <div className='h-16 w-16 bg-muted rounded-lg mb-4' />
          <div className='h-8 bg-muted rounded w-48 mb-2' />
          <div className='h-4 bg-muted rounded w-64' />
        </div>
      </div>
    )
  }

  if (!experience) {
    return (
      <div className='p-6 text-center py-20'>
        <p className='text-muted-foreground text-lg'>Experience not found</p>
        <Link href='/experiences' className='mt-4 inline-block'>
          <Button variant='outline'>← Back to Experiences</Button>
        </Link>
      </div>
    )
  }

  const allQuestions = experience.rounds.flatMap((r) =>
    (r.questions_asked || []).map((q) => ({ question: q, roundType: r.round_type }))
  )

  const authorInitials = experience.author?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '??'

  return (
    <div className='space-y-6 p-6'>
      <Link href='/experiences' className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'>
        <ArrowLeft className='h-4 w-4' />
        Back to Experiences
      </Link>

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
                      {experience.company_name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <Link href={`/companies/${experience.company_slug}`}>
                        <p className='font-bold text-lg text-foreground hover:underline'>{experience.company_name}</p>
                      </Link>
                      <p className='text-sm text-muted-foreground'>{experience.role}</p>
                    </div>
                  </div>
                </div>
                <Badge variant={experience.outcome?.includes('Offer') || experience.outcome?.includes('Selected') ? 'success' : experience.outcome?.includes('Rejected') ? 'destructive' : 'secondary'}>
                  {experience.outcome}
                </Badge>
              </div>
              <div className='flex flex-wrap gap-2'>
                <Badge variant='outline' size='sm'>{experience.employment_type}</Badge>
                <Badge variant='outline' size='sm'>{experience.experience_level}</Badge>
                {experience.location && <Badge variant='outline' size='sm'>📍 {experience.location}</Badge>}
                <Badge variant='outline' size='sm'>via {experience.application_source}</Badge>
                {experience.package_range && <Badge variant='outline' size='sm'>💰 {experience.package_range}</Badge>}
              </div>
              <CardDescription className='mt-3'>
                Shared by {experience.author?.full_name || 'Anonymous'} · {formatRelativeTime(new Date(experience.created_at))}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Rounds Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                📋 Interview Rounds ({experience.rounds.length})
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              {experience.rounds.map((round, i) => (
                <div
                  key={i}
                  className='p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors space-y-3'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold',
                        round.cleared ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      )}>
                        {round.cleared ? <CheckCircle2 className='h-4 w-4' /> : i + 1}
                      </div>
                      <div>
                        <p className='font-medium text-foreground'>
                          Round {round.round_number}: {round.round_type}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          {round.duration_minutes ? `${round.duration_minutes} min` : 'Duration N/A'}
                          {round.cleared ? ' · Cleared' : ' · Not cleared'}
                        </p>
                      </div>
                    </div>
                    {round.difficulty && (
                      <Badge variant={getDifficultyVariant(round.difficulty)} size='sm'>
                        {round.difficulty}
                      </Badge>
                    )}
                  </div>
                  {round.narrative && (
                    <p className='text-sm text-foreground/80 leading-relaxed pl-11'>
                      {round.narrative}
                    </p>
                  )}
                  {round.questions_asked?.length > 0 && (
                    <div className='pl-11 space-y-1'>
                      <p className='text-xs font-medium text-muted-foreground'>Questions asked:</p>
                      {round.questions_asked.map((q, qi) => (
                        <div key={qi} className='text-sm text-foreground bg-muted/50 rounded px-3 py-1.5'>
                          {q}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* All Questions */}
          {allQuestions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  ❓ Key Questions Asked ({allQuestions.length})
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                {allQuestions.map((q, i) => (
                  <div key={i} className='p-3 rounded-lg bg-muted flex items-start justify-between gap-3'>
                    <p className='text-sm text-foreground flex-1'>{q.question}</p>
                    <Badge variant='outline' size='sm'>{q.roundType}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Tips & Advice */}
          {experience.tips_and_advice && (
            <Card>
              <CardHeader>
                <CardTitle>💡 Tips & Advice</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-foreground leading-relaxed'>{experience.tips_and_advice}</p>
              </CardContent>
            </Card>
          )}

          {/* Prep Resources */}
          {experience.prep_resources?.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>📚 Preparation Resources</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                {experience.prep_resources.map((resource, i) => (
                  <div key={i} className='flex items-center justify-between p-2 rounded hover:bg-muted'>
                    <p className='text-sm text-foreground'>{resource.name_or_url}</p>
                    <Badge variant='outline' size='sm'>{resource.resource_type}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comments & Discussion</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex gap-2'>
                <Input
                  placeholder='Share your thoughts or questions...'
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className='flex-1'
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <Button onClick={handleAddComment} disabled={commentLoading || !newComment.trim()}>
                  {commentLoading ? 'Posting...' : 'Post'}
                </Button>
              </div>

              <div className='space-y-3 mt-4'>
                {comments.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-4'>
                    No comments yet. Be the first to share your thoughts!
                  </p>
                ) : (
                  comments.map((comment) => {
                    const commentInitials = comment.author?.full_name
                      ?.split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2) || '?'
                    return (
                      <div key={comment.id} className='p-3 rounded-lg bg-muted'>
                        <div className='flex items-center gap-2 mb-2'>
                          {comment.author?.photo_url ? (
                            <img src={comment.author.photo_url} alt='' className='h-8 w-8 rounded-full object-cover' />
                          ) : (
                            <div className='h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold'>
                              {commentInitials}
                            </div>
                          )}
                          <div>
                            <p className='font-medium text-sm text-foreground'>{comment.author?.full_name || 'User'}</p>
                            <p className='text-xs text-muted-foreground'>
                              {comment.created_at ? formatRelativeTime(new Date(comment.created_at)) : ''}
                            </p>
                          </div>
                        </div>
                        <p className='text-sm text-foreground'>{comment.content}</p>
                      </div>
                    )
                  })
                )}
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
                {experience.author?.photo_url ? (
                  <img src={experience.author.photo_url} alt='' className='h-12 w-12 rounded-full object-cover' />
                ) : (
                  <div className='h-12 w-12 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center font-bold'>
                    {authorInitials}
                  </div>
                )}
                <div>
                  <p className='font-medium text-foreground'>{experience.author?.full_name || 'Anonymous'}</p>
                  <p className='text-xs text-muted-foreground'>@{experience.author?.username || 'user'}</p>
                </div>
              </div>
              {experience.author?.bio && (
                <p className='text-sm text-foreground'>{experience.author.bio}</p>
              )}
              {experience.author?.username && (
                <Link href={`/profile/${experience.author.username}`}>
                  <Button className='w-full' variant='outline' size='sm'>
                    View Profile
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardContent className='pt-6 space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Rounds</span>
                <span className='font-bold text-foreground'>{experience.rounds.length}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Likes</span>
                <span className='font-bold text-foreground'>{likeCount}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>Comments</span>
                <span className='font-bold text-foreground'>{comments.length}</span>
              </div>
              {experience.package_range && (
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>Package</span>
                  <span className='font-bold text-foreground'>{experience.package_range}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className='flex gap-2'>
            <Button
              className='flex-1 gap-2'
              size='sm'
              variant={liked ? 'default' : 'outline'}
              onClick={handleLike}
            >
              <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
              {liked ? 'Liked' : 'Like'}
            </Button>
            <Button
              className='flex-1 gap-2'
              size='sm'
              variant='outline'
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
              }}
            >
              <Share2 className='h-4 w-4' />
              Share
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
