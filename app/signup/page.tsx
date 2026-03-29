'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, User, Mail, Lock, CheckCircle2, AlertCircle } from 'lucide-react'
import {
  auth,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
} from '@/lib/firebase'
import { updateProfile } from 'firebase/auth'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [agreed, setAgreed] = useState(false)

  const handlePasswordChange = (value: string) => {
    setFormData({ ...formData, password: value })
    let strength = 0
    if (value.length >= 8) strength++
    if (/[A-Z]/.test(value)) strength++
    if (/[0-9]/.test(value)) strength++
    if (/[^A-Za-z0-9]/.test(value)) strength++
    setPasswordStrength(strength)
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength === 0) return { label: 'Weak', color: 'bg-muted' }
    if (passwordStrength <= 2) return { label: 'Fair', color: 'bg-destructive' }
    if (passwordStrength <= 3) return { label: 'Good', color: 'bg-yellow-500' }
    return { label: 'Strong', color: 'bg-green-500' }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!agreed) { setError('Please agree to the Terms of Service'); return }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return }
    if (formData.password.length < 8) { setError('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email, formData.password)
      await updateProfile(cred.user, { displayName: formData.name })
      router.push('/feed')
    } catch (err: any) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.code === 'auth/weak-password'
        ? 'Password is too weak.'
        : 'Sign up failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      await signInWithPopup(auth, googleProvider)
      router.push('/feed')
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-up failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  const { label: strengthLabel, color: strengthColor } = getPasswordStrengthLabel()

  return (
    <div className='min-h-screen bg-gradient-to-br from-primary/20 via-background to-accent/20 flex items-center justify-center p-4'>
      <div className='grid md:grid-cols-2 gap-8 w-full max-w-5xl'>
        {/* Left Panel */}
        <div className='hidden md:flex flex-col justify-center space-y-8'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <div className='h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center'>
                <Briefcase className='h-6 w-6' />
              </div>
              <span className='text-3xl font-bold text-foreground'>CareerLens</span>
            </div>
            <h1 className='text-4xl font-bold leading-tight text-foreground'>
              Join 50K+ Career Professionals
            </h1>
            <p className='text-lg text-muted-foreground'>
              Access real interview experiences and AI-powered career tools.
            </p>
          </div>
          <div className='space-y-3'>
            {[
              'Free access to interview experience database',
              'AI-powered resume optimizer',
              'Smart application tracking',
              'Earn points and build reputation',
            ].map((feature, i) => (
              <div key={i} className='flex items-center gap-3'>
                <CheckCircle2 className='h-5 w-5 text-green-500 flex-shrink-0' />
                <span className='text-sm text-foreground'>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className='flex items-center justify-center'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle className='text-2xl'>Create Account</CardTitle>
              <CardDescription>Join CareerLens to advance your career.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className='space-y-4'>
                {error && (
                  <div className='flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm'>
                    <AlertCircle className='h-4 w-4 flex-shrink-0' />
                    {error}
                  </div>
                )}

                <Input
                  label='Full Name'
                  type='text'
                  placeholder='Alex Johnson'
                  startIcon={<User className='h-4 w-4' />}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  disabled={loading}
                />

                <Input
                  label='Email Address'
                  type='email'
                  placeholder='you@example.com'
                  startIcon={<Mail className='h-4 w-4' />}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  disabled={loading}
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
                    disabled={loading}
                  />
                  {formData.password && (
                    <div className='mt-2 flex items-center gap-2'>
                      <div className='flex-1 h-1.5 bg-muted rounded-full overflow-hidden'>
                        <div
                          className={`h-full transition-all ${strengthColor}`}
                          style={{ width: `${(passwordStrength / 4) * 100}%` }}
                        />
                      </div>
                      <span className='text-xs font-medium text-muted-foreground'>{strengthLabel}</span>
                    </div>
                  )}
                </div>

                <Input
                  label='Confirm Password'
                  type='password'
                  placeholder='Confirm your password'
                  startIcon={<Lock className='h-4 w-4' />}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  error={
                    formData.confirmPassword && formData.password !== formData.confirmPassword
                      ? 'Passwords do not match'
                      : undefined
                  }
                  required
                  disabled={loading}
                />

                <label className='flex items-center gap-2 text-sm cursor-pointer'>
                  <input
                    type='checkbox'
                    className='h-4 w-4 rounded border border-input'
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                  />
                  <span>
                    I agree to the{' '}
                    <Link href='/terms' className='text-primary hover:underline'>
                      Terms of Service
                    </Link>
                  </span>
                </label>

                <Button className='w-full' type='submit' disabled={loading || !agreed}>
                  {loading ? 'Creating account...' : 'Create Account'}
                </Button>

                <div className='relative'>
                  <div className='absolute inset-0 flex items-center'>
                    <div className='w-full border-t border-border' />
                  </div>
                  <div className='relative flex justify-center text-xs uppercase'>
                    <span className='bg-card px-2 text-muted-foreground'>Or</span>
                  </div>
                </div>

                <Button
                  type='button'
                  variant='outline'
                  className='w-full gap-2'
                  onClick={handleGoogleSignup}
                  disabled={googleLoading}
                >
                  <svg className='h-4 w-4' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                    <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                    <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                    <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                  </svg>
                  {googleLoading ? 'Signing up...' : 'Sign up with Google'}
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
