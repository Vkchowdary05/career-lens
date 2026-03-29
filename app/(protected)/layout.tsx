'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopHeader } from '@/components/layout/TopHeader'
import { useAuth } from '@/contexts/AuthContext'

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !firebaseUser) {
      router.push('/login')
    }
  }, [firebaseUser, loading, router])

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center bg-background'>
        <div className='space-y-4 text-center'>
          <div className='h-12 w-12 rounded-lg bg-primary text-primary-foreground flex items-center justify-center mx-auto animate-pulse'>
            <span className='text-xl font-bold'>CL</span>
          </div>
          <p className='text-muted-foreground text-sm'>Loading CareerLens...</p>
        </div>
      </div>
    )
  }

  if (!firebaseUser) return null

  return (
    <div className='flex h-screen bg-background'>
      <Sidebar />
      <div className='flex-1 flex flex-col ml-64 overflow-hidden'>
        <TopHeader />
        <main className='flex-1 overflow-y-auto'>
          {children}
        </main>
      </div>
    </div>
  )
}
