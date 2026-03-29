'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Trophy, Medal } from 'lucide-react'

interface User {
  rank: number
  name: string
  username: string
  college: string
  points: number
  experiences: number
  badges: string[]
  avatar: string
}

const leaderboardData: User[] = [
  {
    rank: 1,
    name: 'Alice Chen',
    username: '@alicechen',
    college: 'Stanford',
    points: 4850,
    experiences: 28,
    badges: ['Expert', 'Top Contributor'],
    avatar: 'AC',
  },
  {
    rank: 2,
    name: 'Bob Smith',
    username: '@bobsmith',
    college: 'MIT',
    points: 4120,
    experiences: 23,
    badges: ['Power User'],
    avatar: 'BS',
  },
  {
    rank: 3,
    name: 'Carol Davis',
    username: '@caroldavis',
    college: 'Carnegie Mellon',
    points: 3890,
    experiences: 21,
    badges: ['Engaged'],
    avatar: 'CD',
  },
  {
    rank: 4,
    name: 'David Lee',
    username: '@davidlee',
    college: 'Berkeley',
    points: 3450,
    experiences: 18,
    badges: [],
    avatar: 'DL',
  },
  {
    rank: 5,
    name: 'Emma Wilson',
    username: '@emmawilson',
    college: 'Princeton',
    points: 3120,
    experiences: 15,
    badges: [],
    avatar: 'EW',
  },
  {
    rank: 6,
    name: 'Frank Johnson',
    username: '@frankjohnson',
    college: 'Yale',
    points: 2890,
    experiences: 12,
    badges: [],
    avatar: 'FJ',
  },
  {
    rank: 7,
    name: 'Grace Martinez',
    username: '@gracemartinez',
    college: 'Stanford',
    points: 2650,
    experiences: 10,
    badges: [],
    avatar: 'GM',
  },
  {
    rank: 8,
    name: 'Henry Brown',
    username: '@henrybrown',
    college: 'Harvard',
    points: 2420,
    experiences: 8,
    badges: [],
    avatar: 'HB',
  },
]

function Podium() {
  const [first, second, third] = leaderboardData.slice(0, 3)

  return (
    <div className='mb-12'>
      <div className='flex items-flex-end justify-center gap-4 mb-8 min-h-64'>
        {/* Second Place */}
        <div className='flex flex-col items-center'>
          <div className='relative mb-4'>
            <div className='h-24 w-24 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-slate-500'>
              {second.avatar}
            </div>
            <Medal className='absolute -top-2 -right-2 h-8 w-8 text-slate-400 fill-slate-400' />
          </div>
          <h3 className='font-bold text-center'>{second.name}</h3>
          <p className='text-sm text-muted-foreground'>{second.college}</p>
          <p className='text-lg font-bold text-slate-500 mt-2'>{second.points} pts</p>
        </div>

        {/* First Place */}
        <div className='flex flex-col items-center'>
          <div className='text-5xl mb-2'>👑</div>
          <div className='relative mb-4'>
            <div className='h-32 w-32 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-yellow-500'>
              {first.avatar}
            </div>
            <Trophy className='absolute -top-4 -right-4 h-12 w-12 text-yellow-500 fill-yellow-500' />
          </div>
          <h3 className='font-bold text-center text-lg'>{first.name}</h3>
          <p className='text-sm text-muted-foreground'>{first.college}</p>
          <p className='text-xl font-bold text-yellow-500 mt-2'>{first.points} pts</p>
        </div>

        {/* Third Place */}
        <div className='flex flex-col items-center'>
          <div className='relative mb-4'>
            <div className='h-24 w-24 rounded-lg bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold border-4 border-orange-500'>
              {third.avatar}
            </div>
            <Medal className='absolute -top-2 -right-2 h-8 w-8 text-orange-400 fill-orange-400' />
          </div>
          <h3 className='font-bold text-center'>{third.name}</h3>
          <p className='text-sm text-muted-foreground'>{third.college}</p>
          <p className='text-lg font-bold text-orange-500 mt-2'>{third.points} pts</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {leaderboardData.slice(0, 3).map((user) => (
          <Card key={user.rank}>
            <CardContent className='pt-6'>
              <div className='text-center space-y-2'>
                <div className='text-3xl font-bold'>#{user.rank}</div>
                <p className='font-semibold'>{user.name}</p>
                <p className='text-sm text-muted-foreground'>{user.experiences} experiences shared</p>
                <Badge variant='secondary' className='mt-2'>{user.points} points</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const [timeFilter, setTimeFilter] = useState('month')
  const [filteredData] = useState(leaderboardData)

  return (
    <div className='min-h-screen bg-background p-6'>
      <div className='max-w-6xl mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold mb-2'>Leaderboard</h1>
          <p className='text-muted-foreground'>
            Top contributors making an impact in the CareerLens community
          </p>
        </div>

        {/* Time Filter */}
        <div className='mb-8'>
          <Tabs value={timeFilter} onValueChange={setTimeFilter}>
            <TabsList>
              <TabsTrigger value='week'>This Week</TabsTrigger>
              <TabsTrigger value='month'>This Month</TabsTrigger>
              <TabsTrigger value='alltime'>All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Podium */}
        <Podium />

        {/* Full Leaderboard Table */}
        <Card>
          <CardHeader>
            <CardTitle>Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='border-b border-border'>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Rank</th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Name</th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>College/Company</th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Points</th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Experiences</th>
                    <th className='text-left py-3 px-4 font-medium text-muted-foreground'>Badges</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((user) => (
                    <tr
                      key={user.rank}
                      className={`border-b border-border hover:bg-muted/50 transition-colors ${
                        user.rank === 1 ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''
                      }`}
                    >
                      <td className='py-3 px-4'>
                        {user.rank <= 3 ? (
                          <div className='flex items-center gap-2'>
                            <span className='text-lg font-bold'>
                              {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : '🥉'}
                            </span>
                            <span className='font-bold'>#{user.rank}</span>
                          </div>
                        ) : (
                          <span className='font-bold'>#{user.rank}</span>
                        )}
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex items-center gap-3'>
                          <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary'>
                            {user.avatar}
                          </div>
                          <div>
                            <p className='font-medium'>{user.name}</p>
                            <p className='text-xs text-muted-foreground'>{user.username}</p>
                          </div>
                        </div>
                      </td>
                      <td className='py-3 px-4 text-sm'>{user.college}</td>
                      <td className='py-3 px-4'>
                        <span className='font-bold'>{user.points}</span>
                      </td>
                      <td className='py-3 px-4'>
                        <Badge variant='outline'>{user.experiences}</Badge>
                      </td>
                      <td className='py-3 px-4'>
                        <div className='flex gap-1 flex-wrap'>
                          {user.badges.length > 0 ? (
                            user.badges.map((badge) => (
                              <Badge key={badge} variant='secondary' className='text-xs'>
                                {badge}
                              </Badge>
                            ))
                          ) : (
                            <span className='text-xs text-muted-foreground'>-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
