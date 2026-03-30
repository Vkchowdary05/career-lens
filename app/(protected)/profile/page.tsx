'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Briefcase, 
  FileText, 
  Sparkles, 
  TrendingUp, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  MapPin,
  Settings,
  Share2,
  Bookmark,
  Award
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { trackerApi, resumeApi, experiencesApi } from '@/lib/api'
import { formatRelativeTime } from '@/lib/formatters'

export default function ProfilePage() {
  const { clUser } = useAuth()
  const [trackerStats, setTrackerStats] = useState<any>(null)
  const [recentResumes, setRecentResumes] = useState<any[]>([])
  const [recentPlaybooks, setRecentPlaybooks] = useState<any[]>([])

  useEffect(() => {
    if (clUser) {
      trackerApi.getStats().then(setTrackerStats).catch(console.error)
      resumeApi.getHistory().then(res => setRecentResumes(res.slice(0, 3))).catch(console.error)
      experiencesApi.list({ page: 1 }).then((res: any) => setRecentPlaybooks((res.experiences || []).slice(0, 2))).catch(console.error)
    }
  }, [clUser])

  if (!clUser) {
    return (
      <div className='p-6 text-center py-20'>
        <p className='text-muted-foreground'>Loading profile...</p>
      </div>
    )
  }

  const initials = clUser.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  const pipeline = {
    tailoring: recentResumes.length > 0 ? recentResumes.length : 0,
    applied: trackerStats?.total || 0,
    interviewing: trackerStats?.active || 0,
    offers: trackerStats?.offers || 0
  }

  return (
    <div className='min-h-screen bg-background text-foreground font-sans p-6'>
      <div className='max-w-6xl mx-auto'>
        
        {/* Header Section */}
        <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8'>
          <div className='flex items-center gap-6'>
            <div className='w-24 h-24 rounded-2xl bg-primary/10 border-4 border-background shadow-md overflow-hidden shrink-0 flex items-center justify-center'>
               {clUser.photo_url ? (
                 <img src={clUser.photo_url} alt="Avatar" className="w-full h-full object-cover" />
               ) : (
                 <span className="text-3xl font-bold text-primary">{initials}</span>
               )}
            </div>
            <div>
              <h1 className='text-3xl font-bold flex items-center gap-3'>
                {clUser.full_name}
                {clUser.open_to_opportunities && (
                  <span className='px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1'>
                    <CheckCircle2 className='w-3 h-3' /> Open to Work
                  </span>
                )}
              </h1>
              <p className='text-muted-foreground mt-1 font-medium'>
                {clUser.current_role ? `${clUser.current_role} at ${clUser.current_company}` : clUser.bio || 'CareerLens Member'}
              </p>
              <div className='flex items-center gap-4 mt-2 text-sm text-muted-foreground'>
                {clUser.college && <span className='flex items-center gap-1'><MapPin className='w-4 h-4' /> {clUser.college}</span>}
              </div>
            </div>
          </div>

          {/* Impact Badge */}
          <div className='bg-gradient-to-r from-primary to-accent p-[1px] rounded-2xl shrink-0'>
            <div className='bg-card rounded-2xl p-4 flex items-center gap-4 h-full'>
              <div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary'>
                <Award className='w-6 h-6' />
              </div>
              <div>
                <p className='text-xs text-muted-foreground font-semibold uppercase tracking-wider'>Community Impact</p>
                <div className='flex items-baseline gap-2'>
                  <span className='text-2xl font-bold'>{clUser.points || 0}</span>
                  <span className='text-sm text-muted-foreground'>pts</span>
                </div>
                <p className='text-xs text-primary font-medium mt-0.5'>Top Contributor</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid Layout */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
          
          {/* Column 1 & 2: Main Content */}
          <div className='md:col-span-2 flex flex-col gap-6'>
            
            {/* Widget: Application Pipeline */}
            <div className='bg-card rounded-3xl p-6 shadow-sm border border-border'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg font-bold flex items-center gap-2'>
                  <Briefcase className='w-5 h-5 text-primary' /> 
                  Active Pipeline
                </h2>
                <Link href='/tracker' className='text-sm font-medium text-primary hover:underline flex items-center'>
                  View Board <ChevronRight className='w-4 h-4 ml-1' />
                </Link>
              </div>
              
              <div className='grid grid-cols-2 sm:grid-cols-4 gap-4'>
                {[
                  { label: "Resumes", count: pipeline.tailoring, color: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300" },
                  { label: "Applied", count: pipeline.applied, color: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" },
                  { label: "Active", count: pipeline.interviewing, color: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400" },
                  { label: "Offers", count: pipeline.offers, color: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-400" }
                ].map((stat, i) => (
                  <div key={i} className={`p-4 rounded-2xl border ${stat.color} flex flex-col items-center justify-center text-center transition-transform hover:scale-105 cursor-pointer`}>
                    <span className='text-3xl font-black mb-1'>{stat.count}</span>
                    <span className='text-xs font-semibold uppercase tracking-wider'>{stat.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Widget: AI Tailored Resumes */}
            <div className='bg-card rounded-3xl p-6 shadow-sm border border-border'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-lg font-bold flex items-center gap-2'>
                  <FileText className='w-5 h-5 text-primary' /> 
                  Recent Tailored Resumes
                </h2>
                <Link href='/resume'>
                  <button className='px-4 py-2 bg-foreground text-background text-sm font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center gap-2'>
                    <Sparkles className='w-4 h-4' /> New Tailor
                  </button>
                </Link>
              </div>

              <div className='space-y-3'>
                {recentResumes.length === 0 ? (
                  <div className='text-center py-6 text-muted-foreground text-sm'>
                    No tailored resumes yet. Generate your first one to match a job description!
                  </div>
                ) : (
                  recentResumes.map((resume) => (
                    <div key={resume.id} className='group flex items-center justify-between p-4 rounded-2xl border border-border hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer'>
                      <div className='flex items-center gap-4'>
                        <div className='w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center'>
                          <FileText className='w-5 h-5' />
                        </div>
                        <div>
                          <p className='font-semibold text-foreground group-hover:text-primary transition-colors'>
                            {resume.job_details?.target_company || 'Target Company'} - {resume.job_details?.role_category || 'Role'}
                          </p>
                          <p className='text-xs text-muted-foreground flex items-center gap-1 mt-0.5'>
                            <Clock className='w-3 h-3' /> Tailored {formatRelativeTime(new Date(resume.created_at))}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-4'>
                        <div className='text-right'>
                          <p className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>Optimized</p>
                          <p className='text-xs text-muted-foreground'>ATS Ready</p>
                        </div>
                        <ChevronRight className='w-5 h-5 text-muted-foreground group-hover:text-primary' />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Column 3: Community & Insights */}
          <div className='flex flex-col gap-6'>
            
            {/* Widget: Share Your Success */}
            <div className='bg-gradient-to-br from-primary to-accent rounded-3xl p-6 text-primary-foreground shadow-md relative overflow-hidden'>
              <div className='absolute top-0 right-0 p-4 opacity-10'>
                <Share2 className='w-24 h-24' />
              </div>
              <div className='relative z-10'>
                <span className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/20 text-xs font-semibold backdrop-blur-sm mb-4 border border-background/20'>
                  <TrendingUp className='w-3 h-3' /> Completed an interview?
                </span>
                <h2 className='text-xl font-bold mb-2'>Pay it forward.</h2>
                <p className='text-primary-foreground/80 text-sm mb-6 leading-relaxed'>
                  Share your interview process and timeline. Help others land their dream role while earning massive points.
                </p>
                <Link href='/experiences/share'>
                  <button className='w-full py-3 bg-background text-foreground rounded-xl font-bold text-sm hover:bg-background/90 transition-colors shadow-sm'>
                    Create a Playbook
                  </button>
                </Link>
              </div>
            </div>

            {/* Widget: Community Insights / Playbooks */}
            <div className='bg-card rounded-3xl p-6 shadow-sm border border-border flex-1'>
              <h2 className='text-lg font-bold flex items-center gap-2 mb-6'>
                <Users className='w-5 h-5 text-primary' /> 
                Recent Playbooks
              </h2>
              
              <div className='space-y-4'>
                {recentPlaybooks.length === 0 ? (
                  <p className='text-sm text-muted-foreground text-center py-4'>No recent playbooks available.</p>
                ) : (
                  recentPlaybooks.map((playbook) => (
                    <Link key={playbook.id} href={`/experiences/${playbook.id}`} className='block'>
                      <div className='p-4 rounded-2xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer border border-transparent hover:border-border'>
                        <div className='flex justify-between items-start mb-2'>
                          <div>
                            <p className='font-bold'>{playbook.company_name}</p>
                            <p className='text-xs font-medium text-muted-foreground'>{playbook.role}</p>
                          </div>
                          <span className='px-2 py-1 rounded-md bg-background text-[10px] font-bold text-muted-foreground shadow-sm border border-border'>
                            {playbook.outcome}
                          </span>
                        </div>
                        <div className='flex items-center gap-3 mt-3 pt-3 border-t border-border/60'>
                          <span className='flex items-center gap-1 text-xs text-muted-foreground font-medium'>
                            <TrendingUp className='w-3.5 h-3.5 text-emerald-500' /> {playbook.likes_count || 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))
                )}
              </div>

              <Link href='/experiences'>
                <button className='w-full mt-4 py-2 text-sm font-medium text-muted-foreground hover:text-primary flex items-center justify-center gap-1 transition-colors'>
                  <Bookmark className='w-4 h-4' /> Browse All Playbooks
                </button>
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
