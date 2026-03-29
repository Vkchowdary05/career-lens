'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import {
  BarChart3, Users, TrendingUp, Building2, Clock, CheckCircle2,
  XCircle, Copy, ChevronRight, Search, AlertTriangle, Star,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { companiesApi, experiencesApi } from '@/lib/api'

const COLORS = ['#3377CC', '#4DB8A8', '#2DD4BF', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color?: string }) {
  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <div className={color || 'text-primary'}>{icon}</div>
            <p className='text-2xl font-bold text-foreground'>{value}</p>
          </div>
          <p className='text-xs text-muted-foreground'>{label}</p>
        </div>
      </CardContent>
    </Card>
  )
}

function RoundDistributionChart({ data }: { data: Array<{ type: string; count: number }> }) {
  if (!data || data.length === 0) return <p className='text-center text-muted-foreground py-8'>No round data yet</p>
  const chartData = data.slice(0, 8).map((d) => ({
    name: d.type.length > 20 ? d.type.slice(0, 20) + '...' : d.type,
    fullName: d.type,
    count: d.count,
  }))
  return (
    <ResponsiveContainer width='100%' height={280}>
      <BarChart data={chartData} layout='vertical' margin={{ left: 20, right: 30, top: 5, bottom: 5 }}>
        <CartesianGrid strokeDasharray='3 3' horizontal={false} />
        <XAxis type='number' tick={{ fontSize: 11 }} />
        <YAxis type='category' dataKey='name' width={160} tick={{ fontSize: 11 }} />
        <Tooltip
          formatter={(value: number) => [value, 'Occurrences']}
          labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
        />
        <Bar dataKey='count' fill='#3377CC' radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function OutcomeChart({ data }: { data: Array<{ outcome: string; count: number }> }) {
  if (!data || data.length === 0) return <p className='text-center text-muted-foreground py-8'>No outcome data yet</p>
  const total = data.reduce((s, d) => s + d.count, 0)
  const chartData = data.map((d) => ({
    name: d.outcome,
    value: d.count,
    pct: total ? Math.round((d.count / total) * 100) : 0,
  }))
  return (
    <ResponsiveContainer width='100%' height={240}>
      <PieChart>
        <Pie
          data={chartData}
          cx='50%'
          cy='50%'
          outerRadius={90}
          dataKey='value'
          label={({ name, pct }) => `${pct}%`}
          labelLine={false}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number, name: string) => [value, name]} />
        <Legend formatter={(value) => <span className='text-xs'>{value}</span>} />
      </PieChart>
    </ResponsiveContainer>
  )
}

function SourceChart({ data }: { data: Array<{ source: string; count: number }> }) {
  if (!data || data.length === 0) return <p className='text-center text-muted-foreground py-8'>No source data yet</p>
  const total = data.reduce((s, d) => s + d.count, 0)
  const chartData = data.slice(0, 6).map((d) => ({
    name: d.source,
    value: d.count,
    pct: total ? Math.round((d.count / total) * 100) : 0,
  }))
  return (
    <ResponsiveContainer width='100%' height={240}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray='3 3' vertical={false} />
        <XAxis dataKey='name' tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip formatter={(v: number) => [v, 'Candidates']} />
        <Bar dataKey='value' radius={[4, 4, 0, 0]}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function PackageChart({ data }: { data: Array<{ range: string; count: number }> }) {
  if (!data || data.length === 0) return <p className='text-center text-muted-foreground py-8'>No package data yet</p>
  const chartData = data.map((d) => ({ name: d.range, count: d.count }))
  return (
    <ResponsiveContainer width='100%' height={200}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray='3 3' vertical={false} />
        <XAxis dataKey='name' tick={{ fontSize: 9 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Bar dataKey='count' fill='#4DB8A8' radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function CompanyDetailPage({ params }: { params: { slug: string } }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'rounds' | 'skills' | 'experiences' | 'questions'>('overview')
  const [company, setCompany] = useState<any>(null)
  const [analysis, setAnalysis] = useState<any>(null)
  const [experiences, setExperiences] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const [questionSearch, setQuestionSearch] = useState('')
  const [copied, setCopied] = useState('')

  const slug = params.slug

  useEffect(() => {
    loadCompanyData()
  }, [slug])

  useEffect(() => {
    if (activeTab === 'overview' && !analysis && company && company.total_experiences >= 3) {
      loadAnalysis()
    }
    if (activeTab === 'experiences' && experiences.length === 0) {
      loadExperiences()
    }
  }, [activeTab, company])

  const loadCompanyData = async () => {
    setLoading(true)
    try {
      const data = await companiesApi.get(slug)
      setCompany(data)
    } catch (e) {
      console.error('Failed to load company', e)
    } finally {
      setLoading(false)
    }
  }

  const loadAnalysis = async () => {
    setAnalysisLoading(true)
    try {
      const data = await companiesApi.getAnalysis(slug)
      setAnalysis(data)
    } catch (e) {
      console.error('Failed to load analysis', e)
    } finally {
      setAnalysisLoading(false)
    }
  }

  const loadExperiences = async () => {
    try {
      const data = await companiesApi.getExperiences(slug)
      setExperiences(data.experiences || [])
    } catch (e) {
      console.error(e)
    }
  }

  const copyQuestion = (q: string) => {
    navigator.clipboard.writeText(q)
    setCopied(q)
    setTimeout(() => setCopied(''), 2000)
  }

  if (loading) {
    return (
      <div className='p-6 space-y-6'>
        <div className='animate-pulse'>
          <div className='h-16 w-16 bg-muted rounded-lg mb-4' />
          <div className='h-8 bg-muted rounded w-48 mb-2' />
          <div className='h-4 bg-muted rounded w-64' />
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className='p-6 text-center'>
        <p className='text-muted-foreground'>Company not found</p>
      </div>
    )
  }

  const companyName = company.name || slug.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase())
  const offerCount = (company.outcome_distribution || []).find((o: any) => o.outcome === 'Got the Offer')?.count || 0
  const offerRate = company.total_experiences > 0 ? Math.round((offerCount / company.total_experiences) * 100) : 0
  const avgRounds = company.round_distribution?.length > 0
    ? Math.round(company.round_distribution.reduce((s: number, r: any) => s + r.count, 0) / (company.total_experiences || 1))
    : 0

  const filteredQuestions = (company.questions || []).filter(
    (q: any) => !questionSearch || q.question?.toLowerCase().includes(questionSearch.toLowerCase())
  )

  const questionFrequency: Record<string, { question: string; roundType: string; count: number }> = {}
  filteredQuestions.forEach((q: any) => {
    const key = q.question?.toLowerCase().trim()
    if (key) {
      if (!questionFrequency[key]) {
        questionFrequency[key] = { question: q.question, roundType: q.round_type || 'General', count: 0 }
      }
      questionFrequency[key].count++
    }
  })
  const uniqueQuestions = Object.values(questionFrequency).sort((a, b) => b.count - a.count)

  return (
    <div className='space-y-6 p-6'>
      {/* Company Header */}
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          <div className='h-16 w-16 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold'>
            {companyName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1 className='text-3xl font-bold text-foreground'>{companyName}</h1>
            <p className='text-muted-foreground text-sm'>
              {company.total_experiences || 0} interview experiences · {offerRate}% offer rate
            </p>
          </div>
        </div>
        <Link href='/experiences/share'>
          <Button variant='outline' size='sm'>
            + Add Experience
          </Button>
        </Link>
      </div>

      {/* Key Stats */}
      <div className='grid md:grid-cols-4 gap-4'>
        <StatCard icon={<Users className='h-5 w-5' />} value={company.total_experiences || 0} label='Total Experiences' />
        <StatCard icon={<TrendingUp className='h-5 w-5' />} value={`${offerRate}%`} label='Offer Rate' color='text-green-600' />
        <StatCard icon={<BarChart3 className='h-5 w-5' />} value={avgRounds} label='Avg. Rounds' color='text-secondary' />
        <StatCard icon={<Building2 className='h-5 w-5' />} value={(company.round_distribution || []).length} label='Round Types Seen' color='text-accent' />
      </div>

      {/* Tabs */}
      <div className='flex gap-2 border-b border-border overflow-x-auto pb-0'>
        {(['overview', 'rounds', 'skills', 'experiences', 'questions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 font-medium border-b-2 transition-colors whitespace-nowrap text-sm ${
              activeTab === tab
                ? 'text-primary border-primary'
                : 'text-muted-foreground border-transparent hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab === 'questions' && company.questions?.length > 0 && (
              <Badge variant='secondary' size='sm' className='ml-2'>
                {uniqueQuestions.length}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className='grid lg:grid-cols-2 gap-6'>
            {/* AI Analysis */}
            <Card className='lg:col-span-2'>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  ✨ AI Interview Insights
                </CardTitle>
                <CardDescription>
                  AI-generated analysis based on {company.total_experiences || 0} real experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {company.total_experiences < 3 ? (
                  <div className='flex items-center gap-3 p-4 rounded-lg bg-muted/50'>
                    <AlertTriangle className='h-5 w-5 text-yellow-500' />
                    <p className='text-sm text-muted-foreground'>
                      Need at least 3 experiences to generate AI analysis. Currently have {company.total_experiences || 0}.
                    </p>
                  </div>
                ) : analysisLoading ? (
                  <div className='animate-pulse space-y-2'>
                    <div className='h-4 bg-muted rounded w-3/4' />
                    <div className='h-4 bg-muted rounded w-1/2' />
                    <div className='h-4 bg-muted rounded w-2/3' />
                  </div>
                ) : analysis && !analysis.error ? (
                  <div className='space-y-4'>
                    <div>
                      <p className='text-sm font-medium mb-1'>Interview Culture</p>
                      <p className='text-sm text-muted-foreground'>{analysis.company_culture}</p>
                    </div>
                    <div className='grid md:grid-cols-3 gap-4'>
                      <div className='p-3 rounded-lg bg-green-50 dark:bg-green-900/20'>
                        <p className='text-xs font-medium text-green-700 dark:text-green-400 mb-2 flex items-center gap-1'>
                          <CheckCircle2 className='h-3 w-3' /> Green Flags
                        </p>
                        <ul className='space-y-1'>
                          {(analysis.green_flags || []).map((flag: string, i: number) => (
                            <li key={i} className='text-xs text-green-800 dark:text-green-300'>• {flag}</li>
                          ))}
                        </ul>
                      </div>
                      <div className='p-3 rounded-lg bg-red-50 dark:bg-red-900/20'>
                        <p className='text-xs font-medium text-red-700 dark:text-red-400 mb-2 flex items-center gap-1'>
                          <XCircle className='h-3 w-3' /> Red Flags
                        </p>
                        <ul className='space-y-1'>
                          {(analysis.red_flags || []).map((flag: string, i: number) => (
                            <li key={i} className='text-xs text-red-800 dark:text-red-300'>• {flag}</li>
                          ))}
                        </ul>
                      </div>
                      <div className='p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20'>
                        <p className='text-xs font-medium text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1'>
                          <Star className='h-3 w-3' /> Top Tips
                        </p>
                        <ul className='space-y-1'>
                          {(analysis.top_tips || []).slice(0, 3).map((tip: string, i: number) => (
                            <li key={i} className='text-xs text-blue-800 dark:text-blue-300'>• {tip}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div>
                      <p className='text-xs font-medium mb-2'>📚 Preparation Priority</p>
                      <div className='flex flex-wrap gap-2'>
                        {(analysis.preparation_priority || []).map((item: string, i: number) => (
                          <Badge key={i} variant='outline' size='sm'>
                            {i + 1}. {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className='flex gap-4'>
                      <div className='text-center'>
                        <p className='text-2xl font-bold text-primary'>{analysis.difficulty_rating}/10</p>
                        <p className='text-xs text-muted-foreground'>Difficulty</p>
                      </div>
                      <div className='text-center'>
                        <p className='text-2xl font-bold text-green-600'>{analysis.candidate_experience_rating}/10</p>
                        <p className='text-xs text-muted-foreground'>Experience Rating</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <Button onClick={loadAnalysis} variant='outline'>
                    Generate AI Analysis
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Round Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Interview Round Distribution</CardTitle>
                <CardDescription>Most common round types across all experiences</CardDescription>
              </CardHeader>
              <CardContent>
                <RoundDistributionChart data={company.round_distribution || []} />
              </CardContent>
            </Card>

            {/* Outcome Distribution Chart */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Interview Outcomes</CardTitle>
                <CardDescription>How candidates fared in their interviews</CardDescription>
              </CardHeader>
              <CardContent>
                <OutcomeChart data={company.outcome_distribution || []} />
              </CardContent>
            </Card>

            {/* Source Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Hiring Channels</CardTitle>
                <CardDescription>How candidates found the opportunity</CardDescription>
              </CardHeader>
              <CardContent>
                <SourceChart data={company.source_distribution || []} />
              </CardContent>
            </Card>

            {/* Package Distribution */}
            {(company.package_distribution || []).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>Package / Stipend Distribution</CardTitle>
                  <CardDescription>Compensation ranges among offers</CardDescription>
                </CardHeader>
                <CardContent>
                  <PackageChart data={company.package_distribution || []} />
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'rounds' && (
          <div className='space-y-4'>
            {(company.round_distribution || []).length === 0 ? (
              <Card>
                <CardContent className='pt-8 pb-8 text-center'>
                  <p className='text-muted-foreground'>No round data available yet.</p>
                  <Link href='/experiences/share' className='mt-2 inline-block'>
                    <Button size='sm' variant='outline'>Share an Experience</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              (company.round_distribution || []).map((round: any, i: number) => {
                const percentage = company.total_experiences > 0
                  ? Math.round((round.count / company.total_experiences) * 100)
                  : 0
                return (
                  <Card key={i}>
                    <CardContent className='pt-6'>
                      <div className='flex items-center justify-between mb-3'>
                        <div>
                          <p className='font-medium text-foreground'>{round.type}</p>
                          <p className='text-xs text-muted-foreground'>
                            Appeared in {round.count} experience{round.count !== 1 ? 's' : ''} ({percentage}%)
                          </p>
                        </div>
                        <Badge variant={percentage > 60 ? 'destructive' : percentage > 30 ? 'warning' : 'secondary'} size='sm'>
                          {percentage}% of interviews
                        </Badge>
                      </div>
                      <div className='w-full h-2 bg-muted rounded-full overflow-hidden'>
                        <div
                          className='h-full bg-primary transition-all'
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        )}

        {activeTab === 'skills' && (
          <div className='grid lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='text-base'>Required Skills by Frequency</CardTitle>
                <CardDescription>Skills mentioned across all experience rounds</CardDescription>
              </CardHeader>
              <CardContent>
                {(company.round_distribution || []).length === 0 ? (
                  <p className='text-muted-foreground text-sm text-center py-4'>No data available yet</p>
                ) : (
                  <div className='space-y-3'>
                    {(company.round_distribution || []).slice(0, 8).map((round: any, i: number) => {
                      const pct = company.total_experiences > 0
                        ? Math.round((round.count / company.total_experiences) * 100)
                        : 0
                      return (
                        <div key={i}>
                          <div className='flex justify-between mb-1'>
                            <span className='text-sm font-medium text-foreground'>{round.type}</span>
                            <span className='text-xs text-muted-foreground'>{pct}%</span>
                          </div>
                          <div className='w-full h-2 bg-muted rounded-full overflow-hidden'>
                            <div className='h-full bg-primary' style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
            {analysis && analysis.preparation_priority && (
              <Card>
                <CardHeader>
                  <CardTitle className='text-base'>AI Preparation Recommendations</CardTitle>
                  <CardDescription>Topics to prioritize based on past interviews</CardDescription>
                </CardHeader>
                <CardContent>
                  <ol className='space-y-2'>
                    {analysis.preparation_priority.map((item: string, i: number) => (
                      <li key={i} className='flex gap-3 text-sm'>
                        <span className='flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold'>
                          {i + 1}
                        </span>
                        <span className='text-foreground'>{item}</span>
                      </li>
                    ))}
                  </ol>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'experiences' && (
          <div className='space-y-3'>
            {experiences.length === 0 ? (
              <Card>
                <CardContent className='pt-8 pb-8 text-center'>
                  <p className='text-muted-foreground'>No experiences yet for this company.</p>
                  <Link href='/experiences/share' className='mt-3 inline-block'>
                    <Button size='sm'>Share the First Experience</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              experiences.map((exp: any) => (
                <Link key={exp.id} href={`/experiences/${exp.id}`}>
                  <Card hover>
                    <CardContent className='pt-4 pb-4'>
                      <div className='flex items-start justify-between'>
                        <div>
                          <p className='font-bold text-foreground'>{exp.role}</p>
                          <p className='text-xs text-muted-foreground'>
                            {exp.employment_type} · {exp.experience_level}
                          </p>
                          {exp.author && (
                            <p className='text-xs text-muted-foreground mt-1'>
                              by @{exp.author.username}
                            </p>
                          )}
                        </div>
                        <div className='text-right space-y-1'>
                          <Badge
                            variant={exp.outcome === 'Got the Offer' ? 'success' : exp.outcome?.includes('Rejected') ? 'destructive' : 'secondary'}
                            size='sm'
                          >
                            {exp.outcome || 'Unknown'}
                          </Badge>
                          <p className='text-xs text-muted-foreground'>
                            {exp.rounds?.length || 0} rounds
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'questions' && (
          <div className='space-y-4'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <input
                placeholder='Search questions...'
                className='w-full pl-9 pr-3 py-2 rounded-md border border-input bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-ring'
                value={questionSearch}
                onChange={(e) => setQuestionSearch(e.target.value)}
              />
            </div>

            {uniqueQuestions.length === 0 ? (
              <Card>
                <CardContent className='pt-8 pb-8 text-center'>
                  <p className='text-muted-foreground'>
                    {questionSearch ? 'No questions match your search.' : 'No questions logged yet. Share an experience with questions to help others!'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className='space-y-2'>
                {uniqueQuestions.map((q, i) => (
                  <Card key={i} hover>
                    <CardContent className='pt-4 pb-4'>
                      <div className='flex items-start justify-between gap-4'>
                        <div className='flex-1'>
                          <p className='text-sm text-foreground'>{q.question}</p>
                          <div className='flex gap-2 mt-2'>
                            <Badge variant='outline' size='sm'>{q.roundType}</Badge>
                            {q.count > 1 && (
                              <Badge variant='secondary' size='sm'>
                                Asked {q.count}x
                              </Badge>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => copyQuestion(q.question)}
                          className='flex-shrink-0 p-1.5 rounded hover:bg-muted transition-colors'
                          title='Copy question'
                        >
                          {copied === q.question ? (
                            <CheckCircle2 className='h-4 w-4 text-green-500' />
                          ) : (
                            <Copy className='h-4 w-4 text-muted-foreground' />
                          )}
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
