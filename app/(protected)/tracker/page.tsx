'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Grid3x3, List, X, Calendar, Link as LinkIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { trackerApi } from '@/lib/api'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core'

const APPLICATION_STAGES = [
  'Applied',
  'Shortlisted',
  'Assignment/OA',
  'Interview Rounds',
  'Offer Received',
  'Offer Accepted',
  'Rejected',
  'Withdrawn',
]

const STAGE_COLORS: Record<string, string> = {
  'Applied': 'bg-blue-500',
  'Shortlisted': 'bg-purple-500',
  'Assignment/OA': 'bg-yellow-500',
  'Interview Rounds': 'bg-orange-500',
  'Offer Received': 'bg-green-500',
  'Offer Accepted': 'bg-emerald-600',
  'Rejected': 'bg-red-500',
  'Withdrawn': 'bg-gray-400',
}

interface Application {
  id: string
  company: string
  role: string
  employment_type: string
  applied_date: string
  source: string
  notes?: string
  priority: 'Low' | 'Medium' | 'High'
  resume_url?: string
  current_stage: string
  stage_history: Array<{ stage: string; timestamp: string; notes?: string }>
  activity_log: Array<{ action: string; timestamp: string }>
  created_at: string
  updated_at: string
}

function DraggableCard({ app }: { app: Application }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: app.id,
    data: { app },
  })

  const style = transform ? {
    transform: `translate(${transform.x}px, ${transform.y}px)`,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  } : {}

  const daysInStage = Math.floor(
    (Date.now() - new Date(app.updated_at || app.created_at).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div ref={setNodeRef} style={style as any} {...listeners} {...attributes}>
      <Card className={cn(
        'cursor-grab active:cursor-grabbing mb-3 border-l-4 hover:shadow-md transition-shadow',
        app.priority === 'High' ? 'border-l-red-500' : app.priority === 'Medium' ? 'border-l-yellow-500' : 'border-l-green-500'
      )}>
        <CardContent className='pt-3 pb-3'>
          <div className='flex items-start justify-between mb-1'>
            <div className='flex-1 min-w-0'>
              <p className='font-semibold text-sm truncate'>{app.company}</p>
              <p className='text-xs text-muted-foreground truncate'>{app.role}</p>
            </div>
          </div>
          <div className='flex gap-2 mt-2 flex-wrap'>
            <Badge variant='outline' size='sm'>{app.source}</Badge>
            {daysInStage > 14 && (
              <Badge variant='warning' size='sm'>⚠ {daysInStage}d</Badge>
            )}
            {daysInStage <= 14 && daysInStage > 0 && (
              <Badge variant='muted' size='sm'>{daysInStage}d</Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DroppableColumn({
  stage,
  apps,
  onAddNote,
}: {
  stage: string
  apps: Application[]
  onAddNote?: (appId: string) => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-lg p-3 min-h-96 transition-colors',
        isOver ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-muted/50'
      )}
    >
      <div className='flex items-center justify-between mb-3'>
        <div className='flex items-center gap-2'>
          <div className={cn('h-2 w-2 rounded-full', STAGE_COLORS[stage] || 'bg-gray-400')} />
          <h3 className='font-semibold text-sm'>{stage}</h3>
        </div>
        <Badge variant='outline' size='sm'>{apps.length}</Badge>
      </div>
      <div>
        {apps.map((app) => (
          <DraggableCard key={app.id} app={app} />
        ))}
      </div>
      {apps.length === 0 && (
        <p className='text-xs text-muted-foreground text-center py-8'>Drop here</p>
      )}
    </div>
  )
}

function AddApplicationModal({ onClose, onAdd }: { onClose: () => void; onAdd: (app: Application) => void }) {
  const [form, setForm] = useState({
    company: '', role: '', employment_type: 'Full-time', source: 'LinkedIn', priority: 'Medium', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.company || !form.role) { setError('Company and role are required.'); return }
    setLoading(true)
    try {
      const app = await trackerApi.create({
        ...form,
        applied_date: new Date().toISOString(),
      })
      onAdd(app)
      onClose()
    } catch (err: any) {
      setError(err.message || 'Failed to add application')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4' onClick={onClose}>
      <Card className='w-full max-w-md' onClick={(e) => e.stopPropagation()}>
        <CardHeader>
          <div className='flex items-center justify-between'>
            <CardTitle>Add Application</CardTitle>
            <button onClick={onClose} className='p-1 hover:bg-muted rounded'>
              <X className='h-4 w-4' />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            {error && <p className='text-sm text-destructive'>{error}</p>}
            <Input label='Company' placeholder='Google, Amazon...' value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
            <Input label='Role' placeholder='Software Engineer' value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} required />
            <div>
              <label className='block text-sm font-medium mb-1'>Employment Type</label>
              <Select value={form.employment_type} onValueChange={(v) => setForm({ ...form, employment_type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Full-time', 'Internship', 'Contract', 'Part-time'].map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Source</label>
              <Select value={form.source} onValueChange={(v) => setForm({ ...form, source: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['LinkedIn', 'Naukri', 'Indeed', 'Referral', 'Company Website', 'Internshala', 'Other'].map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>Priority</label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['Low', 'Medium', 'High'].map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Input label='Notes (optional)' placeholder='Any notes...' value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <div className='flex gap-2 justify-end'>
              <Button type='button' variant='outline' onClick={onClose}>Cancel</Button>
              <Button type='submit' disabled={loading}>{loading ? 'Adding...' : 'Add Application'}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function TrackerPage() {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban')
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [activeApp, setActiveApp] = useState<Application | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  )

  useEffect(() => {
    loadApplications()
  }, [])

  const loadApplications = async () => {
    setLoading(true)
    try {
      const data = await trackerApi.list()
      setApplications(Array.isArray(data) ? data : [])
    } catch (e) {
      console.error('Failed to load applications', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (event: DragStartEvent) => {
    const app = applications.find((a) => a.id === event.active.id)
    if (app) setActiveApp(app)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveApp(null)
    const { active, over } = event
    if (!over) return
    const appId = active.id as string
    const newStage = over.id as string
    const app = applications.find((a) => a.id === appId)
    if (!app || app.current_stage === newStage) return
    if (!APPLICATION_STAGES.includes(newStage)) return

    // Optimistic update
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, current_stage: newStage, updated_at: new Date().toISOString() } : a))
    )
    try {
      await trackerApi.updateStage(appId, newStage)
    } catch (e) {
      console.error('Failed to update stage', e)
      // Rollback
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, current_stage: app.current_stage } : a))
      )
    }
  }

  const handleAddApp = (app: Application) => {
    setApplications((prev) => [app, ...prev])
  }

  const filtered = applications.filter(
    (a) =>
      !searchQuery ||
      a.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.role.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const stats = {
    total: applications.length,
    active: applications.filter((a) => !['Offer Accepted', 'Rejected', 'Withdrawn'].includes(a.current_stage)).length,
    offers: applications.filter((a) => ['Offer Received', 'Offer Accepted'].includes(a.current_stage)).length,
    rejected: applications.filter((a) => a.current_stage === 'Rejected').length,
  }

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-7xl mx-auto'>
        {/* Header */}
        <div className='flex items-center justify-between mb-6'>
          <div>
            <h1 className='text-3xl font-bold mb-1'>Application Tracker</h1>
            <p className='text-muted-foreground text-sm'>Track all your job applications in one place</p>
          </div>
          <Button className='gap-2' onClick={() => setShowAddModal(true)}>
            <Plus className='h-4 w-4' />
            Add Application
          </Button>
        </div>

        {/* Stats */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          {[
            { label: 'Total Applied', value: stats.total, color: 'text-foreground' },
            { label: 'In Progress', value: stats.active, color: 'text-blue-600' },
            { label: 'Offers', value: stats.offers, color: 'text-green-600' },
            { label: 'Rejected', value: stats.rejected, color: 'text-red-500' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className='pt-5 pb-4'>
                <p className='text-sm text-muted-foreground'>{stat.label}</p>
                <p className={cn('text-3xl font-bold mt-1', stat.color)}>{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className='flex items-center justify-between mb-4 gap-4'>
          <div className='flex gap-2'>
            <Button
              variant={viewMode === 'kanban' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setViewMode('kanban')}
              className='gap-2'
            >
              <Grid3x3 className='h-4 w-4' /> Kanban
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size='sm'
              onClick={() => setViewMode('list')}
              className='gap-2'
            >
              <List className='h-4 w-4' /> List
            </Button>
          </div>
          <Input
            placeholder='Search applications...'
            className='max-w-xs'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className='grid grid-cols-4 gap-4'>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className='h-64 bg-muted rounded-lg animate-pulse' />
            ))}
          </div>
        ) : viewMode === 'kanban' ? (
          <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pb-6 overflow-x-auto'>
              {APPLICATION_STAGES.slice(0, 8).map((stage) => (
                <DroppableColumn
                  key={stage}
                  stage={stage}
                  apps={filtered.filter((a) => a.current_stage === stage)}
                />
              ))}
            </div>
            <DragOverlay>
              {activeApp ? (
                <Card className='w-56 shadow-xl opacity-90 cursor-grabbing'>
                  <CardContent className='pt-3 pb-3'>
                    <p className='font-semibold text-sm'>{activeApp.company}</p>
                    <p className='text-xs text-muted-foreground'>{activeApp.role}</p>
                  </CardContent>
                </Card>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <Card>
            <CardContent className='pt-0'>
              <div className='overflow-x-auto'>
                <table className='w-full text-sm'>
                  <thead>
                    <tr className='border-b border-border'>
                      {['Company', 'Role', 'Applied', 'Stage', 'Source', 'Priority', 'Action'].map((h) => (
                        <th key={h} className='text-left py-3 px-4 font-medium text-muted-foreground'>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className='py-8 text-center text-muted-foreground'>
                          No applications yet. Add your first one!
                        </td>
                      </tr>
                    ) : (
                      filtered.map((app) => (
                        <tr key={app.id} className='border-b border-border hover:bg-muted/30 transition-colors'>
                          <td className='py-3 px-4 font-medium'>{app.company}</td>
                          <td className='py-3 px-4'>{app.role}</td>
                          <td className='py-3 px-4 text-xs text-muted-foreground'>
                            {new Date(app.applied_date || app.created_at).toLocaleDateString()}
                          </td>
                          <td className='py-3 px-4'>
                            <Badge
                              variant={
                                app.current_stage.includes('Offer') ? 'success' :
                                app.current_stage === 'Rejected' ? 'destructive' : 'secondary'
                              }
                              size='sm'
                            >
                              {app.current_stage}
                            </Badge>
                          </td>
                          <td className='py-3 px-4 text-xs'>{app.source}</td>
                          <td className='py-3 px-4'>
                            <Badge
                              variant={app.priority === 'High' ? 'destructive' : app.priority === 'Medium' ? 'warning' : 'muted'}
                              size='sm'
                            >
                              {app.priority}
                            </Badge>
                          </td>
                          <td className='py-3 px-4'>
                            <Select
                              value={app.current_stage}
                              onValueChange={async (newStage) => {
                                setApplications((prev) =>
                                  prev.map((a) => a.id === app.id ? { ...a, current_stage: newStage } : a)
                                )
                                try {
                                  await trackerApi.updateStage(app.id, newStage)
                                } catch (e) {
                                  console.error(e)
                                }
                              }}
                            >
                              <SelectTrigger className='h-7 w-36 text-xs'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {APPLICATION_STAGES.map((s) => (
                                  <SelectItem key={s} value={s} className='text-xs'>{s}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showAddModal && (
        <AddApplicationModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddApp}
        />
      )}
    </div>
  )
}
