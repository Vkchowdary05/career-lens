'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/modal'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { GripVertical, Plus, X, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROUND_TYPES, DIFFICULTY_LEVELS, APPLICATION_SOURCES } from '@/lib/constants'

interface InterviewRound {
  id: string
  type: string
  duration: number
  difficulty: string
  narrative: string
  questions: { id: string; text: string }[]
  expanded: boolean
}

export default function ShareExperiencePage() {
  const [currentSection, setCurrentSection] = useState(0)
  const [companyName, setCompanyName] = useState('')
  const [role, setRole] = useState('')
  const [applicationSource, setApplicationSource] = useState('')
  const [rounds, setRounds] = useState<InterviewRound[]>([])
  const [outcome, setOutcome] = useState('')
  const [salary, setSalary] = useState('')
  const [tips, setTips] = useState('')
  const [visibility, setVisibility] = useState('Public')
  const [points, setPoints] = useState(0)

  const sections = [
    { title: 'Company & Role', icon: '🏢' },
    { title: 'Application Source', icon: '📝' },
    { title: 'Interview Rounds', icon: '🎤' },
    { title: 'Outcome & Package', icon: '💼' },
    { title: 'Resources & Tips', icon: '📚' },
  ]

  const calculatePoints = () => {
    let calculatedPoints = 0
    if (companyName) calculatedPoints += 10
    if (role) calculatedPoints += 10
    if (rounds.length > 0) calculatedPoints += 20 * rounds.length
    if (outcome) calculatedPoints += 15
    if (salary) calculatedPoints += 20
    if (tips) calculatedPoints += 15
    setPoints(calculatedPoints)
  }

  const addRound = () => {
    const newRound: InterviewRound = {
      id: Math.random().toString(),
      type: '',
      duration: 60,
      difficulty: 'Medium',
      narrative: '',
      questions: [],
      expanded: true,
    }
    setRounds([...rounds, newRound])
  }

  const updateRound = (id: string, updates: Partial<InterviewRound>) => {
    setRounds(rounds.map(r => r.id === id ? { ...r, ...updates } : r))
  }

  const removeRound = (id: string) => {
    setRounds(rounds.filter(r => r.id !== id))
  }

  const addQuestion = (roundId: string) => {
    setRounds(rounds.map(r => 
      r.id === roundId 
        ? { ...r, questions: [...r.questions, { id: Math.random().toString(), text: '' }] }
        : r
    ))
  }

  React.useEffect(() => {
    calculatePoints()
  }, [companyName, role, rounds, outcome, salary, tips])

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-4xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Share Your Interview Experience</h1>
          <p className='text-muted-foreground'>Help others by sharing your interview journey. Earn points for detailed contributions.</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Left: Section Navigation */}
          <div className='lg:col-span-1'>
            <Card className='sticky top-6'>
              <CardHeader className='pb-4'>
                <CardTitle className='text-sm'>Progress</CardTitle>
              </CardHeader>
              <CardContent className='space-y-2'>
                {sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSection(idx)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2',
                      currentSection === idx
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted text-muted-foreground'
                    )}
                  >
                    <span>{section.icon}</span>
                    {section.title}
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Points Card */}
            <Card className='mt-4'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm'>Estimated Points</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='text-3xl font-bold text-primary'>{points}</div>
                <p className='text-xs text-muted-foreground mt-1'>More details = more points</p>
              </CardContent>
            </Card>
          </div>

          {/* Right: Form Content */}
          <div className='lg:col-span-3'>
            {currentSection === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Company & Role Information</CardTitle>
                  <CardDescription>Tell us about the position you interviewed for</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium mb-1 block'>Company Name</label>
                    <Input
                      placeholder='e.g., Google, Microsoft, Amazon'
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className='text-sm font-medium mb-1 block'>Position/Role</label>
                    <Input
                      placeholder='e.g., Software Engineer, Product Manager'
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                  <div className='flex gap-4 pt-4'>
                    <Button onClick={() => setCurrentSection(1)} className='ml-auto'>
                      Next Section
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentSection === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Application Source</CardTitle>
                  <CardDescription>How did you find this opportunity?</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium mb-2 block'>Where did you apply?</label>
                    <Select value={applicationSource} onValueChange={setApplicationSource}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select application source' />
                      </SelectTrigger>
                      <SelectContent>
                        {APPLICATION_SOURCES.map((source) => (
                          <SelectItem key={source} value={source}>
                            {source}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='flex gap-4 pt-4'>
                    <Button variant='outline' onClick={() => setCurrentSection(0)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentSection(2)} className='ml-auto'>
                      Next Section
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentSection === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Interview Rounds</CardTitle>
                  <CardDescription>Add each round of your interview process</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-3 max-h-96 overflow-y-auto'>
                    {rounds.map((round, idx) => (
                      <div
                        key={round.id}
                        className='border border-border rounded-lg p-4 space-y-3'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2 flex-1'>
                            <GripVertical className='h-4 w-4 text-muted-foreground' />
                            <span className='font-medium text-sm'>Round {idx + 1}</span>
                          </div>
                          <button
                            onClick={() => removeRound(round.id)}
                            className='text-destructive hover:bg-destructive/10 p-1 rounded'
                          >
                            <X className='h-4 w-4' />
                          </button>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <label className='text-xs font-medium mb-1 block'>Type</label>
                            <Select
                              value={round.type}
                              onValueChange={(value) => updateRound(round.id, { type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select type' />
                              </SelectTrigger>
                              <SelectContent>
                                {ROUND_TYPES.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <label className='text-xs font-medium mb-1 block'>Duration (minutes)</label>
                            <Input
                              type='number'
                              value={round.duration}
                              onChange={(e) =>
                                updateRound(round.id, { duration: parseInt(e.target.value) })
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <label className='text-xs font-medium mb-1 block'>Difficulty</label>
                          <Select
                            value={round.difficulty}
                            onValueChange={(value) => updateRound(round.id, { difficulty: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DIFFICULTY_LEVELS.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <label className='text-xs font-medium mb-1 block'>Narrative / Experience</label>
                          <Textarea
                            placeholder='Describe what happened in this round...'
                            value={round.narrative}
                            onChange={(e) => updateRound(round.id, { narrative: e.target.value })}
                            className='min-h-20'
                          />
                        </div>

                        <div className='pt-2 border-t border-border space-y-2'>
                          <div className='flex items-center justify-between'>
                            <label className='text-xs font-medium'>Questions Asked</label>
                            <button
                              onClick={() => addQuestion(round.id)}
                              className='text-primary hover:underline text-xs flex items-center gap-1'
                            >
                              <Plus className='h-3 w-3' />
                              Add Question
                            </button>
                          </div>
                          {round.questions.map((q) => (
                            <Input
                              key={q.id}
                              placeholder='e.g., Design a URL shortener'
                              defaultValue={q.text}
                              className='text-sm'
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button onClick={addRound} variant='outline' className='w-full'>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Round
                  </Button>

                  <div className='flex gap-4 pt-4'>
                    <Button variant='outline' onClick={() => setCurrentSection(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentSection(3)} className='ml-auto'>
                      Next Section
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentSection === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Outcome & Compensation</CardTitle>
                  <CardDescription>How did the interview process conclude?</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium mb-2 block'>Outcome</label>
                    <Select value={outcome} onValueChange={setOutcome}>
                      <SelectTrigger>
                        <SelectValue placeholder='Select outcome' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='Selected'>Selected / Offer Received</SelectItem>
                        <SelectItem value='Rejected'>Rejected</SelectItem>
                        <SelectItem value='Pending'>Pending Decision</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {outcome === 'Selected' && (
                    <div>
                      <label className='text-sm font-medium mb-1 block'>
                        Total Compensation (Annual)
                      </label>
                      <Input
                        type='number'
                        placeholder='e.g., 200000'
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                      />
                    </div>
                  )}

                  <div className='flex gap-4 pt-4'>
                    <Button variant='outline' onClick={() => setCurrentSection(2)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentSection(4)} className='ml-auto'>
                      Next Section
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentSection === 4 && (
              <Card>
                <CardHeader>
                  <CardTitle>Tips & Resources</CardTitle>
                  <CardDescription>Share what helped you prepare</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <label className='text-sm font-medium mb-1 block'>Tips & Advice</label>
                    <Textarea
                      placeholder='Share tips for future candidates preparing for this company...'
                      value={tips}
                      onChange={(e) => setTips(e.target.value)}
                      className='min-h-24'
                    />
                  </div>

                  <div>
                    <label className='text-sm font-medium mb-2 block'>Visibility</label>
                    <div className='space-y-2'>
                      {['Public', 'Private'].map((vis) => (
                        <label key={vis} className='flex items-center gap-2 cursor-pointer'>
                          <Checkbox
                            checked={visibility === vis}
                            onCheckedChange={() => setVisibility(vis)}
                          />
                          <span className='text-sm'>{vis}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className='bg-primary/5 border border-primary/20 rounded-lg p-4'>
                    <p className='text-sm font-medium text-primary mb-1'>
                      ✨ {points} points earned
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Your contribution will help the community!
                    </p>
                  </div>

                  <div className='flex gap-4 pt-4'>
                    <Button variant='outline' onClick={() => setCurrentSection(3)}>
                      Back
                    </Button>
                    <Button className='ml-auto'>Publish Experience</Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
