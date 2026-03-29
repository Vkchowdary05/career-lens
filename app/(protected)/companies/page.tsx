'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Building2, TrendingUp, Users, Zap, Search, ChevronRight } from 'lucide-react'

interface Company {
  id: string
  name: string
  logo: string
  experiences: number
  interviews: number
  avgRating: number
  topSkills: string[]
}

const companies: Company[] = [
  {
    id: '1',
    name: 'Google',
    logo: 'G',
    experiences: 234,
    interviews: 1250,
    avgRating: 4.8,
    topSkills: ['System Design', 'Algorithms', 'Python'],
  },
  {
    id: '2',
    name: 'Microsoft',
    logo: 'M',
    experiences: 189,
    interviews: 950,
    avgRating: 4.6,
    topSkills: ['C++', 'System Design', 'Problem Solving'],
  },
  {
    id: '3',
    name: 'Meta',
    logo: 'F',
    experiences: 156,
    interviews: 820,
    avgRating: 4.5,
    topSkills: ['React', 'JavaScript', 'Algorithms'],
  },
  {
    id: '4',
    name: 'Amazon',
    logo: 'A',
    experiences: 142,
    interviews: 780,
    avgRating: 4.3,
    topSkills: ['System Design', 'Java', 'Leadership'],
  },
  {
    id: '5',
    name: 'Apple',
    logo: 'A',
    experiences: 128,
    interviews: 650,
    avgRating: 4.4,
    topSkills: ['C++', 'Objective-C', 'System Design'],
  },
  {
    id: '6',
    name: 'Tesla',
    logo: 'T',
    experiences: 95,
    interviews: 520,
    avgRating: 4.2,
    topSkills: ['Python', 'Robotics', 'Problem Solving'],
  },
]

function CompanyCard({ company }: { company: Company }) {
  return (
    <Card className='hover:shadow-lg transition-shadow cursor-pointer group'>
      <CardContent className='pt-6'>
        <div className='flex items-start justify-between mb-4'>
          <div className='h-12 w-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-lg'>
            {company.logo}
          </div>
          <Badge variant='secondary'>{company.avgRating}⭐</Badge>
        </div>

        <h3 className='font-bold text-lg mb-1'>{company.name}</h3>

        <div className='grid grid-cols-2 gap-3 mb-4'>
          <div>
            <p className='text-xs text-muted-foreground'>Experiences</p>
            <p className='text-lg font-semibold'>{company.experiences}</p>
          </div>
          <div>
            <p className='text-xs text-muted-foreground'>Interviews</p>
            <p className='text-lg font-semibold'>{company.interviews}</p>
          </div>
        </div>

        <div className='mb-4'>
          <p className='text-xs text-muted-foreground mb-2'>Top Skills</p>
          <div className='flex flex-wrap gap-1'>
            {company.topSkills.map((skill) => (
              <Badge key={skill} variant='outline' className='text-xs'>
                {skill}
              </Badge>
            ))}
          </div>
        </div>

        <Button className='w-full group-hover:bg-primary transition-colors'>
          View Details
          <ChevronRight className='h-4 w-4 ml-2' />
        </Button>
      </CardContent>
    </Card>
  )
}

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('experiences')
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])

  const allSkills = Array.from(
    new Set(companies.flatMap(c => c.topSkills))
  )

  const filteredCompanies = companies
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      switch (sortBy) {
        case 'experiences':
          return b.experiences - a.experiences
        case 'rating':
          return b.avgRating - a.avgRating
        case 'interviews':
          return b.interviews - a.interviews
        default:
          return 0
      }
    })

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Companies</h1>
          <p className='text-muted-foreground'>
            Explore interview insights from {companies.length}+ companies
          </p>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Total Companies</p>
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
                  <p className='text-3xl font-bold'>
                    {companies.reduce((sum, c) => sum + c.experiences, 0)}
                  </p>
                </div>
                <TrendingUp className='h-8 w-8 text-secondary/40' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Interview Rounds</p>
                  <p className='text-3xl font-bold'>
                    {companies.reduce((sum, c) => sum + c.interviews, 0)}
                  </p>
                </div>
                <Zap className='h-8 w-8 text-accent/40' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='pt-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm text-muted-foreground'>Avg Rating</p>
                  <p className='text-3xl font-bold'>
                    {(companies.reduce((sum, c) => sum + c.avgRating, 0) / companies.length).toFixed(1)}
                  </p>
                </div>
                <Users className='h-8 w-8 text-muted/40' />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className='mb-8'>
          <CardContent className='pt-6'>
            <div className='space-y-4'>
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-1'>
                  <Input
                    placeholder='Search companies...'
                    startIcon={<Search className='h-4 w-4' />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className='md:w-48'>
                    <SelectValue placeholder='Sort by' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='experiences'>Most Experiences</SelectItem>
                    <SelectItem value='rating'>Highest Rated</SelectItem>
                    <SelectItem value='interviews'>Most Interviews</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Skill Filters */}
              <div>
                <p className='text-sm font-medium mb-2'>Filter by Skills</p>
                <div className='flex flex-wrap gap-2'>
                  {allSkills.map((skill) => (
                    <Badge
                      key={skill}
                      variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                      className='cursor-pointer'
                      onClick={() => {
                        setSelectedSkills(prev =>
                          prev.includes(skill)
                            ? prev.filter(s => s !== skill)
                            : [...prev, skill]
                        )
                      }}
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {filteredCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>

        {filteredCompanies.length === 0 && (
          <div className='text-center py-12'>
            <p className='text-muted-foreground'>No companies found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  )
}
