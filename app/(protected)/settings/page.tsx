'use client'

import React, { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { User, Lock, Bell, Eye, Camera, CheckCircle2 } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { usersApi } from '@/lib/api'

interface SettingsTab {
  id: string
  label: string
  icon: React.ReactNode
}

const settingsTabs: SettingsTab[] = [
  { id: 'profile', label: 'Profile', icon: <User className='h-4 w-4' /> },
  { id: 'account', label: 'Account', icon: <Lock className='h-4 w-4' /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className='h-4 w-4' /> },
  { id: 'privacy', label: 'Privacy', icon: <Eye className='h-4 w-4' /> },
]

export default function SettingsPage() {
  const { clUser, refreshUser, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState({
    full_name: clUser?.full_name || '',
    username: clUser?.username || '',
    bio: clUser?.bio || '',
    college: clUser?.college || '',
    graduation_year: '',
    current_company: clUser?.current_company || '',
    current_role: clUser?.current_role || '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    open_to_opportunities: clUser?.open_to_opportunities || false,
  })

  // Sync form with clUser when it loads
  React.useEffect(() => {
    if (clUser) {
      setForm({
        full_name: clUser.full_name || '',
        username: clUser.username || '',
        bio: clUser.bio || '',
        college: clUser.college || '',
        graduation_year: '',
        current_company: clUser.current_company || '',
        current_role: clUser.current_role || '',
        location: '',
        linkedin_url: '',
        github_url: '',
        portfolio_url: '',
        open_to_opportunities: clUser.open_to_opportunities || false,
      })
    }
  }, [clUser])

  const handleSaveProfile = async () => {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const updates: Record<string, any> = {}
      if (form.full_name) updates.full_name = form.full_name
      if (form.username) updates.username = form.username
      updates.bio = form.bio
      updates.college = form.college
      updates.current_company = form.current_company
      updates.current_role = form.current_role
      updates.location = form.location
      updates.linkedin_url = form.linkedin_url
      updates.github_url = form.github_url
      updates.portfolio_url = form.portfolio_url
      updates.open_to_opportunities = form.open_to_opportunities

      await usersApi.updateProfile(updates)
      await refreshUser()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await usersApi.uploadAvatar(file)
      await refreshUser()
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar')
    }
  }

  const initials = clUser?.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-3xl font-bold text-foreground'>Settings</h1>
        <p className='text-muted-foreground'>Manage your account and preferences</p>
      </div>

      <div className='grid md:grid-cols-4 gap-6'>
        {/* Sidebar Navigation */}
        <div className='md:col-span-1'>
          <div className='space-y-1 sticky top-20'>
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-left ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className='md:col-span-3 space-y-6'>
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>Update your profile information</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Avatar */}
                <div className='flex items-center gap-4'>
                  <input ref={fileInputRef} type='file' accept='image/*' className='hidden' onChange={handleAvatarUpload} />
                  {clUser?.photo_url ? (
                    <img src={clUser.photo_url} alt='' className='h-16 w-16 rounded-full object-cover' />
                  ) : (
                    <div className='h-16 w-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold'>
                      {initials}
                    </div>
                  )}
                  <Button variant='outline' size='sm' onClick={() => fileInputRef.current?.click()} className='gap-2'>
                    <Camera className='h-4 w-4' />
                    Change Avatar
                  </Button>
                </div>

                {error && <p className='text-sm text-destructive'>{error}</p>}
                {saved && (
                  <div className='flex items-center gap-2 text-sm text-green-600'>
                    <CheckCircle2 className='h-4 w-4' />
                    Profile saved successfully!
                  </div>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium mb-1 block'>Full Name</label>
                    <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                  </div>
                  <div>
                    <label className='text-sm font-medium mb-1 block'>Username</label>
                    <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium mb-1 block'>Bio</label>
                  <Input value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder='Tell us about yourself' />
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium mb-1 block'>College</label>
                    <Input value={form.college} onChange={(e) => setForm({ ...form, college: e.target.value })} />
                  </div>
                  <div>
                    <label className='text-sm font-medium mb-1 block'>Location</label>
                    <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-sm font-medium mb-1 block'>Current Company</label>
                    <Input value={form.current_company} onChange={(e) => setForm({ ...form, current_company: e.target.value })} />
                  </div>
                  <div>
                    <label className='text-sm font-medium mb-1 block'>Current Role</label>
                    <Input value={form.current_role} onChange={(e) => setForm({ ...form, current_role: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className='text-sm font-medium mb-1 block'>LinkedIn URL</label>
                  <Input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder='https://linkedin.com/in/...' />
                </div>
                <div>
                  <label className='text-sm font-medium mb-1 block'>GitHub URL</label>
                  <Input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder='https://github.com/...' />
                </div>
                <div>
                  <label className='flex items-center gap-2 cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={form.open_to_opportunities}
                      onChange={(e) => setForm({ ...form, open_to_opportunities: e.target.checked })}
                      className='h-4 w-4 rounded'
                    />
                    <span className='text-sm'>Open to opportunities</span>
                  </label>
                </div>

                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Manage your account</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Email</label>
                    <div className='flex items-center gap-2'>
                      <Input value={clUser?.email || ''} disabled />
                      <Badge variant='success' size='sm'>Verified</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='border-destructive'>
                <CardHeader>
                  <CardTitle className='text-destructive'>Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant='destructive' onClick={logout}>
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notification Settings */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {[
                  { label: 'Email notifications', enabled: true },
                  { label: 'Post likes and comments', enabled: true },
                  { label: 'New followers', enabled: false },
                  { label: 'Weekly digest', enabled: true },
                ].map((pref, i) => (
                  <div key={i} className='flex items-center justify-between p-3 rounded-lg border border-border'>
                    <span className='text-sm font-medium'>{pref.label}</span>
                    <input type='checkbox' defaultChecked={pref.enabled} className='h-4 w-4 rounded' />
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Privacy Settings */}
          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>Control who can see your information</CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                {[
                  { label: 'Profile visibility', value: 'Public' },
                  { label: 'Show my experiences', value: 'Everyone' },
                  { label: 'Allow messages', value: 'Friends only' },
                ].map((setting, i) => (
                  <div key={i} className='flex items-center justify-between p-3 rounded-lg border border-border'>
                    <span className='text-sm font-medium'>{setting.label}</span>
                    <Badge variant='outline' size='sm'>{setting.value}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
