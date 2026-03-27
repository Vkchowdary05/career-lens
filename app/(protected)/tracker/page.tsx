'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Plus, Grid3x3, List } from 'lucide-react'
import { cn } from '@/lib/utils'
import { APPLICATION_STAGES } from '@/lib/constants'

interface Application {
  id: string
  company: string
  role: string
  stage: string
  appliedDate: string
  source: string
  priority: 'Low' | 'Medium' | 'High'
  daysInStage: number
}

const mockApplications: Application[] = [
  {
    id: '1',
    company: 'Google',
    role: 'Senior Software Engineer',
    stage: 'Applied',
    appliedDate: '2024-03-20',
    source: 'LinkedIn',
    priority: 'High',
    daysInStage: 5,
  },
  {
    id: '2',
    company: 'Microsoft',
    role: 'Product Manager',
    stage: 'Interview Rounds',
    appliedDate: '2024-03-15',
    source: 'Company Website',
    priority: 'High',
    daysInStage: 10,
  },
  {
    id: '3',
    company: 'Meta',
    role: 'Engineering Manager',
    stage: 'Shortlisted',
    appliedDate: '2024-03-18',
    source: 'Referral',
    priority: 'Medium',
    daysInStage: 7,
  },
  {
    id: '4',
    company: 'Amazon',
    role: 'Data Engineer',
    stage: 'Offer Received',
    appliedDate: '2024-02-28',
    source: 'Indeed',
    priority: 'Medium',
    daysInStage: 21,
  },
  {
    id: '5',
    company: 'Apple',
    role: 'ML Engineer',
    stage: 'Rejected',
    appliedDate: '2024-03-10',
    source: 'Direct',
    priority: 'Low',
    daysInStage: 15,
  },
]

const stageColors: Record<string, string> = {
  'Applied': 'bg-blue-500',
  'Shortlisted': 'bg-purple-500',
  'Assignment/OA': 'bg-yellow-500',
  'Interview Rounds': 'bg-orange-500',
  'Offer Received': 'bg-green-500',
  'Offer Accepted': 'bg-emerald-500',
  'Rejected': 'bg-red-500',
  'Withdrawn': 'bg-gray-500',
}

function ApplicationCard({ app }: { app: Application }) {
  return (
    <Card className='hover:shadow-md transition-shadow cursor-pointer group mb-3'>
      <CardContent className='pt-4 pb-4'>
        <div className='flex items-start justify-between mb-2'>
          <div className='flex-1'>
            <p className='font-semibold text-sm'>{app.company}</p>
            <p className='text-xs text-muted-foreground'>{app.role}</p>
          </div>
          {app.priority === 'High' && (
            <div className='h-2 w-2 rounded-full bg-destructive ml-2 mt-1' />
          )}
        </div>

        <div className='flex gap-2 mb-3 flex-wrap'>
          <Badge variant='outline' className='text-xs'>
            {app.source}
          </Badge>
          <Badge variant='secondary' className='text-xs'>
            {app.daysInStage}d
          </Badge>
        </div>

        <div className='space-y-2'>
          <div className={cn('h-1 rounded-full', stageColors[app.stage])} />
          <p className='text-xs text-muted-foreground'>{app.stage}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function KanbanBoard({ applications }: { applications: Application[] }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pb-6'>
      {APPLICATION_STAGES.map((stage) => {
        const stageApps = applications.filter(app => app.stage === stage)
        return (
          <div key={stage} className='bg-muted/50 rounded-lg p-4 min-h-96'>
            <div className='flex items-center justify-between mb-4'>
              <h3 className='font-semibold text-sm'>{stage}</h3>
              <Badge variant='outline' className='text-xs'>{stageApps.length}</Badge>
            </div>

            <div className='space-y-2'>
              {stageApps.map((app) => (
                <ApplicationCard key={app.id} app={app} />
              ))}
            </div>

            {stageApps.length === 0 && (
              <p className='text-xs text-muted-foreground text-center py-12'>
                No applications
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TableView({ applications }: { applications: Application[] }) {
  return (
    <div className='overflow-x-auto'>
      <table className='w-full text-sm'>
        <thead>
          <tr className='border-b border-border'>
            <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Company</th>
            <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Role</th>
            <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Applied</th>
            <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Stage</th>
            <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Source</th>
            <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Days</th>
            <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Action</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id} className='border-b border-border hover:bg-muted/50 transition-colors'>
              <td className='py-3 px-4'>{app.company}</td>
              <td className='py-3 px-4'>{app.role}</td>
              <td className='py-3 px-4 text-xs text-muted-foreground'>{app.appliedDate}</td>
              <td className='py-3 px-4'>
                <Badge variant='outline' className='text-xs'>{app.stage}</Badge>
              </td>
              <td className='py-3 px-4 text-xs'>{app.source}</td>
              <td className='py-3 px-4 text-xs font-medium'>{app.daysInStage}</td>
              <td className='py-3 px-4'>
                <button className='text-primary hover:underline text-xs font-medium'>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function TrackerPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [applications] = useState(mockApplications)

  const stats = {
    applied: applications.filter(a => a.stage === 'Applied').length,
    inProgress: applications.filter(a => ['Shortlisted', 'Assignment/OA', 'Interview Rounds'].includes(a.stage)).length,
    offers: applications.filter(a => ['Offer Received', 'Offer Accepted'].includes(a.stage)).length,
    rejected: applications.filter(a => a.stage === 'Rejected').length,
  }

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8'>
          <div>
            <h1 className='text-3xl font-bold mb-2'>Application Tracker</h1>
            <p className='text-muted-foreground'>
              Track your job applications and interview progress
            </p>
          </div>
          <Button className='gap-2'>
            <Plus className='h-4 w-4' />
            Add Application
          </Button>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          <Card>
            <CardContent className='pt-6'>
              <div>
                <p className='text-sm text-muted-foreground'>Total Applied</p>
                <p className='text-3xl font-bold'>{stats.applied}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div>
                <p className='text-sm text-muted-foreground'>In Progress</p>
                <p className='text-3xl font-bold text-secondary'>{stats.inProgress}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div>
                <p className='text-sm text-muted-foreground'>Offers</p>
                <p className='text-3xl font-bold text-accent'>{stats.offers}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='pt-6'>
              <div>
                <p className='text-sm text-muted-foreground'>Rejected</p>
                <p className='text-3xl font-bold text-destructive'>{stats.rejected}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* View Toggle */}
        <div className='flex justify-between items-center mb-6'>
          <div className='flex gap-2'>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setViewMode('kanban')}
              className='gap-2'
            >
              <Grid3x3 className='h-4 w-4' />
              Kanban View
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setViewMode('list')}
              className='gap-2'
            >
              <List className='h-4 w-4' />
              List View
            </Button>
          </div>
          <Input
            placeholder='Search applications...'
            className='max-w-xs'
          />
        </div>

        {/* Content */}
        {viewMode === 'kanban' ? (
          <KanbanBoard applications={applications} />
        ) : (
          <Card>
            <CardContent className='pt-6'>
              <TableView applications={applications} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
