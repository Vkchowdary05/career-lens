'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, TrendingUp, Users, Zap, Search, ChevronRight } from 'lucide-react'
import { companiesApi } from '@/lib/api'

interface Company {
  name: string
  slug: string
  total_experiences: number
  outcome_distribution?: Array<{ outcome: string; count: number }>
  round_distribution?: Array<{ type: string; count: number }>
  source_distribution?: Array<{ source: string; count: number }>
}

function CompanyCard({ company }: { company: Company }) {
  const offerCount = (company.outcome_distribution || []).find(
    (o) => o.outcome === 'Got the Offer'
  )?.count || 0
  const offerRate = company.total_experiences > 0
    ? Math.round((offerCount / company.total_experiences) * 100)
    : 0
  const totalRounds = (company.round_distribution || []).reduce((s, r) => s + r.count, 0)
  const topRounds = (company.round_distribution || []).slice(0, 3).map((r) => r.type)

  return (
    <Link href={`/companies/${company.slug}`}>
      <Card className='hover:shadow-lg transition-shadow cursor-pointer group h-full'>
        <CardContent className='pt-6'>
          <div className='flex items-start justify-between mb-4'>
            <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg'>
              {company.name?.substring(0, 2).toUpperCase() || '??'}
            </div>
            {offerRate > 0 && (
              <Badge variant='secondary'>{offerRate}% offers</Badge>
            )}
          </div>

          <h3 className='font-bold text-lg mb-1'>{company.name}</h3>

          <div className='grid grid-cols-2 gap-3 mb-4'>
            <div>
              <p className='text-xs text-muted-foreground'>Experiences</p>
              <p className='text-lg font-semibold'>{company.total_experiences || 0}</p>
            </div>
            <div>
              <p className='text-xs text-muted-foreground'>Round Types</p>
              <p className='text-lg font-semibold'>{(company.round_distribution || []).length}</p>
            </div>
          </div>

          {topRounds.length > 0 && (
            <div className='mb-4'>
              <p className='text-xs text-muted-foreground mb-2'>Common Rounds</p>
              <div className='flex flex-wrap gap-1'>
                {topRounds.map((round) => (
                  <Badge key={round} variant='outline' className='text-xs'>
                    {round}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button className='w-full group-hover:bg-primary transition-colors' variant='outline'>
            View Details
            <ChevronRight className='h-4 w-4 ml-2' />
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('experiences')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadCompanies(1)
  }, [sortBy])

  const loadCompanies = async (pageNum: number) => {
    setLoading(pageNum === 1)
    try {
      const data = await companiesApi.list({
        search: searchQuery || undefined,
        sort_by: sortBy,
        page: pageNum,
      })
      const list = data.companies || data || []
      if (pageNum === 1) {
        setCompanies(list)
      } else {
        setCompanies((prev) => [...prev, ...list])
      }
      setHasMore(data.has_more || false)
      setPage(pageNum)
    } catch (e) {
      console.error('Failed to load companies', e)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadCompanies(1)
  }

  const totalExperiences = companies.reduce((sum, c) => sum + (c.total_experiences || 0), 0)

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Companies</h1>
          <p className='text-muted-foreground'>
            Explore interview insights from companies with real experience data
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Companies</p>
                  <p className='text-3xl font-bold'>{companies.length}</p>
                </div>
                <Building2 className='h-8 w-8 text-primary/40' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Total Experiences</p>
                  <p className='text-3xl font-bold'>{totalExperiences}</p>
                </div>
                <TrendingUp className='h-8 w-8 text-secondary/40' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Community</p>
                  <p className='text-3xl font-bold'>Growing</p>
                </div>
                <Users className='h-8 w-8 text-accent/40' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className='mb-8'>
          <CardContent className='pt-6'>
            <div className='flex flex-col md:flex-row gap-4'>
              <div className='flex-1 relative'>
                <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
                <input
                  placeholder='Search companies...'
                  className='w-full pl-9 pr-3 py-2 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className='md:w-48'>
                  <SelectValue placeholder='Sort by' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='experiences'>Most Experiences</SelectItem>
                  <SelectItem value='name'>Alphabetical</SelectItem>
                  <SelectItem value='recent'>Most Recent</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} variant='outline'>
                Search
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Company Grid */}
        {loading ? (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i}>
                <CardContent className='pt-6'>
                  <div className='animate-pulse space-y-4'>
                    <div className='h-12 w-12 bg-muted rounded-lg' />
                    <div className='h-5 bg-muted rounded w-1/2' />
                    <div className='grid grid-cols-2 gap-3'>
                      <div className='h-10 bg-muted rounded' />
                      <div className='h-10 bg-muted rounded' />
                    </div>
                    <div className='h-9 bg-muted rounded' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : companies.length === 0 ? (
          <div className='text-center py-12'>
            <Building2 className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
            <p className='text-muted-foreground'>
              {searchQuery
                ? 'No companies found matching your search.'
                : 'No companies with interview experiences yet. Be the first to share!'}
            </p>
            <Link href='/experiences/share' className='mt-4 inline-block'>
              <Button>Share an Experience</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {companies.map((company) => (
                <CompanyCard key={company.slug} company={company} />
              ))}
            </div>
            {hasMore && (
              <div className='mt-6 text-center'>
                <Button variant='outline' onClick={() => loadCompanies(page + 1)}>
                  Load More Companies
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
