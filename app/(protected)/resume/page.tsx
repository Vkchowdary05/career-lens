'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Progress } from '@/components/ui/Progress'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { Upload, AlertCircle, Check, ChevronRight, Download, Copy } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROLE_CATEGORIES = ['Engineering', 'Product', 'Design', 'Data', 'Operations']
const COMPANIES = ['Google', 'Microsoft', 'Meta', 'Amazon', 'Apple', 'Netflix', 'Stripe']

interface Step {
  number: number
  title: string
  completed: boolean
}

export default function ResumePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [jobDetails, setJobDetails] = useState({
    country: '',
    city: '',
    jobDescription: '',
    roleCategory: '',
    targetCompany: '',
  })
  const [profileTab, setProfileTab] = useState<'upload' | 'manual'>('manual')
  const [resumeScore, setResumeScore] = useState(72)

  const steps: Step[] = [
    { number: 1, title: 'Job Details', completed: currentStep > 0 },
    { number: 2, title: 'Your Profile', completed: currentStep > 1 },
    { number: 3, title: 'Skill Assessment', completed: currentStep > 2 },
    { number: 4, title: 'Review Resume', completed: currentStep > 3 },
  ]

  const skillMatchData = [
    { name: 'React', match: 95, required: 100 },
    { name: 'TypeScript', match: 85, required: 100 },
    { name: 'Node.js', match: 78, required: 90 },
    { name: 'System Design', match: 65, required: 95 },
    { name: 'AWS', match: 45, required: 80 },
  ]

  const scoreData = [
    { name: 'Match', value: resumeScore, fill: '#3377CC' },
    { name: 'Gap', value: 100 - resumeScore, fill: '#E5E7EB' },
  ]

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Resume Optimizer</h1>
          <p className='text-muted-foreground'>
            Optimize your resume to match job requirements and increase match score
          </p>
        </div>

        {/* Step Indicator */}
        <div className='mb-8'>
          <div className='flex items-center justify-between mb-4'>
            {steps.map((step, idx) => (
              <React.Fragment key={step.number}>
                <button
                  onClick={() => setCurrentStep(idx)}
                  className={cn(
                    'relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                    currentStep === idx
                      ? 'bg-primary text-primary-foreground'
                      : currentStep > idx
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {currentStep > idx ? <Check className='h-5 w-5' /> : step.number}
                </button>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      'flex-1 h-1 mx-2 transition-colors',
                      currentStep > idx ? 'bg-accent' : 'bg-muted'
                    )}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className='flex justify-between text-xs text-muted-foreground'>
            {steps.map((step) => (
              <span key={step.number}>{step.title}</span>
            ))}
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Left: Detected Requirements */}
          {currentStep > 0 && (
            <div className='lg:col-span-1'>
              <Card className='sticky top-6'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-sm'>Detected Requirements</CardTitle>
                </CardHeader>
                <CardContent className='space-y-2'>
                  <div className='space-y-2'>
                    <p className='text-xs font-medium text-muted-foreground'>Skills</p>
                    <div className='flex flex-wrap gap-1'>
                      {['React', 'TypeScript', 'Node.js', 'AWS', 'MongoDB'].map((skill) => (
                        <Badge key={skill} variant='secondary' className='text-xs'>
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className='pt-4 space-y-2 border-t border-border'>
                    <p className='text-xs font-medium text-muted-foreground'>Experience</p>
                    <p className='text-xs'>3-5 years of experience required</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Right: Form Content */}
          <div className={cn(currentStep > 0 ? 'lg:col-span-3' : 'lg:col-span-4')}>
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>
                    Provide the job description you&apos;re applying for
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>Country</label>
                      <Select value={jobDetails.country} onValueChange={(v) => setJobDetails({ ...jobDetails, country: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select country' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='US'>United States</SelectItem>
                          <SelectItem value='CA'>Canada</SelectItem>
                          <SelectItem value='UK'>United Kingdom</SelectItem>
                          <SelectItem value='IN'>India</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>City</label>
                      <Input
                        placeholder='e.g., San Francisco'
                        value={jobDetails.city}
                        onChange={(e) => setJobDetails({ ...jobDetails, city: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className='text-sm font-medium mb-1 block'>Job Description</label>
                    <Textarea
                      placeholder='Paste the job description here...'
                      value={jobDetails.jobDescription}
                      onChange={(e) => setJobDetails({ ...jobDetails, jobDescription: e.target.value })}
                      className='min-h-32'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>Role Category</label>
                      <Select value={jobDetails.roleCategory} onValueChange={(v) => setJobDetails({ ...jobDetails, roleCategory: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select category' />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>Target Company</label>
                      <Select value={jobDetails.targetCompany} onValueChange={(v) => setJobDetails({ ...jobDetails, targetCompany: v })}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select company' />
                        </SelectTrigger>
                        <SelectContent>
                          {COMPANIES.map((company) => (
                            <SelectItem key={company} value={company}>
                              {company}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button className='w-full'>
                    Analyze Job Description
                  </Button>

                  <div className='flex gap-4 pt-4'>
                    <Button onClick={() => setCurrentStep(1)} className='ml-auto'>
                      Next <ChevronRight className='h-4 w-4 ml-2' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>
                    {profileTab === 'upload' ? 'Upload your CV' : 'Fill in your information manually'}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex gap-2 border-b border-border pb-4'>
                    <Button
                      variant={profileTab === 'upload' ? 'default' : 'ghost'}
                      onClick={() => setProfileTab('upload')}
                      size='sm'
                    >
                      Upload CV
                    </Button>
                    <Button
                      variant={profileTab === 'manual' ? 'default' : 'ghost'}
                      onClick={() => setProfileTab('manual')}
                      size='sm'
                    >
                      Fill Manually
                    </Button>
                  </div>

                  {profileTab === 'upload' ? (
                    <div className='border-2 border-dashed border-border rounded-lg p-8 text-center'>
                      <Upload className='h-8 w-8 text-muted-foreground mx-auto mb-2' />
                      <p className='text-sm font-medium mb-1'>Drag and drop your CV</p>
                      <p className='text-xs text-muted-foreground'>or click to browse</p>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='text-sm font-medium mb-1 block'>First Name</label>
                          <Input placeholder='John' />
                        </div>
                        <div>
                          <label className='text-sm font-medium mb-1 block'>Last Name</label>
                          <Input placeholder='Doe' />
                        </div>
                      </div>
                      <div>
                        <label className='text-sm font-medium mb-1 block'>Email</label>
                        <Input placeholder='john@example.com' />
                      </div>
                      <div>
                        <label className='text-sm font-medium mb-1 block'>Experience Summary</label>
                        <Textarea placeholder='Describe your work experience...' className='min-h-24' />
                      </div>
                    </div>
                  )}

                  <div className='flex gap-4 pt-4'>
                    <Button variant='outline' onClick={() => setCurrentStep(0)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(2)} className='ml-auto'>
                      Next <ChevronRight className='h-4 w-4 ml-2' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skill Assessment</CardTitle>
                  <CardDescription>
                    Let&apos;s assess your skills against job requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {/* Chat-like assessment */}
                  <div className='space-y-4 max-h-96 overflow-y-auto'>
                    <div className='flex gap-3'>
                      <div className='h-8 w-8 rounded-full bg-secondary/20 flex-shrink-0' />
                      <div className='bg-muted rounded-lg p-3 flex-1'>
                        <p className='text-sm'>
                          Based on the job description, I see you need React, TypeScript, and System Design skills. How comfortable are you with these areas?
                        </p>
                      </div>
                    </div>

                    {/* Assessment options */}
                    <div className='flex flex-col gap-2 ml-11'>
                      {['Very Comfortable', 'Somewhat Comfortable', 'Need to Improve'].map((option) => (
                        <button
                          key={option}
                          className='text-left px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors'
                        >
                          {option}
                        </button>
                      ))}
                    </div>

                    {/* System message */}
                    <div className='flex gap-3 mt-4'>
                      <div className='h-8 w-8 rounded-full bg-primary/20 flex-shrink-0' />
                      <div className='bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex-1'>
                        <p className='text-sm text-destructive font-medium flex items-center gap-2'>
                          <AlertCircle className='h-4 w-4' />
                          Critical Gap: System Design skills
                        </p>
                        <p className='text-xs text-destructive/80 mt-1'>
                          This is a high priority skill for this role
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className='flex gap-4 pt-4'>
                    <Button variant='outline' onClick={() => setCurrentStep(1)}>
                      Back
                    </Button>
                    <Button onClick={() => setCurrentStep(3)} className='ml-auto'>
                      Next <ChevronRight className='h-4 w-4 ml-2' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Resume Score</CardTitle>
                  <CardDescription>
                    Your resume is ready for review
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  <div className='grid grid-cols-2 gap-6'>
                    {/* Score Chart */}
                    <div>
                      <ResponsiveContainer width='100%' height={200}>
                        <PieChart>
                          <Pie
                            data={scoreData}
                            cx='50%'
                            cy='50%'
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey='value'
                          >
                            {scoreData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className='text-center mt-2'>
                        <p className='text-3xl font-bold'>{resumeScore}</p>
                        <p className='text-xs text-muted-foreground'>Match Score</p>
                      </div>
                    </div>

                    {/* Skill Match Breakdown */}
                    <div className='space-y-3'>
                      <p className='text-sm font-medium'>Skill Match Breakdown</p>
                      {skillMatchData.map((skill) => (
                        <div key={skill.name} className='space-y-1'>
                          <div className='flex justify-between text-xs'>
                            <span>{skill.name}</span>
                            <span className='text-muted-foreground'>{skill.match}%</span>
                          </div>
                          <Progress value={skill.match} className='h-1' />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='border-t border-border pt-6'>
                    <p className='text-sm font-medium mb-3'>Actions</p>
                    <div className='flex flex-col gap-2'>
                      <Button variant='outline' className='justify-start'>
                        <Copy className='h-4 w-4 mr-2' />
                        Copy LaTeX
                      </Button>
                      <Button variant='outline' className='justify-start'>
                        <Download className='h-4 w-4 mr-2' />
                        Download PDF
                      </Button>
                      <Button className='justify-start'>
                        Start Tracking Applications
                      </Button>
                    </div>
                  </div>

                  <div className='flex gap-4 pt-4'>
                    <Button variant='outline' onClick={() => setCurrentStep(2)}>
                      Back
                    </Button>
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
