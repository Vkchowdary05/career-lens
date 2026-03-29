'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Briefcase, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import {
  auth,
  signInWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
} from '@/lib/firebase'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password)
      await authApi.register({
        firebase_uid: cred.user.uid,
        email: cred.user.email || email,
        full_name: cred.user.displayName || 'User',
        auth_provider: 'email'
      })
      router.push('/feed')
    } catch (err: any) {
      const msg = err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password'
        ? 'Invalid email or password.'
        : err.code === 'auth/too-many-requests'
        ? 'Too many failed attempts. Please try again later.'
        : 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError('')
    setGoogleLoading(true)
    try {
      const cred = await signInWithPopup(auth, googleProvider)
      await authApi.register({
        firebase_uid: cred.user.uid,
        email: cred.user.email || '',
        full_name: cred.user.displayName || 'Google User',
        photo_url: cred.user.photoURL,
        auth_provider: 'google'
      })
      router.push('/feed')
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Please try again.')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

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
              Your Career Intelligence Platform
            </h1>
            <p className='text-lg text-muted-foreground'>
              Real interview experiences, AI-powered resume building, and smart application tracking.
            </p>
          </div>
          <div className='space-y-3'>
            {[
              'Real interview experiences from professionals',
              'Deep company insights and hiring trends',
              'AI-powered resume optimization',
            ].map((feature, i) => (
              <div key={i} className='flex items-center gap-3'>
                <div className='h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center'>
                  <ArrowRight className='h-3 w-3 text-primary' />
                </div>
                <span className='text-sm text-foreground'>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className='flex items-center justify-center'>
          <Card className='w-full max-w-md'>
            <CardHeader>
              <CardTitle className='text-2xl'>Sign In</CardTitle>
              <CardDescription>Welcome back! Sign in to continue.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailLogin} className='space-y-4'>
                {error && (
                  <div className='flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm'>
                    <AlertCircle className='h-4 w-4 flex-shrink-0' />
                    {error}
                  </div>
                )}

                <Input
                  label='Email Address'
                  type='email'
                  placeholder='you@example.com'
                  startIcon={<Mail className='h-4 w-4' />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />

                <Input
                  label='Password'
                  type='password'
                  placeholder='Enter your password'
                  startIcon={<Lock className='h-4 w-4' />}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />

                <div className='text-right'>
                  <Link href='/forgot-password' className='text-xs text-primary hover:underline'>
                    Forgot password?
                  </Link>
                </div>

                <Button className='w-full' type='submit' disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
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
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                >
                  <svg className='h-4 w-4' viewBox='0 0 24 24' fill='currentColor'>
                    <path d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z' />
                    <path d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z' />
                    <path d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z' />
                    <path d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z' />
                  </svg>
                  {googleLoading ? 'Signing in...' : 'Continue with Google'}
                </Button>
              </form>

              <p className='text-xs text-center text-muted-foreground mt-4'>
                Don't have an account?{' '}
                <Link href='/signup' className='text-primary hover:underline font-semibold'>
                  Sign up free
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
