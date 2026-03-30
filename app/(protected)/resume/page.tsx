'use client'

import React, { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Upload, AlertCircle, Check, ChevronRight, Copy, CheckCircle2, Plus, X, Send, Briefcase, ArrowRight, PartyPopper } from 'lucide-react'
import { cn } from '@/lib/utils'
import { resumeApi, trackerApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

const ROLE_CATEGORIES = ['Engineering', 'Product', 'Design', 'Data', 'Operations']

interface JdAnalysis {
  detected_skills: string[]
  critical_skills: string[]
  nice_to_have_skills: string[]
  experience_level: string
  key_responsibilities: string[]
}

interface SkillChatMessage {
  role: 'ai' | 'user'
  content: string
  skill?: string
  isCritical?: boolean
}

interface EducationEntry {
  institution: string; degree: string; field: string; cgpa_or_percentage: string; year_of_passing: string
}
interface WorkEntry {
  company: string; role: string; duration: string; responsibilities: string
}
interface ProjectEntry {
  name: string; description: string; tech_stack: string; url: string
}

export default function ResumePage() {
  const { clUser } = useAuth()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)

  // Step 1: Job Details
  const [jobDetails, setJobDetails] = useState({
    job_description: '', role_category: '', target_country: 'India', target_city: '', target_company: '',
  })
  const [jdAnalysis, setJdAnalysis] = useState<JdAnalysis | null>(null)
  const [analyzingJd, setAnalyzingJd] = useState(false)

  // Step 2: Profile
  const [profileTab, setProfileTab] = useState<'upload' | 'manual'>('manual')
  const [cvText, setCvText] = useState('')
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [profile, setProfile] = useState({
    full_name: clUser?.full_name || '',
    email: clUser?.email || '',
    phone: '',
    linkedin_url: clUser?.linkedin_url || '',
    github_url: clUser?.github_url || '',
    portfolio_url: '',
    skills: '' as string,
    certifications: '' as string,
    achievements: '' as string,
  })
  const [education, setEducation] = useState<EducationEntry[]>([{ institution: '', degree: '', field: '', cgpa_or_percentage: '', year_of_passing: '' }])
  const [workExperience, setWorkExperience] = useState<WorkEntry[]>([])
  const [projects, setProjects] = useState<ProjectEntry[]>([{ name: '', description: '', tech_stack: '', url: '' }])

  // Step 3: Skill Chat
  const [skillMessages, setSkillMessages] = useState<SkillChatMessage[]>([])
  const [skillAnswers, setSkillAnswers] = useState<Array<{ skill: string; answer: string }>>([])
  const [currentSkillIdx, setCurrentSkillIdx] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  // Step 4: Generate
  const [latexCode, setLatexCode] = useState('')
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [aiError, setAiError] = useState('')

  // Track Application (after generation)
  const [showTrackModal, setShowTrackModal] = useState(false)
  const [trackForm, setTrackForm] = useState({
    company: '',
    role: '',
    source: 'Resume Builder',
    priority: 'Medium',
    employment_type: 'Full-time',
    notes: '',
  })
  const [trackingApp, setTrackingApp] = useState(false)
  const [trackSuccess, setTrackSuccess] = useState(false)

  const steps = [
    { number: 1, title: 'Job Details', completed: currentStep > 0 },
    { number: 2, title: 'Your Profile', completed: currentStep > 1 },
    { number: 3, title: 'Skill Assessment', completed: currentStep > 2 },
    { number: 4, title: 'Generate Resume', completed: currentStep > 3 },
  ]

  // Step 1: Analyze JD
  const handleAnalyzeJd = async () => {
    if (!jobDetails.job_description.trim() || !jobDetails.role_category) return
    setAnalyzingJd(true)
    setAiError('')
    try {
      const data = await resumeApi.analyzeJd({
        job_description: jobDetails.job_description,
        role_category: jobDetails.role_category,
        target_country: jobDetails.target_country,
        target_city: jobDetails.target_city || undefined,
        target_company: jobDetails.target_company || undefined,
      })
      setJdAnalysis(data)
    } catch (e: any) {
      const msg = e?.message || ''
      if (msg.includes('credits') || msg.includes('permission') || msg.includes('403')) {
        setAiError('AI service unavailable: The xAI API key has no credits. Please top up at https://console.x.ai to use this feature.')
      } else {
        setAiError(`Failed to analyze job description: ${msg || 'Please try again.'}`)
      }
    } finally {
      setAnalyzingJd(false)
    }
  }

  // Step 2: Upload CV
  const handleCvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const data = await resumeApi.uploadCv(file)
      setCvText(data.extracted_text || data.text || '')
    } catch (err: any) {
      console.error('CV upload failed', err)
    } finally {
      setUploading(false)
    }
  }

  // Step 3: Start skill chat
  const startSkillChat = () => {
    const skills = jdAnalysis?.detected_skills || jdAnalysis?.critical_skills || []
    if (skills.length === 0) {
      setSkillMessages([{ role: 'ai', content: 'No specific skills detected from the JD. You can proceed to generate your resume.' }])
      return
    }
    setCurrentSkillIdx(0)
    setSkillMessages([{
      role: 'ai',
      content: `I detected ${skills.length} key skills from the job description. Let me assess your experience with each one.\n\nFirst up: **${skills[0]}**\n\nHow would you rate your experience with ${skills[0]}? Please describe your practical experience.`,
      skill: skills[0],
      isCritical: jdAnalysis?.critical_skills?.includes(skills[0]),
    }])
  }

  const handleSkillAnswer = async () => {
    if (!userAnswer.trim()) return
    const skills = jdAnalysis?.detected_skills || jdAnalysis?.critical_skills || []
    const currentSkill = skills[currentSkillIdx]
    if (!currentSkill) return

    setSkillMessages((prev) => [...prev, { role: 'user', content: userAnswer }])
    setSkillAnswers((prev) => [...prev, { skill: currentSkill, answer: userAnswer }])

    setChatLoading(true)
    try {
      const isCritical = jdAnalysis?.critical_skills?.includes(currentSkill) || false
      const response = await resumeApi.skillChat(currentSkill, userAnswer, isCritical)
      setSkillMessages((prev) => [...prev, { role: 'ai', content: response.feedback || response.message || 'Thanks for your response!' }])
    } catch {
      setSkillMessages((prev) => [...prev, { role: 'ai', content: 'Got it! Let\'s move on.' }])
    } finally {
      setChatLoading(false)
    }

    const nextIdx = currentSkillIdx + 1
    if (nextIdx < skills.length) {
      setCurrentSkillIdx(nextIdx)
      setTimeout(() => {
        setSkillMessages((prev) => [...prev, {
          role: 'ai',
          content: `Next skill: **${skills[nextIdx]}**\n\nDescribe your experience with ${skills[nextIdx]}.`,
          skill: skills[nextIdx],
          isCritical: jdAnalysis?.critical_skills?.includes(skills[nextIdx]),
        }])
      }, 1000)
    } else {
      setTimeout(() => {
        setSkillMessages((prev) => [...prev, {
          role: 'ai',
          content: '✅ All skills assessed! You can now proceed to generate your tailored resume.',
        }])
      }, 1000)
    }

    setUserAnswer('')
  }

  // Step 4: Generate Resume
  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const profilePayload = {
        full_name: profile.full_name,
        email: profile.email,
        phone: profile.phone || undefined,
        linkedin_url: profile.linkedin_url || undefined,
        github_url: profile.github_url || undefined,
        portfolio_url: profile.portfolio_url || undefined,
        education: education.filter((e) => e.institution),
        work_experience: workExperience.filter((w) => w.company),
        projects: projects.filter((p) => p.name).map((p) => ({
          ...p,
          tech_stack: p.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
        })),
        skills: profile.skills.split(',').map((s) => s.trim()).filter(Boolean),
        certifications: profile.certifications.split(',').map((s) => s.trim()).filter(Boolean),
        achievements: profile.achievements.split(',').map((s) => s.trim()).filter(Boolean),
        cv_extracted_text: cvText || undefined,
      }

      const data = await resumeApi.generate({
        job_details: jobDetails,
        profile: profilePayload,
        skill_answers: skillAnswers,
      })
      setLatexCode(data.latex || data.latex_code || '')
      // Pre-fill tracking form with job details
      setTrackForm({
        company: jobDetails.target_company || '',
        role: jobDetails.role_category || '',
        source: 'Resume Builder',
        priority: 'Medium',
        employment_type: 'Full-time',
        notes: `Generated ATS resume for this role`,
      })
    } catch (e: any) {
      const msg = e?.message || ''
      if (msg.includes('credits') || msg.includes('permission') || msg.includes('403')) {
        setAiError('AI service unavailable: The xAI API key has no credits. Please top up at https://console.x.ai.')
      } else {
        setAiError(`Resume generation failed: ${msg || 'Please try again.'}`)
      }
    } finally {
      setGenerating(false)
    }
  }

  const handleTrackApplication = async () => {
    if (!trackForm.company || !trackForm.role) return
    setTrackingApp(true)
    try {
      await trackerApi.create({
        company: trackForm.company,
        role: trackForm.role,
        employment_type: trackForm.employment_type,
        source: trackForm.source,
        priority: trackForm.priority,
        notes: trackForm.notes,
        applied_date: new Date().toISOString(),
        job_description: jobDetails.job_description,
      })
      setTrackSuccess(true)
    } catch (e: any) {
      console.error('Failed to track application', e)
    } finally {
      setTrackingApp(false)
    }
  }

  const copyLatex = () => {
    navigator.clipboard.writeText(latexCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  React.useEffect(() => {
    if (currentStep === 2 && skillMessages.length === 0) {
      startSkillChat()
    }
  }, [currentStep])

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Resume Optimizer</h1>
          <p className='text-muted-foreground'>
            AI-powered resume tailoring to match any job description
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
                  <div className={cn('flex-1 h-1 mx-2 transition-colors', currentStep > idx ? 'bg-accent' : 'bg-muted')} />
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
          {jdAnalysis && currentStep > 0 && (
            <div className='lg:col-span-1'>
              <Card className='sticky top-6'>
                <CardHeader className='pb-4'>
                  <CardTitle className='text-sm'>Detected Requirements</CardTitle>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <div>
                    <p className='text-xs font-medium text-muted-foreground mb-1'>Critical Skills</p>
                    <div className='flex flex-wrap gap-1'>
                      {(jdAnalysis.critical_skills || []).map((skill) => (
                        <Badge key={skill} variant='destructive' className='text-xs'>{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className='text-xs font-medium text-muted-foreground mb-1'>Nice to Have</p>
                    <div className='flex flex-wrap gap-1'>
                      {(jdAnalysis.nice_to_have_skills || []).map((skill) => (
                        <Badge key={skill} variant='secondary' className='text-xs'>{skill}</Badge>
                      ))}
                    </div>
                  </div>
                  {jdAnalysis.experience_level && (
                    <div className='pt-2 border-t border-border'>
                      <p className='text-xs font-medium text-muted-foreground'>Experience Level</p>
                      <p className='text-xs'>{jdAnalysis.experience_level}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Right: Form Content */}
          <div className={cn(jdAnalysis && currentStep > 0 ? 'lg:col-span-3' : 'lg:col-span-4')}>
            {/* Step 1: Job Details */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                  <CardDescription>Provide the job description you&apos;re applying for</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>Country</label>
                      <Select value={jobDetails.target_country} onValueChange={(v) => setJobDetails({ ...jobDetails, target_country: v })}>
                        <SelectTrigger><SelectValue placeholder='Select country' /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value='India'>India</SelectItem>
                          <SelectItem value='US'>United States</SelectItem>
                          <SelectItem value='UK'>United Kingdom</SelectItem>
                          <SelectItem value='Canada'>Canada</SelectItem>
                          <SelectItem value='Germany'>Germany</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>City (optional)</label>
                      <Input placeholder='e.g., Bangalore' value={jobDetails.target_city} onChange={(e) => setJobDetails({ ...jobDetails, target_city: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label className='text-sm font-medium mb-1 block'>Job Description *</label>
                    <Textarea
                      placeholder='Paste the full job description here...'
                      value={jobDetails.job_description}
                      onChange={(e) => setJobDetails({ ...jobDetails, job_description: e.target.value })}
                      className='min-h-32'
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-4'>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>Role Category *</label>
                      <Select value={jobDetails.role_category} onValueChange={(v) => setJobDetails({ ...jobDetails, role_category: v })}>
                        <SelectTrigger><SelectValue placeholder='Select category' /></SelectTrigger>
                        <SelectContent>
                          {ROLE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className='text-sm font-medium mb-1 block'>Target Company (optional)</label>
                      <Input placeholder='e.g., Google' value={jobDetails.target_company} onChange={(e) => setJobDetails({ ...jobDetails, target_company: e.target.value })} />
                    </div>
                  </div>

                  <Button
                    className='w-full'
                    onClick={handleAnalyzeJd}
                    disabled={analyzingJd || !jobDetails.job_description.trim() || !jobDetails.role_category}
                  >
                    {analyzingJd ? 'Analyzing JD with AI...' : 'Analyze Job Description'}
                  </Button>

                  {aiError && (
                    <div className='p-4 rounded-lg bg-destructive/10 border border-destructive/20'>
                      <p className='text-sm font-medium text-destructive flex items-start gap-2'>
                        <AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
                        <span>{aiError}</span>
                      </p>
                    </div>
                  )}

                  {jdAnalysis && (
                    <div className='p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'>
                      <p className='text-sm font-medium text-green-700 dark:text-green-400 flex items-center gap-2'>
                        <CheckCircle2 className='h-4 w-4' />
                        JD analyzed! {(jdAnalysis.detected_skills || []).length} skills detected.
                      </p>
                    </div>
                  )}

                  <div className='flex gap-4 pt-4'>
                    <Button
                      onClick={() => setCurrentStep(1)}
                      className='ml-auto'
                      disabled={!jdAnalysis && !jobDetails.job_description.trim()}
                    >
                      Next <ChevronRight className='h-4 w-4 ml-2' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Profile */}
            {currentStep === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Profile</CardTitle>
                  <CardDescription>
                    {profileTab === 'upload' ? 'Upload your CV to auto-fill' : 'Fill in your information manually'}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex gap-2 border-b border-border pb-4'>
                    <Button variant={profileTab === 'upload' ? 'default' : 'ghost'} onClick={() => setProfileTab('upload')} size='sm'>Upload CV</Button>
                    <Button variant={profileTab === 'manual' ? 'default' : 'ghost'} onClick={() => setProfileTab('manual')} size='sm'>Fill Manually</Button>
                  </div>

                  {profileTab === 'upload' ? (
                    <div>
                      <input ref={fileInputRef} type='file' accept='.pdf,.doc,.docx,.txt' className='hidden' onChange={handleCvUpload} />
                      <div
                        className='border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors'
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className='h-8 w-8 text-muted-foreground mx-auto mb-2' />
                        <p className='text-sm font-medium mb-1'>
                          {uploading ? 'Uploading & extracting...' : 'Click to upload your CV'}
                        </p>
                        <p className='text-xs text-muted-foreground'>PDF, DOC, DOCX, or TXT</p>
                      </div>
                      {cvText && (
                        <div className='mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20'>
                          <p className='text-sm text-green-700 dark:text-green-400 flex items-center gap-2'>
                            <CheckCircle2 className='h-4 w-4' />
                            CV text extracted ({cvText.length} characters). You can now proceed!
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='text-sm font-medium mb-1 block'>Full Name</label>
                          <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} />
                        </div>
                        <div>
                          <label className='text-sm font-medium mb-1 block'>Email</label>
                          <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                        </div>
                      </div>
                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='text-sm font-medium mb-1 block'>Phone</label>
                          <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} placeholder='+91...' />
                        </div>
                        <div>
                          <label className='text-sm font-medium mb-1 block'>LinkedIn URL</label>
                          <Input value={profile.linkedin_url} onChange={(e) => setProfile({ ...profile, linkedin_url: e.target.value })} />
                        </div>
                      </div>

                      {/* Education */}
                      <div>
                        <div className='flex items-center justify-between mb-2'>
                          <label className='text-sm font-medium'>Education</label>
                          <button onClick={() => setEducation([...education, { institution: '', degree: '', field: '', cgpa_or_percentage: '', year_of_passing: '' }])} className='text-xs text-primary hover:underline flex items-center gap-1'>
                            <Plus className='h-3 w-3' /> Add
                          </button>
                        </div>
                        {education.map((edu, i) => (
                          <div key={i} className='grid grid-cols-3 gap-2 mb-2'>
                            <Input placeholder='Institution' value={edu.institution} onChange={(e) => { const a = [...education]; a[i].institution = e.target.value; setEducation(a) }} />
                            <Input placeholder='Degree' value={edu.degree} onChange={(e) => { const a = [...education]; a[i].degree = e.target.value; setEducation(a) }} />
                            <Input placeholder='Field' value={edu.field} onChange={(e) => { const a = [...education]; a[i].field = e.target.value; setEducation(a) }} />
                          </div>
                        ))}
                      </div>

                      {/* Projects */}
                      <div>
                        <div className='flex items-center justify-between mb-2'>
                          <label className='text-sm font-medium'>Projects</label>
                          <button onClick={() => setProjects([...projects, { name: '', description: '', tech_stack: '', url: '' }])} className='text-xs text-primary hover:underline flex items-center gap-1'>
                            <Plus className='h-3 w-3' /> Add
                          </button>
                        </div>
                        {projects.map((proj, i) => (
                          <div key={i} className='grid grid-cols-2 gap-2 mb-2'>
                            <Input placeholder='Project name' value={proj.name} onChange={(e) => { const a = [...projects]; a[i].name = e.target.value; setProjects(a) }} />
                            <Input placeholder='Tech stack (comma-separated)' value={proj.tech_stack} onChange={(e) => { const a = [...projects]; a[i].tech_stack = e.target.value; setProjects(a) }} />
                            <Textarea placeholder='Description' value={proj.description} onChange={(e) => { const a = [...projects]; a[i].description = e.target.value; setProjects(a) }} className='col-span-2 min-h-16' />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className='text-sm font-medium mb-1 block'>Skills (comma-separated)</label>
                        <Input placeholder='React, TypeScript, Python...' value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} />
                      </div>
                    </div>
                  )}

                  <div className='flex gap-4 pt-4'>
                    <Button variant='outline' onClick={() => setCurrentStep(0)}>Back</Button>
                    <Button onClick={() => setCurrentStep(2)} className='ml-auto'>
                      Next <ChevronRight className='h-4 w-4 ml-2' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Skill Chat */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle>Skill Assessment</CardTitle>
                  <CardDescription>AI-powered skill gap analysis based on the JD</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='space-y-4 max-h-96 overflow-y-auto pr-2'>
                    {skillMessages.map((msg, i) => (
                      <div key={i} className={cn('flex gap-3', msg.role === 'user' && 'justify-end')}>
                        {msg.role === 'ai' && (
                          <div className='h-8 w-8 rounded-full bg-primary/20 flex-shrink-0 flex items-center justify-center text-xs font-bold text-primary'>AI</div>
                        )}
                        <div className={cn(
                          'rounded-lg p-3 max-w-[80%] text-sm',
                          msg.role === 'ai' ? 'bg-muted' : 'bg-primary text-primary-foreground',
                          msg.isCritical && msg.role === 'ai' && 'border-l-4 border-destructive'
                        )}>
                          <p className='whitespace-pre-wrap'>{msg.content}</p>
                          {msg.isCritical && msg.role === 'ai' && (
                            <Badge variant='destructive' size='sm' className='mt-2'>Critical Skill</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className='flex gap-3'>
                        <div className='h-8 w-8 rounded-full bg-primary/20 flex-shrink-0' />
                        <div className='bg-muted rounded-lg p-3'><div className='animate-pulse flex gap-1'><div className='h-2 w-2 rounded-full bg-muted-foreground' /><div className='h-2 w-2 rounded-full bg-muted-foreground' /><div className='h-2 w-2 rounded-full bg-muted-foreground' /></div></div>
                      </div>
                    )}
                  </div>

                  <div className='flex gap-2 pt-2 border-t border-border'>
                    <Input
                      placeholder='Describe your experience with this skill...'
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSkillAnswer()}
                      className='flex-1'
                    />
                    <Button onClick={handleSkillAnswer} disabled={chatLoading || !userAnswer.trim()} size='icon'>
                      <Send className='h-4 w-4' />
                    </Button>
                  </div>

                  <div className='flex gap-4 pt-4'>
                    <Button variant='outline' onClick={() => setCurrentStep(1)}>Back</Button>
                    <Button onClick={() => setCurrentStep(3)} className='ml-auto'>
                      Next <ChevronRight className='h-4 w-4 ml-2' />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 4: Generate */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Generate Your Resume</CardTitle>
                  <CardDescription>
                    AI will create an ATS-optimized LaTeX resume tailored to the job description
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-6'>
                  {!latexCode ? (
                    <div className='text-center py-8'>
                      <p className='text-muted-foreground mb-4'>
                        Ready to generate your tailored resume with {skillAnswers.length} skill assessments applied.
                      </p>
                      <Button onClick={handleGenerate} disabled={generating} size='lg'>
                        {generating ? 'Generating with AI...' : '✨ Generate Resume'}
                      </Button>
                    </div>
                  ) : (
                    <div className='space-y-4'>
                      <div className='flex items-center justify-between'>
                        <h3 className='font-medium'>Generated LaTeX Code</h3>
                        <Button variant='outline' size='sm' onClick={copyLatex} className='gap-2'>
                          {copied ? <CheckCircle2 className='h-4 w-4 text-green-500' /> : <Copy className='h-4 w-4' />}
                          {copied ? 'Copied!' : 'Copy LaTeX'}
                        </Button>
                      </div>
                      <div className='relative'>
                        <pre className='p-4 rounded-lg bg-muted text-xs font-mono overflow-auto max-h-96 whitespace-pre-wrap'>
                          {latexCode}
                        </pre>
                      </div>
                      <div className='p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'>
                        <p className='text-sm text-blue-700 dark:text-blue-400'>
                          💡 Copy the LaTeX code above and paste it into <a href='https://www.overleaf.com' target='_blank' rel='noopener noreferrer' className='underline font-medium'>Overleaf</a> to compile it into a PDF.
                        </p>
                      </div>

                      {/* Track Application Prompt */}
                      {!showTrackModal && !trackSuccess && (
                        <div className='p-5 rounded-xl bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-900/20 dark:to-indigo-900/20 border border-violet-200 dark:border-violet-800'>
                          <div className='flex items-start gap-4'>
                            <div className='h-10 w-10 rounded-full bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center flex-shrink-0'>
                              <Briefcase className='h-5 w-5 text-violet-600 dark:text-violet-400' />
                            </div>
                            <div className='flex-1'>
                              <h4 className='font-semibold text-violet-900 dark:text-violet-200 mb-1'>Track this application?</h4>
                              <p className='text-sm text-violet-700 dark:text-violet-300 mb-3'>
                                Keep track of your application progress for this role. We'll save the company, role, and job description so you can monitor your pipeline.
                              </p>
                              <div className='flex gap-2'>
                                <Button size='sm' onClick={() => setShowTrackModal(true)} className='gap-2 bg-violet-600 hover:bg-violet-700'>
                                  <CheckCircle2 className='h-4 w-4' /> Yes, Track It
                                </Button>
                                <Button size='sm' variant='ghost' className='text-violet-600 dark:text-violet-400'>
                                  Skip
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Track Application Form Modal */}
                      {showTrackModal && !trackSuccess && (
                        <div className='p-5 rounded-xl border border-violet-200 dark:border-violet-800 bg-card space-y-4'>
                          <div className='flex items-center justify-between'>
                            <h4 className='font-semibold flex items-center gap-2'>
                              <Briefcase className='h-4 w-4 text-violet-600' /> Track Application
                            </h4>
                            <button onClick={() => setShowTrackModal(false)} className='p-1 hover:bg-muted rounded'>
                              <X className='h-4 w-4' />
                            </button>
                          </div>
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <label className='text-sm font-medium mb-1 block'>Company *</label>
                              <Input
                                placeholder='e.g., Google'
                                value={trackForm.company}
                                onChange={(e) => setTrackForm({ ...trackForm, company: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className='text-sm font-medium mb-1 block'>Role *</label>
                              <Input
                                placeholder='e.g., Software Engineer'
                                value={trackForm.role}
                                onChange={(e) => setTrackForm({ ...trackForm, role: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className='text-sm font-medium mb-1 block'>Employment Type</label>
                              <Select value={trackForm.employment_type} onValueChange={(v) => setTrackForm({ ...trackForm, employment_type: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {['Full-time', 'Internship', 'Contract', 'Part-time'].map((t) => (
                                    <SelectItem key={t} value={t}>{t}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className='text-sm font-medium mb-1 block'>Priority</label>
                              <Select value={trackForm.priority} onValueChange={(v) => setTrackForm({ ...trackForm, priority: v })}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  {['Low', 'Medium', 'High'].map((p) => (
                                    <SelectItem key={p} value={p}>{p}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div>
                            <label className='text-sm font-medium mb-1 block'>Notes (optional)</label>
                            <Input
                              placeholder='Any notes...'
                              value={trackForm.notes}
                              onChange={(e) => setTrackForm({ ...trackForm, notes: e.target.value })}
                            />
                          </div>
                          <div className='flex gap-2 justify-end'>
                            <Button variant='outline' size='sm' onClick={() => setShowTrackModal(false)}>Cancel</Button>
                            <Button
                              size='sm'
                              onClick={handleTrackApplication}
                              disabled={trackingApp || !trackForm.company || !trackForm.role}
                              className='gap-2 bg-violet-600 hover:bg-violet-700'
                            >
                              {trackingApp ? 'Adding...' : 'Add to Tracker'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Track Success */}
                      {trackSuccess && (
                        <div className='p-5 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800'>
                          <div className='flex items-center gap-3'>
                            <div className='h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center flex-shrink-0'>
                              <PartyPopper className='h-5 w-5 text-green-600 dark:text-green-400' />
                            </div>
                            <div className='flex-1'>
                              <h4 className='font-semibold text-green-800 dark:text-green-200'>Application tracked!</h4>
                              <p className='text-sm text-green-700 dark:text-green-300'>
                                Your application for <strong>{trackForm.role}</strong> at <strong>{trackForm.company}</strong> has been added to your tracker.
                              </p>
                            </div>
                            <Button
                              size='sm'
                              variant='outline'
                              onClick={() => router.push('/tracker')}
                              className='gap-2 border-green-300 text-green-700 hover:bg-green-100 dark:border-green-700 dark:text-green-400 dark:hover:bg-green-900/40'
                            >
                              View Tracker <ArrowRight className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className='flex gap-4 pt-4'>
                    <Button variant='outline' onClick={() => setCurrentStep(2)}>Back</Button>
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
