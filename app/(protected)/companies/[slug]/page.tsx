'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { BarChart3, Users, TrendingUp, Building2 } from 'lucide-react'

export default function CompanyDetailPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = React.useState<'overview' | 'rounds' | 'skills' | 'experiences' | 'questions'>('overview')

  return (
    <div className='space-y-6 p-6'>
      {/* Company Header */}
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          <div className='h-16 w-16 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold'>
            {params.slug.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className='text-3xl font-bold text-foreground capitalize'>
              {params.slug}
            </h1>
            <p className='text-muted-foreground'>Tech Company • San Francisco, CA</p>
          </div>
        </div>
        <Badge variant='secondary' size='lg'>4.8 ⭐</Badge>
      </div>

      {/* Key Stats */}
      <div className='grid md:grid-cols-4 gap-4'>
        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Users className='h-4 w-4 text-primary' />
                <p className='text-2xl font-bold text-foreground'>1.2K</p>
              </div>
              <p className='text-xs text-muted-foreground'>Interview Experiences</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <TrendingUp className='h-4 w-4 text-accent' />
                <p className='text-2xl font-bold text-foreground'>68%</p>
              </div>
              <p className='text-xs text-muted-foreground'>Success Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <BarChart3 className='h-4 w-4 text-secondary' />
                <p className='text-2xl font-bold text-foreground'>4.2</p>
              </div>
              <p className='text-xs text-muted-foreground'>Avg Difficulty</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='pt-6'>
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Building2 className='h-4 w-4 text-primary' />
                <p className='text-2xl font-bold text-foreground'>24</p>
              </div>
              <p className='text-xs text-muted-foreground'>Countries</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <span>✨</span> AI Interview Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className='text-sm text-foreground mb-3'>
            {params.slug.charAt(0).toUpperCase() + params.slug.slice(1)}&apos;s interview process emphasizes technical depth and system design skills. 
            The company typically conducts 4-5 rounds over 2-3 weeks. Behavioral interviews focus on handling ambiguity and collaboration.
          </p>
          <Badge variant='warning' size='sm'>Top Skills: System Design, Data Structures, Distributed Systems</Badge>
        </CardContent>
      </Card>

      {/* Tabs */}
      <div className='flex gap-2 border-b border-border overflow-x-auto pb-2'>
        {(['overview', 'rounds', 'skills', 'experiences', 'questions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors whitespace-nowrap ${
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
      <div>
        {activeTab === 'overview' && (
          <div className='space-y-4'>
            <Card>
              <CardHeader>
                <CardTitle className='text-lg'>Interview Timeline</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3'>
                {[
                  { stage: 'Phone Screen', days: '1-2 days' },
                  { stage: 'Online Assessment', days: '3-5 days' },
                  { stage: 'Technical Interviews', days: '1-2 weeks' },
                  { stage: 'System Design', days: '1-2 weeks' },
                  { stage: 'Behavioral Round', days: '2-3 weeks' },
                ].map((item, i) => (
                  <div key={i} className='flex items-center gap-4'>
                    <Badge variant='outline' size='sm'>{i + 1}</Badge>
                    <div className='flex-1'>
                      <p className='font-medium text-foreground'>{item.stage}</p>
                      <p className='text-xs text-muted-foreground'>{item.days}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'rounds' && (
          <Card>
            <CardHeader>
              <CardTitle>Interview Rounds</CardTitle>
              <CardDescription>Most common interview formats</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {['Phone Screen (30 min)', 'Technical Coding (60 min)', 'System Design (60 min)', 'Behavioral (45 min)'].map((round, i) => (
                <div key={i} className='p-3 rounded-lg border border-border'>
                  <p className='font-medium text-foreground'>{round}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === 'skills' && (
          <Card>
            <CardHeader>
              <CardTitle>Required Skills</CardTitle>
              <CardDescription>Top skills candidates need</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              {[
                { skill: 'Data Structures', percentage: 95 },
                { skill: 'System Design', percentage: 90 },
                { skill: 'Algorithms', percentage: 88 },
                { skill: 'Communication', percentage: 82 },
                { skill: 'Problem Solving', percentage: 85 },
              ].map((item, i) => (
                <div key={i}>
                  <div className='flex justify-between mb-1'>
                    <span className='text-sm font-medium text-foreground'>{item.skill}</span>
                    <span className='text-xs text-muted-foreground'>{item.percentage}%</span>
                  </div>
                  <div className='w-full h-2 bg-muted rounded-full overflow-hidden'>
                    <div
                      className='h-full bg-primary'
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {activeTab === 'experiences' && (
          <div className='space-y-3'>
            {[1, 2, 3].map((i) => (
              <Card key={i} hover>
                <CardContent className='pt-6'>
                  <div className='flex justify-between items-start'>
                    <div>
                      <p className='font-bold text-foreground'>Software Engineer Interview</p>
                      <p className='text-sm text-muted-foreground'>Shared {i} weeks ago</p>
                    </div>
                    <Badge variant='secondary' size='sm'>4.8⭐</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className='space-y-3'>
            {[
              'Design a URL shortener like bit.ly',
              'Implement an LRU cache',
              'Design a rate limiter',
              'Two sum problem variants',
            ].map((question, i) => (
              <Card key={i} hover>
                <CardContent className='pt-6'>
                  <p className='text-foreground'>{question}</p>
                  <div className='text-xs text-muted-foreground mt-2'>
                    Asked {Math.floor(Math.random() * 50) + 10} times
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
