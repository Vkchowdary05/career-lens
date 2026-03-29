'use client'

import React, { useEffect, useRef } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Briefcase,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Shield,
  ArrowRight,
  Star,
} from 'lucide-react'

export default function LandingPage() {
  const statsRef = useRef<HTMLDivElement>(null)
  const [stats, setStats] = React.useState({ users: 0, experiences: 0, companies: 0 })

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && stats.users === 0) {
          // Count up animation
          let currentCount = { users: 0, experiences: 0, companies: 0 }
          const interval = setInterval(() => {
            currentCount.users = Math.min(currentCount.users + 50, 50000)
            currentCount.experiences = Math.min(currentCount.experiences + 80, 100000)
            currentCount.companies = Math.min(currentCount.companies + 30, 25000)
            setStats(currentCount)

            if (currentCount.users >= 50000) clearInterval(interval)
          }, 30)
        }
      },
      { threshold: 0.1 }
    )

    if (statsRef.current) {
      observer.observe(statsRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <div className='min-h-screen bg-gradient-to-b from-background via-background to-muted'>
      <Navbar />

      {/* Hero Section */}
      <section className='relative px-4 sm:px-6 lg:px-8 py-20 sm:py-32'>
        <div className='mx-auto max-w-6xl'>
          <div className='grid md:grid-cols-2 gap-12 items-center'>
            {/* Left Content */}
            <div className='space-y-8 animate-fade-in'>
              <div className='space-y-3'>
                <Badge variant='outline' size='lg'>
                  <Zap className='h-3 w-3' />
                  Your Career Intelligence Platform
                </Badge>
                <h1 className='text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight'>
                  Unlock Your Career Potential
                </h1>
                <p className='text-lg text-muted-foreground leading-relaxed'>
                  Get real interview experiences, company insights, and personalized career guidance. Learn from thousands of professionals and land your dream job.
                </p>
              </div>

              <div className='flex flex-col sm:flex-row gap-4'>
                <Link href='/signup'>
                  <Button size='lg' className='gap-2'>
                    Get Started Free
                    <ArrowRight className='h-4 w-4' />
                  </Button>
                </Link>
                <Link href='#features'>
                  <Button size='lg' variant='outline'>
                    Learn More
                  </Button>
                </Link>
              </div>

              <div className='flex items-center gap-2'>
                <div className='flex -space-x-2'>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className='h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border-2 border-background'
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <p className='text-sm text-muted-foreground'>
                  Join 50K+ professionals already using CareerLens
                </p>
              </div>
            </div>

            {/* Right Visual */}
            <div className='relative hidden md:block'>
              <div className='relative h-96 rounded-lg border border-border bg-gradient-to-br from-primary/10 to-accent/10 overflow-hidden group hover:border-primary/50 transition-colors'>
                <div className='absolute inset-0 bg-grid-pattern opacity-5' />
                <div className='absolute inset-0 flex items-center justify-center'>
                  <div className='text-center space-y-3'>
                    <Briefcase className='h-16 w-16 mx-auto text-primary opacity-60' />
                    <p className='text-sm font-medium text-muted-foreground'>
                      Real Interview Insights
                    </p>
                  </div>
                </div>
                <div className='absolute top-6 right-6 w-32 h-32 bg-primary/20 rounded-full blur-2xl' />
                <div className='absolute bottom-6 left-6 w-40 h-40 bg-accent/20 rounded-full blur-2xl' />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className='px-4 sm:px-6 lg:px-8 py-12 border-y border-border'>
        <div className='mx-auto max-w-6xl'>
          <div className='grid md:grid-cols-3 gap-8'>
            <div className='text-center space-y-2'>
              <div className='text-3xl sm:text-4xl font-bold text-primary'>
                {stats.users.toLocaleString()}+
              </div>
              <p className='text-muted-foreground'>Active Users</p>
            </div>
            <div className='text-center space-y-2'>
              <div className='text-3xl sm:text-4xl font-bold text-accent'>
                {stats.experiences.toLocaleString()}+
              </div>
              <p className='text-muted-foreground'>Interview Experiences</p>
            </div>
            <div className='text-center space-y-2'>
              <div className='text-3xl sm:text-4xl font-bold text-secondary'>
                {stats.companies.toLocaleString()}+
              </div>
              <p className='text-muted-foreground'>Companies Covered</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='px-4 sm:px-6 lg:px-8 py-20'>
        <div className='mx-auto max-w-6xl space-y-12'>
          <div className='text-center space-y-4'>
            <h2 className='text-3xl sm:text-4xl font-bold text-foreground'>
              Everything You Need to Succeed
            </h2>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto'>
              Comprehensive tools to explore careers, learn from others, and land your next opportunity.
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-6'>
            {[
              {
                icon: <BarChart3 className='h-6 w-6' />,
                title: 'Company Intelligence',
                description: 'Deep insights into interview processes, required skills, and hiring trends.',
              },
              {
                icon: <Briefcase className='h-6 w-6' />,
                title: 'Real Experiences',
                description: 'Learn from thousands of verified interview experiences shared by professionals.',
              },
              {
                icon: <TrendingUp className='h-6 w-6' />,
                title: 'Resume Optimizer',
                description: 'AI-powered resume analysis and tailoring for specific opportunities.',
              },
              {
                icon: <Users className='h-6 w-6' />,
                title: 'Community Network',
                description: 'Connect with job seekers, mentors, and industry professionals.',
              },
              {
                icon: <Shield className='h-6 w-6' />,
                title: 'Application Tracker',
                description: 'Organize and track all your job applications in one place.',
              },
              {
                icon: <Star className='h-6 w-6' />,
                title: 'Leaderboard & Rewards',
                description: 'Earn points for sharing insights and climb the community leaderboard.',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                hover
                className='group'
              >
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all'>
                      {feature.icon}
                    </div>
                  </div>
                  <CardTitle className='mt-4'>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className='px-4 sm:px-6 lg:px-8 py-20 border-t border-border'>
        <div className='mx-auto max-w-6xl space-y-12'>
          <div className='text-center space-y-4'>
            <h2 className='text-3xl sm:text-4xl font-bold text-foreground'>
              Loved by Career Seekers Worldwide
            </h2>
          </div>

          <div className='grid md:grid-cols-3 gap-6'>
            {[
              {
                name: 'Sarah Chen',
                role: 'Software Engineer at Google',
                text: 'CareerLens helped me prepare for my Google interviews with real experiences from other engineers.',
                avatar: 'SC',
              },
              {
                name: 'Michael Rodriguez',
                role: 'Product Manager at Stripe',
                text: 'The company insights and interview experiences gave me an unfair advantage in my PM interviews.',
                avatar: 'MR',
              },
              {
                name: 'Aisha Patel',
                role: 'Data Scientist at Meta',
                text: 'Amazing platform! The resume optimizer helped me land my dream role at Meta.',
                avatar: 'AP',
              },
            ].map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className='flex items-center gap-3'>
                    <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm'>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className='font-semibold text-foreground'>{testimonial.name}</p>
                      <p className='text-xs text-muted-foreground'>{testimonial.role}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-foreground italic'>"{testimonial.text}"</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-r from-primary to-accent rounded-lg mx-4 sm:mx-6 lg:mx-8 my-20'>
        <div className='max-w-3xl mx-auto text-center space-y-6'>
          <h2 className='text-3xl sm:text-4xl font-bold text-primary-foreground'>
            Ready to Transform Your Career?
          </h2>
          <p className='text-lg text-primary-foreground/90'>
            Join thousands of professionals who have landed their dream jobs using CareerLens.
          </p>
          <Link href='/signup'>
            <Button size='lg' variant='secondary'>
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className='border-t border-border px-4 sm:px-6 lg:px-8 py-12'>
        <div className='mx-auto max-w-6xl'>
          <div className='grid md:grid-cols-4 gap-8 mb-8'>
            <div>
              <p className='font-semibold text-foreground mb-4'>CareerLens</p>
              <p className='text-sm text-muted-foreground'>
                Your career intelligence platform.
              </p>
            </div>
            <div>
              <p className='font-semibold text-foreground mb-4'>Product</p>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li><a href='#' className='hover:text-foreground transition-colors'>Features</a></li>
                <li><a href='#' className='hover:text-foreground transition-colors'>Pricing</a></li>
              </ul>
            </div>
            <div>
              <p className='font-semibold text-foreground mb-4'>Company</p>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li><a href='#' className='hover:text-foreground transition-colors'>About</a></li>
                <li><a href='#' className='hover:text-foreground transition-colors'>Blog</a></li>
              </ul>
            </div>
            <div>
              <p className='font-semibold text-foreground mb-4'>Legal</p>
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li><a href='#' className='hover:text-foreground transition-colors'>Privacy</a></li>
                <li><a href='#' className='hover:text-foreground transition-colors'>Terms</a></li>
              </ul>
            </div>
          </div>
          <div className='border-t border-border pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground'>
            <p>&copy; 2024 CareerLens. All rights reserved.</p>
            <div className='flex gap-6 mt-4 sm:mt-0'>
              <a href='#' className='hover:text-foreground transition-colors'>Twitter</a>
              <a href='#' className='hover:text-foreground transition-colors'>LinkedIn</a>
              <a href='#' className='hover:text-foreground transition-colors'>GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
