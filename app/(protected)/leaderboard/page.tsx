'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Medal } from 'lucide-react'
import { leaderboardApi } from '@/lib/api'

interface LeaderboardUser {
  username: string
  full_name: string
  photo_url?: string
  college?: string
  current_company?: string
  points: number
}

function Podium({ users }: { users: LeaderboardUser[] }) {
  if (users.length < 3) return null
  const [first, second, third] = users

  const renderPodiumUser = (user: LeaderboardUser, rank: number) => {
    const initials = user.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
    const sizes = rank === 1 ? { box: 'h-32 w-32 text-3xl', color: 'from-yellow-400 to-yellow-500 border-yellow-500' }
      : rank === 2 ? { box: 'h-24 w-24 text-2xl', color: 'from-slate-400 to-slate-500 border-slate-500' }
      : { box: 'h-24 w-24 text-2xl', color: 'from-orange-400 to-orange-500 border-orange-500' }
    const pointColor = rank === 1 ? 'text-yellow-500' : rank === 2 ? 'text-slate-500' : 'text-orange-500'

    return (
      <div className='flex flex-col items-center'>
        {rank === 1 && <div className='text-5xl mb-2'>👑</div>}
        <div className='relative mb-4'>
          {user.photo_url ? (
            <img src={user.photo_url} alt={user.full_name} className={`${sizes.box} rounded-lg object-cover border-4 ${sizes.color.split(' ').pop()}`} />
          ) : (
            <div className={`${sizes.box} rounded-lg bg-gradient-to-br ${sizes.color} flex items-center justify-center text-white font-bold border-4`}>
              {initials}
            </div>
          )}
          {rank === 1 ? (
            <Trophy className='absolute -top-4 -right-4 h-12 w-12 text-yellow-500 fill-yellow-500' />
          ) : (
            <Medal className={`absolute -top-2 -right-2 h-8 w-8 ${rank === 2 ? 'text-slate-400 fill-slate-400' : 'text-orange-400 fill-orange-400'}`} />
          )}
        </div>
        <Link href={`/profile/${user.username}`}>
          <h3 className='font-bold text-center hover:underline'>{user.full_name}</h3>
        </Link>
        <p className='text-sm text-muted-foreground'>{user.college || user.current_company || ''}</p>
        <p className={`text-lg font-bold mt-2 ${pointColor}`}>{user.points?.toLocaleString()} pts</p>
      </div>
    )
  }

  return (
    <div className='mb-12'>
      <div className='flex items-end justify-center gap-8 mb-8 min-h-64'>
        {renderPodiumUser(second, 2)}
        {renderPodiumUser(first, 1)}
        {renderPodiumUser(third, 3)}
      </div>
    </div>
  )
}

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadLeaderboard(1)
  }, [])

  const loadLeaderboard = async (pageNum: number) => {
    setLoading(pageNum === 1)
    try {
      const data = await leaderboardApi.get(pageNum)
      // Backend returns { leaderboard: [...], page, has_more }
      const list: LeaderboardUser[] = Array.isArray(data)
        ? data
        : Array.isArray(data?.leaderboard)
        ? data.leaderboard
        : Array.isArray(data?.users)
        ? data.users
        : []
      if (pageNum === 1) {
        setUsers(list)
      } else {
        setUsers((prev) => [...prev, ...list])
      }
      setHasMore(data.has_more || false)
      setPage(pageNum)
    } catch (e) {
      console.error('Failed to load leaderboard', e)
    } finally {
      setLoading(false)
    }
  }

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

        {loading ? (
          <div className='space-y-4'>
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className='pt-6'>
                  <div className='animate-pulse flex items-center gap-4'>
                    <div className='h-8 w-8 bg-muted rounded-full' />
                    <div className='flex-1 space-y-2'>
                      <div className='h-4 bg-muted rounded w-1/3' />
                      <div className='h-3 bg-muted rounded w-1/4' />
                    </div>
                    <div className='h-6 bg-muted rounded w-16' />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : users.length === 0 ? (
          <Card>
            <CardContent className='pt-12 pb-12 text-center'>
              <Trophy className='h-12 w-12 mx-auto text-muted-foreground mb-4' />
              <p className='text-muted-foreground'>No leaderboard data yet. Share experiences to earn points!</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Podium */}
            <Podium users={users} />

            {/* Full Table */}
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
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, i) => {
                        const initials = user.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
                        const rank = i + 1
                        return (
                          <tr
                            key={user.username || i}
                            className={`border-b border-border hover:bg-muted/50 transition-colors ${rank === 1 ? 'bg-yellow-50 dark:bg-yellow-950/20' : ''}`}
                          >
                            <td className='py-3 px-4'>
                              {rank <= 3 ? (
                                <span className='text-lg font-bold'>
                                  {rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'} #{rank}
                                </span>
                              ) : (
                                <span className='font-bold'>#{rank}</span>
                              )}
                            </td>
                            <td className='py-3 px-4'>
                              <Link href={`/profile/${user.username}`} className='flex items-center gap-3 hover:underline'>
                                {user.photo_url ? (
                                  <img src={user.photo_url} alt='' className='h-8 w-8 rounded-full object-cover' />
                                ) : (
                                  <div className='h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary'>
                                    {initials}
                                  </div>
                                )}
                                <div>
                                  <p className='font-medium'>{user.full_name}</p>
                                  <p className='text-xs text-muted-foreground'>@{user.username}</p>
                                </div>
                              </Link>
                            </td>
                            <td className='py-3 px-4 text-sm'>{user.college || user.current_company || '—'}</td>
                            <td className='py-3 px-4'>
                              <span className='font-bold'>{user.points?.toLocaleString()}</span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {hasMore && (
              <div className='mt-4 text-center'>
                <Button variant='outline' onClick={() => loadLeaderboard(page + 1)}>
                  Load More
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
