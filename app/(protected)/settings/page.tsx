'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { User, Lock, Bell, Eye, Shield, LogOut } from 'lucide-react'

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
  const [activeTab, setActiveTab] = React.useState('profile')

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
                <Input label='Full Name' placeholder='Alex Johnson' />
                <Input label='Username' placeholder='alexjohnson' />
                <Input label='Email' placeholder='alex@example.com' />
                <Input label='Bio' placeholder='Tell us about yourself' />
                <Input label='College/Company' placeholder='MIT' />
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          )}

          {/* Account Settings */}
          {activeTab === 'account' && (
            <div className='space-y-4'>
              <Card>
                <CardHeader>
                  <CardTitle>Account Security</CardTitle>
                  <CardDescription>Manage your password and security settings</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Email</label>
                    <div className='flex items-center gap-2'>
                      <Input value='alex@example.com' disabled />
                      <Badge variant='success' size='sm'>Verified</Badge>
                    </div>
                  </div>
                  <Button variant='outline'>Change Password</Button>
                </CardContent>
              </Card>

              <Card className='border-destructive'>
                <CardHeader>
                  <CardTitle className='text-destructive'>Danger Zone</CardTitle>
                  <CardDescription>Irreversible actions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant='destructive'>Delete Account</Button>
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
                  <div
                    key={i}
                    className='flex items-center justify-between p-3 rounded-lg border border-border'
                  >
                    <span className='text-sm font-medium'>{pref.label}</span>
                    <input
                      type='checkbox'
                      defaultChecked={pref.enabled}
                      className='h-4 w-4 rounded'
                    />
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
                  <div
                    key={i}
                    className='flex items-center justify-between p-3 rounded-lg border border-border'
                  >
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
