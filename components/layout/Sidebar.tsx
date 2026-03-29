'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Briefcase,
  LayoutDashboard,
  Building2,
  FileText,
  CheckSquare,
  BarChart3,
  Bell,
  Settings,
  User,
  Trophy,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  label: string
  href: string
  icon: React.ReactNode
}

const navItems: NavItem[] = [
  { label: 'Feed', href: '/feed', icon: <LayoutDashboard className='h-4 w-4' /> },
  { label: 'Experiences', href: '/experiences', icon: <Briefcase className='h-4 w-4' /> },
  { label: 'Companies', href: '/companies', icon: <Building2 className='h-4 w-4' /> },
  { label: 'Resume', href: '/resume', icon: <FileText className='h-4 w-4' /> },
  { label: 'Applications', href: '/tracker', icon: <CheckSquare className='h-4 w-4' /> },
  { label: 'Leaderboard', href: '/leaderboard', icon: <Trophy className='h-4 w-4' /> },
]

const secondaryNavItems: NavItem[] = [
  { label: 'Notifications', href: '/notifications', icon: <Bell className='h-4 w-4' /> },
  { label: 'Profile', href: '/profile', icon: <User className='h-4 w-4' /> },
  { label: 'Settings', href: '/settings', icon: <Settings className='h-4 w-4' /> },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { clUser, logout } = useAuth()

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  const displayName = clUser?.full_name || 'User'
  const username = clUser?.username || 'user'
  const points = clUser?.points || 0
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <aside className='fixed left-0 top-0 z-30 flex h-screen w-64 flex-col border-r border-border bg-sidebar py-6'>
      {/* Logo */}
      <Link href='/feed' className='flex items-center gap-3 px-6 mb-8'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground'>
          <Briefcase className='h-5 w-5' />
        </div>
        <span className='text-lg font-bold text-sidebar-foreground'>CareerLens</span>
      </Link>

      {/* Primary Navigation */}
      <div className='flex-1 px-3 space-y-1'>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors relative',
              isActive(item.href)
                ? 'text-sidebar-primary-foreground bg-sidebar-primary'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* Divider */}
      <div className='mx-3 my-4 h-px bg-sidebar-border' />

      {/* Secondary Navigation */}
      <div className='px-3 space-y-1 mb-6'>
        {secondaryNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              isActive(item.href)
                ? 'text-sidebar-primary-foreground bg-sidebar-primary'
                : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* User Card */}
      <div className='border-t border-sidebar-border px-3 pt-4'>
        <div className='rounded-md bg-sidebar-accent/10 p-3 space-y-3'>
          <div className='flex items-center gap-2'>
            {clUser?.photo_url ? (
              <img
                src={clUser.photo_url}
                alt={displayName}
                className='h-8 w-8 rounded-full object-cover'
              />
            ) : (
              <div className='h-8 w-8 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center text-xs font-bold'>
                {initials}
              </div>
            )}
            <div>
              <p className='font-semibold text-sm text-sidebar-foreground truncate max-w-[140px]'>
                {displayName}
              </p>
              <p className='text-xs text-sidebar-foreground/60'>@{username}</p>
            </div>
          </div>
          <div className='flex items-center justify-between'>
            <Badge variant='warning' size='sm'>
              {points.toLocaleString()} pts
            </Badge>
            <button
              onClick={handleLogout}
              className='rounded-md p-1 hover:bg-sidebar-accent/20 transition-colors text-sidebar-foreground'
              title='Logout'
            >
              <LogOut className='h-4 w-4' />
            </button>
          </div>
        </div>
      </div>
    </aside>
  )
}
