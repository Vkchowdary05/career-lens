'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Link as LinkIcon, ArrowLeft } from 'lucide-react'
import { usersApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'

interface UserProfile {
  id: string
  username: string
  full_name: string
  email: string
  photo_url?: string
  bio?: string
  college?: string
  current_company?: string
  current_role?: string
  location?: string
  linkedin_url?: string
  github_url?: string
  portfolio_url?: string
  open_to_opportunities: boolean
  points: number
  followers_count: number
  following_count: number
  is_following?: boolean
}

export default function UserProfilePage() {
  const params = useParams()
  const username = params.username as string
  const { clUser: me } = useAuth()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [following, setFollowing] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [username])

  const loadProfile = async () => {
    setLoading(true)
    try {
      const data = await usersApi.getProfile(username)
      setUser(data)
      setFollowing(data.is_following || false)
    } catch (e) {
      console.error('Failed to load profile', e)
    } finally {
      setLoading(false)
    }
  }

  const handleFollow = async () => {
    if (!user) return
    setFollowing(!following)
    try {
      await usersApi.toggleFollow(username)
    } catch {
      setFollowing(following)
    }
  }

  if (loading) {
    return (
      <div className='p-6'>
        <div className='animate-pulse space-y-4'>
          <div className='h-32 bg-muted rounded-lg' />
          <div className='h-24 w-24 bg-muted rounded-lg -mt-12 ml-6' />
          <div className='h-8 bg-muted rounded w-48' />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className='p-6 text-center py-20'>
        <p className='text-muted-foreground text-lg'>User not found</p>
        <Link href='/feed' className='mt-4 inline-block'>
          <Button variant='outline'>← Back to Feed</Button>
        </Link>
      </div>
    )
  }

  const isMe = me?.username === username
  const initials = user.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className='space-y-6 p-6'>
      <Link href='/feed' className='inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground'>
        <ArrowLeft className='h-4 w-4' />
        Back
      </Link>

      {/* Profile Header */}
      <div className='relative'>
        <div className='h-32 bg-gradient-to-r from-primary to-accent rounded-lg' />
        <div className='px-6 pb-6'>
          <div className='flex flex-col sm:flex-row items-end gap-4 -mt-16 relative z-10'>
            {user.photo_url ? (
              <img src={user.photo_url} alt={user.full_name} className='h-24 w-24 rounded-lg object-cover border-4 border-background' />
            ) : (
              <div className='h-24 w-24 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold border-4 border-background'>
                {initials}
              </div>
            )}
            <div className='flex-1'>
              <h1 className='text-3xl font-bold text-foreground'>{user.full_name}</h1>
              <p className='text-muted-foreground'>
                @{user.username}
                {user.college && ` • ${user.college}`}
                {user.location && ` • ${user.location}`}
              </p>
            </div>
            {isMe ? (
              <Link href='/settings'>
                <Button variant='outline'>Edit Profile</Button>
              </Link>
            ) : (
              <Button variant={following ? 'outline' : 'default'} onClick={handleFollow}>
                {following ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bio & Stats */}
      <Card>
        <CardContent className='pt-6 space-y-4'>
          {user.bio && <p className='text-foreground'>{user.bio}</p>}
          {user.current_company && (
            <p className='text-sm text-muted-foreground'>
              {user.current_role ? `${user.current_role} at ` : ''}{user.current_company}
            </p>
          )}
          <div className='flex flex-wrap gap-2'>
            {user.github_url && <Badge variant='outline' size='sm' icon={<LinkIcon className='h-3 w-3' />}>GitHub</Badge>}
            {user.linkedin_url && <Badge variant='outline' size='sm' icon={<LinkIcon className='h-3 w-3' />}>LinkedIn</Badge>}
            {user.open_to_opportunities && <Badge variant='secondary' size='sm'>Open to Opportunities</Badge>}
          </div>
          <div className='grid grid-cols-3 gap-4 pt-4 border-t border-border'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-primary'>{(user.points || 0).toLocaleString()}</div>
              <div className='text-xs text-muted-foreground'>Points</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-secondary'>{user.followers_count || 0}</div>
              <div className='text-xs text-muted-foreground'>Followers</div>
            </div>
            <div className='text-center'>
              <div className='text-2xl font-bold text-blue-500'>{user.following_count || 0}</div>
              <div className='text-xs text-muted-foreground'>Following</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
