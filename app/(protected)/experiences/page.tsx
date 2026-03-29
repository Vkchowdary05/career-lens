'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, MessageSquare, TrendingUp, Heart, Search } from 'lucide-react'
import { experiencesApi } from '@/lib/api'
import { formatRelativeTime } from '@/lib/formatters'

interface Experience {
  id: string
  company_name: string
  role: string
  employment_type: string
  experience_level: string
  outcome: string
  rounds: any[]
  likes_count: number
  comments_count: number
  created_at: string
  author?: {
    username: string
    full_name: string
    photo_url?: string
  }
}

export default function ExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [outcomeFilter, setOutcomeFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadExperiences(1)
  }, [outcomeFilter])

  const loadExperiences = async (pageNum: number) => {
    setLoading(pageNum === 1)
    try {
      const params: any = { page: pageNum }
      if (outcomeFilter && outcomeFilter !== 'all') params.outcome = outcomeFilter
      const data = await experiencesApi.list(params)
      const list = data.experiences || data || []
      if (pageNum === 1) {
        setExperiences(list)
      } else {
        setExperiences((prev) => [...prev, ...list])
      }
      setHasMore(data.has_more || false)
      setPage(pageNum)
    } catch (e) {
      console.error('Failed to load experiences', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = experiences.filter((exp) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      exp.company_name?.toLowerCase().includes(q) ||
      exp.role?.toLowerCase().includes(q) ||
      exp.author?.full_name?.toLowerCase().includes(q)
    )
  })

  const getOutcomeBadgeVariant = (outcome: string) => {
    if (outcome?.includes('Offer') || outcome?.includes('Selected')) return 'success' as const
    if (outcome?.includes('Rejected')) return 'destructive' as const
    return 'secondary' as const
  }

  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Interview Experiences</h1>
          <p className='text-muted-foreground'>Learn from real interview experiences shared by professionals</p>
        </div>
        <Link href='/experiences/share'>
          <Button className='gap-2'>
            <Plus className='h-4 w-4' />
            Share Experience
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <div className='relative flex-1 max-w-md'>
          <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <input
            placeholder='Search by company or role...'
            className='w-full pl-9 pr-3 py-2 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
          <SelectTrigger className='w-48'>
            <SelectValue placeholder='Filter by outcome' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>All Outcomes</SelectItem>
            <SelectItem value='Got the Offer'>Got the Offer</SelectItem>
            <SelectItem value='Rejected after Rounds'>Rejected</SelectItem>
            <SelectItem value='Pending'>Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Experience Cards */}
      <div className='space-y-4'>
        {loading ? (
          [1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className='pt-6'>
                <div className='animate-pulse space-y-3'>
                  <div className='flex gap-3'>
                    <div className='h-10 w-10 rounded-lg bg-muted' />
                    <div className='space-y-2 flex-1'>
                      <div className='h-4 bg-muted rounded w-1/3' />
                      <div className='h-3 bg-muted rounded w-1/4' />
                    </div>
                  </div>
                  <div className='h-3 bg-muted rounded w-2/3' />
                  <div className='flex gap-4'>
                    <div className='h-3 bg-muted rounded w-20' />
                    <div className='h-3 bg-muted rounded w-20' />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className='pt-12 pb-12 text-center'>
              <p className='text-muted-foreground'>
                {searchQuery
                  ? 'No experiences match your search.'
                  : 'No interview experiences shared yet. Be the first to share!'}
              </p>
              <Link href='/experiences/share' className='mt-4 inline-block'>
                <Button size='sm'>Share Your Experience</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            {filtered.map((exp) => (
              <Link key={exp.id} href={`/experiences/${exp.id}`}>
                <Card className='hover:shadow-md transition-shadow cursor-pointer mb-4'>
                  <CardContent className='pt-6'>
                    <div className='space-y-4'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <div className='flex items-center gap-3 mb-2'>
                            <div className='h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold'>
                              {exp.company_name?.substring(0, 2).toUpperCase() || '??'}
                            </div>
                            <div>
                              <p className='font-bold text-foreground'>{exp.company_name}</p>
                              <p className='text-sm text-muted-foreground'>{exp.role}</p>
                            </div>
                          </div>
                        </div>
                        <Badge variant={getOutcomeBadgeVariant(exp.outcome)} size='sm'>
                          {exp.outcome || 'Unknown'}
                        </Badge>
                      </div>

                      <p className='text-sm text-muted-foreground'>
                        Shared by{' '}
                        <span className='font-medium text-foreground'>
                          {exp.author?.full_name || 'Anonymous'}
                        </span>{' '}
                        {exp.created_at ? formatRelativeTime(new Date(exp.created_at)) : ''}
                      </p>

                      <div className='flex items-center gap-4 flex-wrap'>
                        <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                          <TrendingUp className='h-4 w-4' />
                          <span>{exp.rounds?.length || 0} rounds</span>
                        </div>
                        <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                          <Heart className='h-4 w-4' />
                          <span>{exp.likes_count || 0}</span>
                        </div>
                        <div className='flex items-center gap-1 text-sm text-muted-foreground'>
                          <MessageSquare className='h-4 w-4' />
                          <span>{exp.comments_count || 0} comments</span>
                        </div>
                        <div className='flex gap-2 ml-auto'>
                          <Badge variant='outline' size='sm'>{exp.employment_type}</Badge>
                          <Badge variant='outline' size='sm'>{exp.experience_level}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
            {hasMore && (
              <Button
                variant='outline'
                className='w-full'
                onClick={() => loadExperiences(page + 1)}
              >
                Load More
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
