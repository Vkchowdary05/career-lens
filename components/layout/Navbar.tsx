'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Briefcase } from 'lucide-react'

export function Navbar() {
  return (
    <nav className='sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        {/* Logo */}
        <Link href='/' className='flex items-center gap-2 mr-8'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Briefcase className='h-5 w-5' />
          </div>
          <span className='hidden sm:inline-block text-lg font-semibold text-foreground'>
            CareerLens
          </span>
        </Link>

        {/* Center Navigation */}
        <div className='hidden md:flex items-center gap-8'>
          <Link href='#' className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'>
            Explore
          </Link>
          <Link href='#' className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'>
            Companies
          </Link>
          <Link href='#' className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'>
            Experiences
          </Link>
          <Link href='#' className='text-sm font-medium text-muted-foreground hover:text-foreground transition-colors'>
            Resources
          </Link>
        </div>

        {/* Right Actions */}
        <div className='flex items-center gap-3 ml-auto'>
          <Link href='/login'>
            <Button variant='ghost' size='sm'>
              Sign In
            </Button>
          </Link>
          <Link href='/signup'>
            <Button size='sm'>
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
