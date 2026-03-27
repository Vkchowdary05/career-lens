'use client'

import React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Briefcase, User, Mail, Lock, CheckCircle2 } from 'lucide-react'

export default function SignupPage() {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [passwordStrength, setPasswordStrength] = React.useState(0)

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value })

    let strength = 0
    if (value.length >= 8) strength++
    if (/[A-Z]/.test(value)) strength++
    if (/[0-9]/.test(value)) strength++
    if (/[^A-Za-z0-9]/.test(value)) strength++
    setPasswordStrength(strength)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Signup attempt', formData)
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return 'Weak'
    if (passwordStrength <= 2) return 'Fair'
    if (passwordStrength <= 3) return 'Good'
    return 'Strong'
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary via-background to-accent flex items-center justify-center p-4'>
      <div className='grid md:grid-cols-2 gap-8 w-full max-w-5xl'>
        {/* Left Panel - Branding */}
        <div className='hidden md:flex flex-col justify-center space-y-8 text-primary-foreground'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-lg bg-primary-foreground text-primary flex items-center justify-center'>
                <Briefcase className='h-6 w-6' />
              </div>
              <span className='text-3xl font-bold'>CareerLens</span>
            </div>
            <h1 className='text-4xl font-bold leading-tight'>
              Join 50K+ Career-Focused Professionals
            </h1>
            <p className='text-lg opacity-90'>
              Sign up to access real interview experiences, company insights, and land your dream job.
            </p>
          </div>

          <div className='space-y-3'>
            {[
              'Free access to 100K+ interview experiences',
              'AI-powered resume optimizer',
              'Job application tracking dashboard',
              'Community of top professionals',
            ].map((feature, i) => (
              <div key={i} className='flex items-center gap-3'>
                <CheckCircle2 className='h-5 w-5' />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Signup Form */}
        <div className='flex items-center justify-center'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle className='text-2xl'>Create Account</CardTitle>
              <CardDescription>
                Join CareerLens to advance your career journey.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <Input
                  label='Full Name'
                  type='text'
                  placeholder='Alex Johnson'
                  startIcon={<User className='h-4 w-4' />}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />

                <Input
                  label='Email Address'
                  type='email'
                  placeholder='you@example.com'
                  startIcon={<Mail className='h-4 w-4' />}
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />

                <div>
                  <Input
                    label='Password'
                    type='password'
                    placeholder='Create a strong password'
                    startIcon={<Lock className='h-4 w-4' />}
                    value={formData.password}
                    onChange={(e) => handlePasswordChange(e.target.value)}
                    required
                  />
                  <div className='mt-2 flex items-center gap-2'>
                    <div className='flex-1 h-1.5 bg-muted rounded-full overflow-hidden'>
                      <div
                        className={`h-full transition-all ${
                          passwordStrength === 0
                            ? 'w-0'
                            : passwordStrength === 1
                            ? 'w-1/4 bg-destructive'
                            : passwordStrength === 2
                            ? 'w-1/2 bg-yellow-500'
                            : passwordStrength === 3
                            ? 'w-3/4 bg-blue-500'
                            : 'w-full bg-green-500'
                        }`}
                      />
                    </div>
                    <span className='text-xs font-medium text-muted-foreground'>
                      {getPasswordStrengthLabel()}
                    </span>
                  </div>
                </div>

                <Input
                  label='Confirm Password'
                  type='password'
                  placeholder='Confirm your password'
                  startIcon={<Lock className='h-4 w-4' />}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  error={
                    formData.confirmPassword &&
                    formData.password !== formData.confirmPassword
                      ? 'Passwords do not match'
                      : undefined
                  }
                  required
                />

                <div className='space-y-2'>
                  <label className='flex items-center gap-2 text-sm'>
                    <input type='checkbox' className='h-4 w-4 rounded' required />
                    <span>
                      I agree to the{' '}
                      <Link
                        href='/terms'
                        className='text-primary hover:underline'
                      >
                        Terms of Service
                      </Link>
                    </span>
                  </label>
                  <label className='flex items-center gap-2 text-sm'>
                    <input type='checkbox' className='h-4 w-4 rounded' />
                    <span>
                      I want to receive updates and career tips from CareerLens
                    </span>
                  </label>
                </div>

                <Button className='w-full' type='submit'>
                  Create Account
                </Button>

                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-border' />
                  </div>
                  <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-card px-2 text-muted-foreground'>Or</span>
                  </div>
                </div>

                <Button type='button' variant='outline' className='w-full gap-2'>
                  <svg
                    className='h-4 w-4'
                    viewBox='0 0 24 24'
                    fill='currentColor'
                  >
                    <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                    <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                    <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                    <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                  </svg>
                  Sign up with Google
                </Button>
              </form>

              <p className='text-xs text-center text-muted-foreground mt-4'>
                Already have an account?{' '}
                <Link href='/login' className='text-primary hover:underline font-semibold'>
                  Sign in
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
