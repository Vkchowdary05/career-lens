'use client'

import React from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { Plus, MessageSquare, TrendingUp, Clock } from 'lucide-react'

const experiences = [
  {
    id: 1,
    company: 'Google',
    role: 'Senior Software Engineer',
    author: 'Sarah Chen',
    date: '2 weeks ago',
    rounds: 5,
    difficulty: 'Hard',
    rating: 4.8,
    comments: 24,
  },
  {
    id: 2,
    company: 'Microsoft',
    role: 'Product Manager',
    author: 'Alex Johnson',
    date: '1 month ago',
    rounds: 4,
    difficulty: 'Medium',
    rating: 4.6,
    comments: 18,
  },
  {
    id: 3,
    company: 'Meta',
    role: 'Full Stack Engineer',
    author: 'Emma Davis',
    date: '3 weeks ago',
    rounds: 4,
    difficulty: 'Hard',
    rating: 4.7,
    comments: 31,
  },
]

export default function ExperiencesPage() {
  return (
    <div className='space-y-6 p-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Interview Experiences</h1>
          <p className='text-muted-foreground'>Learn from real interview experiences shared by professionals</p>
        </div>
        <Link href='/dashboard/experiences/share'>
          <Button className='gap-2'>
            <Plus className='h-4 w-4' />
            Share Experience
          </Button>
        </Link>
      </div>

      {/* Search & Filters */}
      <div className='flex flex-col sm:flex-row gap-4'>
        <Input
          placeholder='Search by company or role...'
          className='max-w-md'
        />
        <Button variant='outline'>Filter by difficulty</Button>
        <Button variant='outline'>Sort by latest</Button>
      </div>

      {/* Experience Cards */}
      <div className='space-y-4'>
        {experiences.map((exp) => (
          <Link key={exp.id} href={`/dashboard/experiences/${exp.id}`}>
            <Card hover>
              <CardContent className='pt-6'>
                <div className='space-y-4'>
                  <div className='flex items-start justify-between'>
                    <div>
                      <div className='flex items-center gap-3 mb-2'>
                        <div className='h-10 w-10 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold'>
                          {exp.company.substring(0, 2)}
                        </div>
                        <div>
                          <p className='font-bold text-foreground'>{exp.company}</p>
                          <p className='text-sm text-muted-foreground'>{exp.role}</p>
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant={
                        exp.difficulty === 'Hard'
                          ? 'destructive'
                          : exp.difficulty === 'Medium'
                          ? 'warning'
                          : 'success'
                      }
                      size='sm'
                    >
                      {exp.difficulty}
                    </Badge>
                  </div>

                  <p className='text-sm text-muted-foreground'>
                    Shared by <span className='font-medium text-foreground'>{exp.author}</span> {exp.date}
                  </p>

                  <div className='flex items-center gap-4 flex-wrap'>
                    <div className='flex items-center gap-1 text-sm'>
                      <TrendingUp className='h-4 w-4' />
                      <span>{exp.rounds} rounds</span>
                    </div>
                    <div className='flex items-center gap-1 text-sm'>
                      <MessageSquare className='h-4 w-4' />
                      <span>{exp.comments} comments</span>
                    </div>
                    <div className='flex items-center gap-1 text-sm'>
                      <span>⭐ {exp.rating}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
