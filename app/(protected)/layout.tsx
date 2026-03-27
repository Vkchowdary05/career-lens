'use client'

import React from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopHeader } from '@/components/layout/TopHeader'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className='flex h-screen bg-background'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className='flex-1 flex flex-col ml-64'>
        {/* Top Header */}
        <TopHeader />

        {/* Page Content */}
        <main className='flex-1 overflow-y-auto'>
          <div className='min-h-full'>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
